"use client"; 
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { RecentOrder } from "@/types/commerce-dashboard"; // Assuming your types are here

// 1. Define the props interface
interface RecentOrdersProps {
  recentOrders: RecentOrder[];
}

// 2. Accept the props
export default function RecentOrders({ recentOrders }: RecentOrdersProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Recent Orders
        </h3>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Customer</TableCell>
              <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Order Total</TableCell>
              <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Payment Status</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {/* 3. Map over the prop data */}
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                  <p className="font-medium">{order.name}</p>
                  <span className="text-sm text-gray-500">{order.telephone}</span>
                </TableCell>
                <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">{formatCurrency(order.total)}</TableCell>
                <TableCell className="px-5 py-4 text-gray-800 text-start dark:text-white/90">
                  <Badge
                    size="sm"
                    color={order.hasPayment ? "success" : "warning"}
                  >
                    {order.hasPayment ? "Paid" : "Pending Payment"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}