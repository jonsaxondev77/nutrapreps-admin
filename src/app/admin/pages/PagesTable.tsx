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
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import TableSkeleton from "@/components/tables/TableSkeleton";

export default function PagesTable() {
  const { data: pages, error, isLoading } = useGetAllPagesQuery();

  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001";

  if (isLoading) {
    return <TableSkeleton columns={4} rows={10} />;
  }
  if (error) return <div>Error loading pages</div>;

  return (
    <>
      <PageBreadcrumb pageTitle="Pages" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Title</TableCell>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Path</TableCell>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Last Updated</TableCell>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
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
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}