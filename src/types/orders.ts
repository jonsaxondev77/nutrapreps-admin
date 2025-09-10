import { PagedResponse } from "./global";

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface MealDetail {
  mealOptionId: number;
  mealName: string;
  mealOptionName: string;
}

export interface AddonDetail {
  addonId: number;
  addonName: string;
}

export interface ExtraDetail {
  extraId: number;
  extraName: string;
}

export interface DetailedOrderResponse {
  id: number;
  customerName: string;
  orderDate: string;
  telephone: string;
  totalPrice: number;
  hasPayment: boolean;
  orderItems: OrderItem[];
  extras: ExtraDetail[];
}

export interface OrderItem {
  orderItemId: number;
  planName: string;
  deliveryDay: string;
  meals: MealDetail[];
}

export interface MealDetail {
  mealName: string;
  mealOptionName: string;
  quantity: number;
}

export interface ExtraDetail {
  extraName: string;
  quantity: number;
}

export interface OrderListResponse {
  id: number;
  name: string;
  email: string;
  telephone: string;
  total: number;
  hasPayment: boolean;
  orderDate: string;
}

export interface IMealOrderCount {
    mealName: string;
    mealOptionId: number;
    mealCount: number;
}

export interface OrderListResponse extends PagedResponse<OrderListResponse> { }