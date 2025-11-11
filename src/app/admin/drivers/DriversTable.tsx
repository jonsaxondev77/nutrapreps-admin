// src/app/admin/drivers/DriversTable.tsx
'use client';

import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetDriversQuery } from '@/lib/services/driversApi';
import TableSkeleton from '@/components/tables/TableSkeleton';
import Pagination from '@/components/tables/Pagination';
import Button from '@/components/ui/button/Button';
import InputFieldCustom from '@/components/form/input/InputFieldCustom';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';

import { Driver } from '@/types/drivers';
import DriverModal from './DriversModal';
import { DriversDeleteModal } from './DriversDeleteModal';
import { useModal } from '@/hooks/useModal';


const PAGE_SIZE = 10;

const DriversTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  // Define the query parameters to match the RTK slice interface
  const queryParams = {
    pageNumber: page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
  };

  const { data, isLoading, isFetching, error } = useGetDriversQuery(queryParams);

  const { isOpen: isModalOpen, openModal, closeModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDelete, closeModal: closeDelete } = useModal();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    openModal();
  };

  const handleCreate = () => {
    setSelectedDriver(null);
    openModal();
  };

  const handleDelete = (driver: Driver) => {
    setSelectedDriver(driver);
    openDelete();
  };

  if (isLoading) return <TableSkeleton cols={5} rows={PAGE_SIZE} />;
  
  // CRITICAL CORRECTION: Access data from the 'data' property of PagedResponse<T>
  const drivers = data?.data || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1; 

  console.log(drivers);

  return (
    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-6 xl:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div className="w-full sm:w-1/3">
          <InputFieldCustom
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto" variant="outline">
          <PlusIcon className="w-4 h-4 mr-1" />
          Add Driver
        </Button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">ID</th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">First Name</th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Surname</th>
              <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">Email Address</th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Phone Number</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length > 0 ? (
              drivers.map((driver) => (
                <tr key={driver.id}>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark xl:pl-11">
                    <p className="text-black dark:text-white">{driver.id}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{driver.firstName}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{driver.surname}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">{driver.emailAddress}</p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {driver.telephoneNumber || 'N/A'}
                    </p>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      <Button
                        variant="ghost"
                        color="secondary"
                        size="small"
                        onClick={() => handleEdit(driver)}
                      >
                        <PencilIcon className="w-4 h-4 text-primary hover:text-primary-dark" />
                      </Button>
                      <Button
                        variant="ghost"
                        color="secondary"
                        size="small"
                        onClick={() => handleDelete(driver)}
                      >
                        <TrashIcon className="w-4 h-4 text-danger hover:text-danger-dark" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  No drivers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {drivers.length} of {totalCount} results
        </p>
      </div>

      <DriverModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        driver={selectedDriver}
      />
      <DriversDeleteModal
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        driver={selectedDriver}
      />
    </div>
  );
};

export default DriversTable;