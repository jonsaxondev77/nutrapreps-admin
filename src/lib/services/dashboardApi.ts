import { ChartDataPoint, DashboardData, DemographicDataPoint, RecentOrder, StatisticsChartPoint } from '@/types/commerce-dashboard';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getSession } from 'next-auth/react';
import { baseQueryWithRedirect } from './baseQuery';
import { IMealOrderCount } from '@/types/orders';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithRedirect,
  tagTypes: ['Dashboard', 'RecentOrders'],
  endpoints: (builder) => ({
    getDashboardData: builder.query<DashboardData, void>({
      query: () => 'dashboard',
      providesTags: ['Dashboard'],
    }),
    getMonthlySalesData: builder.query<ChartDataPoint[], void>({
      query: () => 'dashboard/monthly-sales-chart',
    }),
    getStatisticsChartData: builder.query<StatisticsChartPoint[], string>({
      query: (period) => `dashboard/statistics-chart?period=${period}`,
    }),
    getDemographicsData: builder.query<DemographicDataPoint[], void>({
      query: () => 'dashboard/demographics',
    }),
    getMealOrderCountForDate: builder.query<IMealOrderCount[], { targetDate: string }>({
        query: ({ targetDate }) => `order/meal-order-count?targetDate=${targetDate}`,
    }),
  }),
});

export const { useGetDashboardDataQuery, useGetMonthlySalesDataQuery, useGetStatisticsChartDataQuery, useGetDemographicsDataQuery, useGetMealOrderCountForDateQuery } = dashboardApi;