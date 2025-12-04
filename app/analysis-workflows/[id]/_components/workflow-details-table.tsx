"use client";

import {
  Table,
  TableBody,
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
          <TableHead>Status</TableHead>
          <TableHead>Problem Identification</TableHead>
          <TableHead className="w-1">{/* download file */}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {details.map((detail) => (
          <WorkflowDetailsTableRow key={detail._id} detail={detail} />
        ))}
      </TableBody>
    </Table>
  );
};
