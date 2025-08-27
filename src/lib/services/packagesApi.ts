// src/lib/services/packagesApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getSession } from 'next-auth/react';
import { baseQueryWithRedirect } from './baseQuery';

interface Package {
  id: number;
  name: string | null;
  description?: string | null;
  price: number;
  mealsPerWeek: number;
  stripeProductId?: string | null;
}

type PagedResponse<T> = {
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export const packagesApi = createApi({
  reducerPath: 'packagesApi',
  baseQuery: baseQueryWithRedirect,
  tagTypes: ['Package'],
  endpoints: (builder) => ({
    getPackages: builder.query<PagedResponse<Package>, { page: number; size: number }>({
      query: ({ page, size }) => `packages?pageNumber=${page}&pageSize=${size}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Package' as const, id })),
              { type: 'Package', id: 'LIST' },
            ]
          : [{ type: 'Package', id: 'LIST' }],
    }),
    createPackage: builder.mutation<Package, Partial<Package>>({
      query: (newPackage) => ({
        url: 'packages',
        method: 'POST',
        body: newPackage,
      }),
      invalidatesTags: [{ type: 'Package', id: 'LIST' }],
    }),
    updatePackage: builder.mutation<void, Partial<Package>>({
      query: (packageData) => ({
        url: `packages`,
        method: 'PUT',
        body: packageData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Package', id }],
    }),
    deletePackage: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `packages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Package', id }],
    }),
  }),
});

export const {
  useGetPackagesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} = packagesApi;
