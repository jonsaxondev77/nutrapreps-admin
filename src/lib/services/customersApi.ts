import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getSession } from 'next-auth/react';
import { baseQueryWithRedirect } from './baseQuery';
import { Account } from '@/types/customers';
import { PagedResponse } from '@/types/global';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  address: any;
  email: string;
  status: string;
}

interface PaginatedUsers {
  data: User[];
  totalPages: number;
}

interface AssignRouteRequest {
    routeId: number;
}

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: baseQueryWithRedirect,
  tagTypes: ['Customers'],
  endpoints: (builder) => ({
    getCustomers: builder.query<PagedResponse<Account>, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => `accounts?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      providesTags: ["Customers"],
    }),
    getPendingUsers: builder.query<PaginatedUsers, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => `accounts/bystatus?status=2&pageNumber=${pageNumber}&pageSize=${pageSize}`,
      providesTags: ["Customers"],
    }),
    updateCustomer: builder.mutation<Account, Partial<Account>  & { id: number }>({
      query: ({ id, ...patch }) => ({
        url: `accounts/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Customers'],
    }),
     assignRouteAndActivate: builder.mutation<void, { accountId: string; routeId: number }>({
        query: ({ accountId, routeId }) => ({
            url: `accounts/${accountId}/assign-route-and-activate`,
            method: "POST",
            body: { routeId },
        }),
        invalidatesTags: ["Customers"],
    }),
  }),
});

export const { useGetCustomersQuery, useGetPendingUsersQuery, useUpdateCustomerMutation, useAssignRouteAndActivateMutation } = customersApi;