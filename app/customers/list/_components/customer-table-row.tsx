"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Spinner } from "@/components/ui/spinner";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { PencilIcon, XIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import {
  CustomerForm,
  CustomerFormProps,
} from "../../_components/customer-form";

export const CustomerTableRow = ({
  customer,
}: {
  customer: Doc<"customers">;
}) => {
  const [openEdit, setOpenEdit] = React.useState(false);
  const [isLoading, startLoading] = React.useTransition();
  const updateCustomer = useMutation(
    api.domains.customers.mutations.updateCustomer,
  );
  const onUpdateCustomer: CustomerFormProps["onSubmit"] = async (data) => {
    startLoading(async () => {
      await toast
        .promise(updateCustomer({ id: customer._id, data }), {
          loading: "Updating customer...",
          success: "Customer updated successfully",
          error: "Failed to update customer",
        })
        .unwrap();

      setOpenEdit(false);
    });
  };

  const [openDelete, setOpenDelete] = React.useState(false);
  const [isDeleting, startDeleting] = React.useTransition();
  const deleteCustomer = useMutation(
    api.domains.customers.mutations.deleteCustomer,
  );
  const onDeleteCustomer = async () => {
    startDeleting(async () => {
      await toast
        .promise(deleteCustomer({ id: customer._id }), {
          loading: "Deleting customer...",
          success: "Customer deleted successfully",
          error: "Failed to delete customer",
        })
        .unwrap();

      setOpenDelete(false);
    });
  };

  return (
    <TableRow key={customer._id}>
      <TableCell className="font-mono">{customer.number}</TableCell>

      <TableCell>{customer.name}</TableCell>

      <TableCell>{customer.group}</TableCell>

      <TableCell>{customer.problemType}</TableCell>

      <TableCell className="w-1">
        <ButtonGroup>
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <PencilIcon />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Edit customer</TooltipContent>
            </Tooltip>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Customer</DialogTitle>
                <DialogDescription>
                  Edit the customer details.
                </DialogDescription>
              </DialogHeader>

              <CustomerForm
                onSubmit={onUpdateCustomer}
                defaultValues={customer}
              >
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isLoading}
                    >
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

          <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <XIcon />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Delete customer</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this customer?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={onDeleteCustomer}
                  disabled={isDeleting}
                >
                  {isDeleting && <Spinner />}
                  {isDeleting ? "Deleting..." : "Delete Customer"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ButtonGroup>
      </TableCell>
    </TableRow>
  );
};
