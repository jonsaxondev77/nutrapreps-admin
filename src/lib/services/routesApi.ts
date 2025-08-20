// src/lib/services/routesApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface Route {
  id: number;
  name: string | null;
  color: string | null;
  textColor: string | null;
  deliveryFee: number;
  depotId: string | null;
}

interface PaginatedRoutes {
  data: Route[];
  totalPages: number;
}

export const routesApi = createApi({
  reducerPath: "routesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:5265/" }), // Adjust if your backend URL is different
  endpoints: (builder) => ({
    getAllRoutes: builder.query<PaginatedRoutes, { pageNumber: number; pageSize: number }>({
      query: ({ pageNumber, pageSize }) => `deliveryroutes?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      providesTags: ["Routes"],
    }),
    updateRoute: builder.mutation<void, Route>({
      query: (route) => ({
        url: `deliveryroutes`,
        method: "PUT",
        body: route,
      }),
      invalidatesTags: ["Routes"],
    }),
    createRoute: builder.mutation<void, Route>({
      query: (route) => ({
        url: `deliveryroutes`,
        method: "POST",
        body: route
      }),
      invalidatesTags: ["Routes"]
    }),
    deleteRoute: builder.mutation<{id: number}, number>({
      query: (id) => ({
        url: `deliveryroutes/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["Routes"]
    }),
    
  }),
  tagTypes: ["Routes"],
});

export const { useGetAllRoutesQuery, useUpdateRouteMutation, useCreateRouteMutation, useDeleteRouteMutation } = routesApi;