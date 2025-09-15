import { Suspense } from "react";
import OrdersTable from "./OrdersTable";

const OrdersPage = () => {
  return (
    <>
      
      <Suspense>
        <OrdersTable />
      </Suspense>
    </>
  );
};

export default OrdersPage;