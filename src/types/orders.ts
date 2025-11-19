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

/**
 * Represents a single meal and its quantity within an order item for API requests.
 */
export interface MealDto {
  mealOptionId: number;
  quantity: number;
  day: 'Sunday' | 'Wednesday' | 'Both' | null; // The delivery day for the meal selection
}

/**
 * Represents a supplementary item (extra) and its quantity for API requests.
 */
export interface ExtraDto {
  extraId: number;
  quantity: number;
}

/**
 * Represents a single meal plan/package item within an order for API requests.
 */
export interface OrderItemDto {
  planId: number;
  deliveryDay: 'Sunday' | 'Wednesday' | 'Both'; // The delivery day for the plan
  meals: MealDto[];
}

/**
 * Base structure for order placement/amendment requests.
 */
export interface BaseOrderRequest {
  weekstart: string; // ISO date string, e.g., "2025-11-16T00:00:00Z"
  orderItems: OrderItemDto[];
  extras: ExtraDto[];
}

/**
 * Request DTO for an Admin placing a new order on behalf of a customer.
 */
export interface AdminPlaceOrderRequest extends BaseOrderRequest {
  accountId: number;
  hasPayment: boolean; // Admin sets payment status directly
}

/**
 * Response DTO for successfully placing an order.
 */
export interface PlaceOrderResponse {
  success: boolean;
  orderId: number;
  total: number;
}

export interface MealOption {
  id: number;
  name: string;
  mealId: number;
  mealName: string;
  supplement: number; // The price supplement for the meal option (used in calculation)
}

// Assumed structure based on what OrderController exposes via /order/extras
export interface Extra {
  id: number;
  name: string;
  price: number;
  allergens: string | null;
  soldOut: boolean;
}