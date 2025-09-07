// app/pages-client-table.tsx
"use client";

import React from "react";
import { useGetAllPagesQuery } from "@/lib/services/pagesApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import TableSkeleton from "@/components/tables/TableSkeleton";

// Define the props for your client component
interface PagesClientTableProps {
  frontendUrl: string;
}


export default function PagesClientTable({ frontendUrl }: PagesClientTableProps) {
  const { data: pages, error, isLoading } = useGetAllPagesQuery();

  if (isLoading) {
    return <TableSkeleton columns={4} rows={10} />;
  }
  if (error) return <div>Error loading pages</div>;

  return (
    <Table>
      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
        <TableRow>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Title</TableCell>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Path</TableCell>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Last Updated</TableCell>
          <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {pages?.map((page) => {
          const editHref = page.path === '/'
            ? `${frontendUrl}/edit`
            : `${frontendUrl}${page.path}/edit`;
          return (
            <TableRow key={page.path}>
              <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{page.title}</TableCell>
              <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{page.path}</TableCell>
              <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                <Link href={editHref} target="_blank">
                  <Button size="sm">Edit Page</Button>
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}