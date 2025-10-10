"use client";

import Link from "@/components/link";
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
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/kibo-ui/dropzone";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { parseFileWithXlsx } from "@/lib/excel";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import {
  ArrowLeftIcon,
  CheckIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "@/components/link";
import React, { useState } from "react";
import { toast } from "sonner";
import z from "zod";

const rowSchema = z.object({
  number: z.union([z.string(), z.number()]).transform(String),
  type: z.string(),
  name: z.string(),
  group: z.string(),
});

type RowSchemaType = z.infer<typeof rowSchema>;

type ParsedDataType = Array<
  z.ZodSafeParseResult<RowSchemaType> & {
    originalData: Partial<RowSchemaType> | null | undefined;
  }
>;

const CustomersImportPage = () => {
  const [parsedData, setParsedData] = useState<ParsedDataType>([]);

  const validRows = React.useMemo(() => {
    return parsedData.filter((row) => row.success);
  }, [parsedData]);

  const invalidRows = React.useMemo(() => {
    return parsedData.filter((row) => !row.success);
  }, [parsedData]);

  const onFileDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      toast.error("No file selected", {
        description: "Please select a file to import",
      });
      return;
    }

    const rows = await toast
      .promise(parseFileWithXlsx({ file }), {
        loading: "Parsing file...",
        success: "File parsed successfully",
        error: "Failed to parse file",
      })
      .unwrap();

    const parsedData = await toast
      .promise(
        Promise.all(
          rows.map(async (row) => {
            const parsed = await rowSchema.safeParseAsync(row);
            return {
              ...parsed,
              originalData: row as ParsedDataType[number]["originalData"],
            } satisfies ParsedDataType[number];
          }),
        ),
        {
          loading: "Parsing rows...",
          success: "Row parsed successfully",
          error: "Failed to parse rows",
        },
      )
      .unwrap();

    setParsedData(parsedData);
  };

  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [isImporting, startImporting] = React.useTransition();
  const importCustomers = useMutation(
    api.domains.customers.mutations.importCustomers,
  );
  const router = useRouter();
  const handleImport = async () => {
    setShowConfirmDialog(false);

    const validRows = parsedData
      .filter((row) => row.success)
      .map((row) => ({
        number: row.data.number,
        name: row.data.name,
        group: row.data.group,
        problemType: row.data.type,
      }));

    if (validRows.length === 0) {
      toast.error("No valid customers to import");
      return;
    }

    startImporting(async () => {
      await toast
        .promise(importCustomers({ customers: validRows }), {
          loading: "Importing customers...",
          success: `Successfully imported ${validRows.length} customers`,
          error: "Failed to import customers",
        })
        .unwrap();

      router.push("/customers/list");
    });
  };

  const clearSelection = () => {
    setParsedData([]);
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div>
        <Button variant="ghost" className="-mx-4" asChild>
          <Link href="/customers/list">
            <ArrowLeftIcon />
            Back to Customers
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Import Customers</h1>
        <p className="text-muted-foreground">
          Upload an Excel or CSV file to bulk import your customers into the
          system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheetIcon className="size-(--text-base)" />
            File Upload
          </CardTitle>
          <CardDescription>
            Select an Excel (.xlsx, .xls) or CSV file containing your customer
            data with columns: number, type, name, and group.
          </CardDescription>
          <CardAction>
            <Button variant="outline" asChild>
              <a
                href="/customers-import-bulk-template.xlsx"
                download="customers-import-template.xlsx"
              >
                <DownloadIcon />
                Download Template
              </a>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <Dropzone
            accept={{
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"],
              "application/vnd.ms-excel": [".xls"],
              "text/csv": [".csv"],
            }}
            maxFiles={1}
            onDrop={onFileDrop}
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </CardContent>

        {parsedData.length > 0 && (
          <CardFooter className="flex flex-col items-stretch gap-2 md:flex-row md:justify-end">
            <Button
              variant="outline"
              onClick={clearSelection}
              disabled={isImporting}
            >
              Clear
            </Button>

            <AlertDialog
              open={showConfirmDialog}
              onOpenChange={setShowConfirmDialog}
            >
              <AlertDialogTrigger asChild>
                <Button disabled={validRows.length === 0 || isImporting}>
                  {isImporting ? <Spinner /> : <UploadIcon />}
                  Import Valid Customers ({validRows.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Import Customers</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to import {validRows.length} valid
                    customers? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleImport}>
                    <UploadIcon />
                    Import Customers
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {parsedData.length === 0
              ? "File Format Requirements"
              : "Parsed Data Preview"}
          </CardTitle>
          <CardDescription>
            {parsedData.length === 0
              ? "Ensure your file follows the correct format for successful import."
              : "Review the parsed data before importing."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {parsedData.length === 0 ? (
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Expected Columns:</h4>
                <ul className="text-muted-foreground list-inside list-disc text-sm">
                  <li>
                    <strong>number</strong> - Customer number/ID
                  </li>
                  <li>
                    <strong>type</strong> - Customer type
                  </li>
                  <li>
                    <strong>name</strong> - Customer name
                  </li>
                  <li>
                    <strong>group</strong> - Customer group/category
                  </li>
                </ul>
              </div>
              <div className="text-muted-foreground text-xs">
                <strong>Note:</strong> The first row should contain column
                headers. All columns are required for successful import. Empty
                rows will be automatically skipped.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <div className="text-success flex items-center gap-1">
                  <CheckIcon className="size-(--text-sm)" />{" "}
                  <span>{validRows.length} valid rows</span>
                </div>
                <div className="text-destructive flex items-center gap-1">
                  <XIcon className="size-(--text-sm)" />{" "}
                  <span>{invalidRows.length} invalid rows</span>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1 text-right">#</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((row, index) => (
                    <TableRow
                      key={index}
                      className={cn(
                        !row.success &&
                          "bg-destructive/5 hover:bg-destructive/10 text-destructive",
                      )}
                    >
                      <TableCell className="text-right font-medium">
                        {index + 1}.
                      </TableCell>
                      <TableCell>
                        {row.success
                          ? row.data.number
                          : (row.originalData?.number ?? "Invalid")}
                      </TableCell>
                      <TableCell>
                        {row.success
                          ? row.data.type
                          : (row.originalData?.type ?? "Invalid")}
                      </TableCell>
                      <TableCell>
                        {row.success
                          ? row.data.name
                          : (row.originalData?.name ?? "Invalid")}
                      </TableCell>
                      <TableCell>
                        {row.success
                          ? row.data.group
                          : (row.originalData?.group ?? "Invalid")}
                      </TableCell>
                      <TableCell className="text-xs">
                        {row.success ? (
                          ""
                        ) : (
                          <ul className="list-inside list-disc">
                            {row.error.issues.map((issue, i) => (
                              <li key={i}>
                                {issue.path.join(".")}: {issue.message}
                              </li>
                            ))}
                          </ul>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersImportPage;
