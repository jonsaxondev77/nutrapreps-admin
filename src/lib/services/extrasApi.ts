// src/lib/services/extrasApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { baseQueryWithRedirect } from "./baseQuery";

interface Extra {
  id: number;
  name: string | null;
  price: number;
  allergens: string | null;
  categoryId: number;
  soldOut: boolean;
}

interface PaginatedExtras {
  data: Extra[];
  totalPages: number;
}

export const extrasApi = createApi({
  reducerPath: "extrasApi",
  baseQuery: baseQueryWithRedirect,
  tagTypes: ["Extras"],
  endpoints: (builder) => ({
    getAllExtras: builder.query<PaginatedExtras, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => `extras?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      providesTags: ["Extras"],
    }),
    createExtra: builder.mutation<void, Omit<Extra, 'id'>>({
      query: (extra) => ({
        url: 'extras',
        method: 'POST',
        body: extra,
      }),
      invalidatesTags: ['Extras'],
    }),
    updateExtra: builder.mutation<void, Extra>({
      query: (extra) => ({
        url: `extras`,
        method: 'PUT',
        body: extra,
      }),
      invalidatesTags: ['Extras'],
    }),
    deleteExtra: builder.mutation<void, number>({
      query: (id) => ({
        url: `extras/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Extras'],
    }),
  }),
});

export const {
  useGetAllExtrasQuery,
  useCreateExtraMutation,
  useUpdateExtraMutation,
  useDeleteExtraMutation,
} = extrasApi;