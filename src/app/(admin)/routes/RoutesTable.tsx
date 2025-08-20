"use client";
import React, { useState } from "react";
import { useGetAllRoutesQuery } from "@/lib/services/routesApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Pagination from "@/components/tables/Pagination";
import EditRouteModal from "./RouteModal";
import Button from "@/components/ui/button/Button";
import { PencilIcon } from "@/icons";
import RouteModal from "./RouteModal";
import DeleteRouteModal from "./DeleteModal";

interface Route {
  id: number;
  name: string | null;
  color: string | null;
  textColor: string | null;
  deliveryFee: number;
  depotId: string | null;
}

export default function RoutesTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, error, isLoading } = useGetAllRoutesQuery({
    pageNumber: currentPage,
    pageSize: 10,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'create'>('edit');

  const handleEditClick = (route: Route) => {
    setSelectedRoute(route);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedRoute(null);
    setModalMode('create');
    setIsModalOpen(true);
  }

  const handleDelete = (route: Route) => {
    setSelectedRoute(route);
    setIsDeleteModalOpen(true);
  };

  const handleRouteDeleted = () => {
    // Refresh your routes list or update state
    console.log('Route was deleted, refresh data...');
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading routes</div>;

  return (
    <>
      <PageBreadcrumb pageTitle="Routes" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <div className="flex flex-wrap items-center gap-3 xl:justify-start px-4 py-5 xl:px-6 xl:py-6">
              <Button size="sm" variant="primary" startIcon={<PencilIcon />} onClick={handleAddClick}>Add Route</Button>
            </div>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Name
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {data?.data.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                      {route.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-5">
                        <Button size="sm" onClick={() => handleEditClick(route)}>
                          Edit
                        </Button>
                        <Button size="sm" onClick={() => handleDelete(route)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        {data && (
          <Pagination
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      <RouteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        route={selectedRoute}
        mode={modalMode}
      />
      <DeleteRouteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        route={selectedRoute}
        onRouteDeleted={handleRouteDeleted}
      />
    </>
  );
}