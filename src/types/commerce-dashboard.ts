import { Account } from './customers';

export interface DashboardStats {
  totalUsers: number;
  totalUsersPercentageChange: number;
  newOrders: number;
  newOrdersPercentageChange: number;
  pendingAccounts: number;
  monthlyRevenueTarget: number;
  currentMonthRevenue: number;
}

export interface RecentOrder {
  id: number;
  name: string;
  telephone: string;
  total: number;
  hasPayment: boolean;
}

export interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  recentUsers: Account[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface StatisticsChartPoint {
  label: string;
  salesCount: number;
  revenue: number;
}

export interface DemographicDataPoint {
  city: string;
  customerCount: number;
}