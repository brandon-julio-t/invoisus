"use client";

import Link from "@/components/link";
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
import { Field, FieldGroup, FieldSet } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
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
  UploadIcon,
  XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { parseAsString, useQueryState } from "nuqs";
import React from "react";
import { toast } from "sonner";
import { CustomerForm, CustomerFormProps } from "../_components/customer-form";
import { CustomerTableRow } from "./_components/customer-table-row";
import { Spinner } from "@/components/ui/spinner";

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

  const isLoadingMore = paginatedQuery.status === "LoadingMore";
  const canLoadMore = paginatedQuery.status === "CanLoadMore";
  const isLoadingFirstPage = paginatedQuery.status === "LoadingFirstPage";

  const onLoadMore = () => {
    if (canLoadMore) {
      paginatedQuery.loadMore(ITEMS_PER_PAGE / 2);
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
                <Button variant="outline">
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

      <section>
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
            {isLoadingFirstPage ? (
              <>
                <TableSkeletonRow />
                <TableSkeletonRow />
                <TableSkeletonRow />
                <TableSkeletonRow />
                <TableSkeletonRow />
              </>
            ) : paginatedQuery.results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  <p className="text-muted-foreground">No customers found</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedQuery.results.map((customer) => (
                <CustomerTableRow key={customer._id} customer={customer} />
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingMore || !canLoadMore}
            variant="outline"
            asChild
          >
            <motion.button onViewportEnter={onLoadMore}>
              {isLoadingMore ? (
                <>
                  <Spinner />
                  Loading...
                </>
              ) : !canLoadMore ? (
                "No more customers"
              ) : (
                "Load More"
              )}
            </motion.button>
          </Button>
        </div>
      </section>
    </div>
  );
};

const TableSkeletonRow = () => (
  <TableRow>
    <TableCell className="w-1">
      <Skeleton className="h-4 w-4" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-16" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-32" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell className="w-1">
      <Skeleton className="h-4 w-4" />
    </TableCell>
  </TableRow>
);

export default CustomersListPage;
