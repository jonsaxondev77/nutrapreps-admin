import { createApi } from "@reduxjs/toolkit/query/react";
import { DetailedOrderResponse, OrderListResponse, OrderStatus } from "@/types/orders";
import { baseQueryWithRedirect } from "./baseQuery";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: baseQueryWithRedirect,
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    getOrders: builder.query<OrderListResponse, { pageNumber: number, pageSize: number, weekStart: any }>({
      query: ({ pageNumber, pageSize, weekStart }) => `order?pageNumber=${pageNumber}&pageSize=${pageSize}&weekStart=${weekStart}`,
      providesTags: ["Orders"],
    }),
    getOrderById: builder.query<DetailedOrderResponse, number>({
        query: (id) => `order/details/${id}`,
        providesTags: (result, error, id) => [{ type: 'Orders', id }],
    })
  }),
});

export const { useGetOrdersQuery, useGetOrderByIdQuery } = ordersApi;