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
import { TableCell, TableRow } from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Loader2Icon, PencilIcon, XIcon } from "lucide-react";
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
        <div>
          <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <PencilIcon />
              </Button>
            </DialogTrigger>

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
                    {isLoading && <Loader2Icon className="animate-spin" />}
                    {isLoading ? "Submitting..." : "Submit"}
                  </Button>
                </DialogFooter>
              </CustomerForm>
            </DialogContent>
          </Dialog>

          <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <XIcon />
              </Button>
            </AlertDialogTrigger>
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
                  {isDeleting && <Loader2Icon className="animate-spin" />}
                  {isDeleting ? "Deleting..." : "Delete Customer"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};
