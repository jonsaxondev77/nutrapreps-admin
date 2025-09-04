"use client";

import { useGetPackagesQuery } from '@/lib/services/packagesApi';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Pagination from '@/components/tables/Pagination';
import Button from '@/components/ui/button/Button';
import { PencilIcon } from '@/icons';
import PackageModal from './PackageModal';
import DeletePackageModal from './DeleteModal';
import { useState } from 'react';
import TableSkeleton from '@/components/tables/TableSkeleton';
import ErrorAlert from '@/components/common/ErrorAlert';

interface Package {
  id: number;
  name: string | null;
  description: string | null;
  price: number;
  mealsPerWeek: number;
  stripeProductId: string | null;
}

export default function PackagesTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, error, isLoading } = useGetPackagesQuery({
    page: currentPage,
    size: 10,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'create'>('create');

  const handleEditClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedPackage(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsDeleteModalOpen(true);
  };

  if (isLoading) {
    return <TableSkeleton columns={4} rows={10} />;
  }


  if (error) { // Use the new component for error display
    return <ErrorAlert error={error} title="Error loading packages" />;
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Packages" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <div className="flex flex-wrap items-center gap-3 xl:justify-start px-4 py-5 xl:px-6 xl:py-6">
              <Button size="sm" variant="primary" startIcon={<PencilIcon />} onClick={handleAddClick}>
                Add Package
              </Button>
            </div>
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Price</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Meals/Week</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {data?.data.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{pkg.name}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">£{pkg.price.toFixed(2)}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{pkg.mealsPerWeek}</TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-5">
                        <Button size="sm" onClick={() => handleEditClick(pkg)}>Edit</Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteClick(pkg)}>Delete</Button>
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
      <PackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pkg={selectedPackage}
        mode={modalMode}
      />
      <DeletePackageModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        pkg={selectedPackage}
      />
    </>
  );
}
