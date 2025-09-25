"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkflowDetailsType } from "./types";
import { WorkflowDetailsTableRow } from "./workflow-details-table-row";

export const WorkflowDetailsTable = ({
  details,
}: {
  details: WorkflowDetailsType;
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1">{/* expand row */}</TableHead>
          <TableHead>File Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-1">{/* download file */}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="hidden">
          <TableCell colSpan={5}>
            <p className="text-muted-foreground">
              {details.length} file{details.length !== 1 ? "s" : ""} in this
              workflow
            </p>
          </TableCell>
        </TableRow>

        {details.map((detail) => (
          <WorkflowDetailsTableRow key={detail._id} detail={detail} />
        ))}
      </TableBody>
    </Table>
  );
};
