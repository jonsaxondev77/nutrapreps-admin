// src/lib/types/crm-dashboard.ts

import { ChartDataPoint } from "./commerce-dashboard";

export interface CustomerSegmentDto {
  label: string;
  count: number;
}

export interface CustomerRetentionDto {
  activeCustomers: number;
  reactivatedCustomers: number;
  reactivationRate: number;
  atRiskCustomers: number;
}

export interface CrmDashboardDto {
  monthlySales: ChartDataPoint[];
  customerDemographics: any[];
  totalRevenue: number;
  customerSegments: CustomerSegmentDto[];
  retentionMetrics: CustomerRetentionDto;
}