"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldSet } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { useDebounce } from "@uidotdev/usehooks";
import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import { useMutation } from "convex/react";
import {
  ChevronDownIcon,
  PlusIcon,
  SearchIcon,
  TelescopeIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import React from "react";
import { toast } from "sonner";
import type { CustomerFormProps } from "../_components/customer-form";
import { CustomerForm } from "../_components/customer-form";
import { CustomerTableRow } from "./_components/customer-table-row";

const ITEMS_PER_PAGE = 50;

const CustomersListPage = () => {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const debouncedSearch = useDebounce(search, 200);

  const paginatedQuery = usePaginatedQuery(
    api.domains.customers.queries.getCustomersListPaginated,
    {
      search: debouncedSearch,
    },
    { initialNumItems: ITEMS_PER_PAGE },
  );

  const onLoadMore = () => {
    if (paginatedQuery.status === "CanLoadMore") {
      paginatedQuery.loadMore(ITEMS_PER_PAGE * 2);
    }
  };

  const [openCreateDialog, setOpenCreateDialog] = React.useState(false);
  const [isLoading, startLoading] = React.useTransition();
  const createCustomer = useMutation(
    api.domains.customers.mutations.createCustomer,
  );
  const onCreateCustomer: CustomerFormProps["onSubmit"] = async (data) => {
    startLoading(async () => {
      await toast
        .promise(createCustomer(data), {
          loading: "Creating customer...",
          success: "Customer created successfully",
          error: "Failed to create customer",
        })
        .unwrap();

      setOpenCreateDialog(false);
    });
  };

  return (
    <div className="container flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-semibold">Customers</h1>

        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DropdownMenu>
            <ButtonGroup>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <PlusIcon />
                  Add Customer
                </Button>
              </DialogTrigger>

              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
            </ButtonGroup>

            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/customers/import">
                  <UploadIcon /> Import Bulk
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Single Customer</DialogTitle>
              <DialogDescription>
                Add a single customer to the database.
              </DialogDescription>
            </DialogHeader>

            <CustomerForm onSubmit={onCreateCustomer}>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isLoading}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Spinner />}
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </CustomerForm>
          </DialogContent>
        </Dialog>
      </header>

      <FieldSet>
        <FieldGroup>
          <Field>
            <InputGroup>
              <InputGroupAddon>
                {paginatedQuery.isLoading ? <Spinner /> : <SearchIcon />}
              </InputGroupAddon>

              <InputGroupInput
                placeholder="Search customers"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    onClick={() => setSearch("")}
                  >
                    <XIcon />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </Field>
        </FieldGroup>
      </FieldSet>

      {paginatedQuery.status === "LoadingFirstPage" ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Spinner />
            </EmptyMedia>
            <EmptyTitle>Loading customers...</EmptyTitle>
            <EmptyDescription>
              Please wait while we load your customers...
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : paginatedQuery.results.length <= 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TelescopeIcon />
            </EmptyMedia>
            <EmptyTitle>No customers found</EmptyTitle>
            <EmptyDescription>
              No customers found. Try changing the search query or contact
              support for help.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Problem Type</TableHead>
                <TableHead className="w-1">{/* actions */}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQuery.results.map((customer) => (
                <CustomerTableRow key={customer._id} customer={customer} />
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={onLoadMore}
              disabled={paginatedQuery.status !== "CanLoadMore"}
              variant="outline"
              asChild
            >
              <motion.button onViewportEnter={onLoadMore}>
                {paginatedQuery.isLoading && <Spinner />}
                {paginatedQuery.status === "CanLoadMore"
                  ? "Load More"
                  : "No more data"}
              </motion.button>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomersListPage;
