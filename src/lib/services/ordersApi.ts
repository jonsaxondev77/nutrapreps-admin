import { createApi } from "@reduxjs/toolkit/query/react";
import { DetailedOrderResponse, OrderListResponse, OrderStatus, AdminPlaceOrderRequest, PlaceOrderResponse, AdminUpdateOrderRequest, MealOption, Extra } from "@/types/orders"; // <-- IMPORT NEW TYPES
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
    }),

    getAvailableMeals: builder.query<MealOption[], void>({
        query: () => 'order/meals',
    }),

    getAvailableAddons: builder.query<MealOption[], void>({
        query: () => 'order/addons',
    }),

    getAvailableExtras: builder.query<Extra[], void>({
        query: () => 'order/extras',
    }),

    // NEW: Mutation for Admin Place Order
    adminPlaceOrder: builder.mutation<PlaceOrderResponse, AdminPlaceOrderRequest>({
        query: (orderData) => ({
            url: 'order/admin-place',
            method: 'POST',
            body: orderData,
        }),
        invalidatesTags: ["Orders"], // Invalidate all orders to refresh list
    })
  }),
});

// Update hook exports
export const { 
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetAvailableExtrasQuery,
  useGetAvailableAddonsQuery,
  useGetAvailableMealsQuery,
  useAdminPlaceOrderMutation
} = ordersApi;