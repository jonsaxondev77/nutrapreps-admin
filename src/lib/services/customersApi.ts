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
    getCustomers: builder.query<PagedResponse<Account>, { pageNumber: number; pageSize: number, status?: string, searchTerm?: string }>({
      // Update the query URL to include the new searchTerm parameter
      query: ({ pageNumber, pageSize, status, searchTerm }) => {
        let url = 'accounts/bystatus';
        const params = new URLSearchParams();

        params.append('pageNumber', pageNumber.toString());
        params.append('pageSize', pageSize.toString());

        if (status && status !== 'All') {
          params.append('status', status);
        }

        if (searchTerm) {
          params.append('searchTerm', searchTerm);
        }

        return `${url}?${params.toString()}`;
      },
      providesTags: ["Customers"],
    }),
    getPendingUsers: builder.query<PaginatedUsers, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => `accounts/bystatus?status=2&pageNumber=${pageNumber}&pageSize=${pageSize}`,
      providesTags: ["Customers"],
    }),
    updateCustomer: builder.mutation<Account, Partial<Account> & { id: number }>({
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
    createStripeCustomer: builder.mutation<void, { accountId: number; name: string; email: string }>({
      query: ({ accountId, name, email }) => ({
        url: `accounts/update-stripe-customer`,
        method: "PUT",
        body: { id: accountId, name, email }
      }),
      invalidatesTags: ["Customers"],
    }),
  }),
});

export const { useGetCustomersQuery, useGetPendingUsersQuery, useUpdateCustomerMutation, useAssignRouteAndActivateMutation, useCreateStripeCustomerMutation } = customersApi;