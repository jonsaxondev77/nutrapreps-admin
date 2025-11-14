'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';

import { Package, Salad, ChefHat, Loader2, Pencil } from 'lucide-react'; 
import { useGetOrderByIdQuery } from '@/lib/services/ordersApi';
import Button from '@/components/ui/button/Button';
import { ExtraDetail, OrderItem } from '@/types/orders';
// import AdminOrderModal from './AdminOrderModal'; // No longer imported here

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, orderId }) => {
    
    const { data: order, isLoading, isError } = useGetOrderByIdQuery(orderId!, {
        skip: !isOpen || orderId === null,
    });

    if (!isOpen) return null;

    const renderOrderItems = (items: OrderItem[]) => {
        if (!items || items.length === 0) return <p>No meals in this plan.</p>;
        return items.map((item) => (
            <div key={item.orderItemId} className="mb-4">
                <h4 className="font-semibold text-md text-gray-600 dark:text-white/90 flex items-center gap-2">
                    <Package size={20} />
                    {item.planName}
                </h4>
                <p className="text-sm text-gray-600 ml-7">Delivery on: {item.deliveryDay}</p>

                <div className="mt-2 ml-7">
                    <p className="font-semibold text-gray-600">Meals:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-gray-600">
                        {item.meals.map((meal, idx) => (
                            <li key={idx}>{meal.quantity}x {meal.mealName}</li>
                        ))}
                    </ul>
                </div>
            </div>
        ));
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] p-5 lg:p-10">
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">
                    Order Details #{orderId}
                </h4>
                                
            </div>
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                {isLoading && (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                )}
                {isError && (
                    <div className="p-4 text-center text-red-500">
                        Error loading order details.
                    </div>
                )}
                {order && (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white/90">Customer Info</h3>
                                <p className="text-gray-600 dark:text-gray-400"><span className="font-semibold">Name:</span> {order.customerName}</p>
                                <p className="text-gray-600 dark:text-gray-400"><span className="font-semibold">Telephone:</span> {order.telephone}</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white/90">Order Info</h3>
                                <p className="text-gray-600 dark:text-gray-400"><span className="font-semibold">Order Date</span> {order.orderDate}</p>
                                <p className="text-gray-600 dark:text-gray-400"><span className="font-semibold">Total Price:</span> £{order.totalPrice.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-4">
                            <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-800 dark:text-white/90"><ChefHat size={24} /> Meal Plans</h3>
                            {renderOrderItems(order.orderItems)}
                        </div>

                        {(order.extras && order.extras.length > 0) && (
                            <div className="mt-6 border-t pt-4">
                                <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-400 dark:text-white/90"><Salad size={24} /> Extras</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-300">
                                    {order.extras.map((extra: ExtraDetail, index: number) => (
                                        <li key={index}>{extra.quantity}x {extra.extraName}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default OrderDetailsModal;