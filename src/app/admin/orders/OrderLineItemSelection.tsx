// components/admin/OrderLineItemSelection.tsx
'use client';

import React from 'react';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import { Plus } from 'lucide-react';
import { MealDto } from '@/types/orders';

// Assuming your Select component option format
interface SelectOption {
    value: string;
    label: string;
}

interface OrderLineItemSelectionProps {
    title: string;
    items: MealDto[];
    availableOptions: any[] | undefined; // Using 'any' as mo: any in original
    onAddItem: (e: React.MouseEvent) => void;
    onRemoveItem: (index: number) => void;
    onItemChange: (value: string | number, index: number, field: 'mealOptionId' | 'quantity' | 'day') => void;
}

const OrderLineItemSelection: React.FC<OrderLineItemSelectionProps> = ({
    title,
    items,
    availableOptions,
    onAddItem,
    onRemoveItem,
    onItemChange,
}) => {
    // Helper to format available options (Meals/Addons)
    const formattedAvailableOptions: SelectOption[] = [
        { value: '0', label: `Select ${title.replace('Select ', '').slice(0, -1)}` },
        ...(availableOptions ?? []).map((mo: any) => ({
            value: mo.id.toString(),
            label: `${mo.meal.name} - ${mo.name} (+£${(mo.supplement || 0).toFixed(2)})`
        }))
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg dark:border-gray-700 mb-6">
            <div className="md:col-span-3 flex justify-between items-center">
                <h3 className="text-lg font-semibold dark:text-white/90">
                    {title}
                </h3>
            </div>
            <div className="md:col-span-3 space-y-4 pt-4">
                {items.map((itemSelection, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-12 gap-2 items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md"
                    >
                        {/* Option Select (5 columns) */}
                        <div className="col-span-5">
                            <Select
                                value={itemSelection.mealOptionId?.toString() || '0'}
                                options={formattedAvailableOptions}
                                onChange={(value) => onItemChange(value, index, 'mealOptionId')}
                            />
                        </div>

                        {/* Quantity Input (2 columns) */}
                        <div className="col-span-2">
                            <label htmlFor={`qty-${title.toLowerCase().replace(/\s/g, '-')}-${index}`} className="sr-only">Quantity</label>
                            <input
                                id={`qty-${title.toLowerCase().replace(/\s/g, '-')}-${index}`}
                                type="number"
                                min="1"
                                value={itemSelection.quantity}
                                onChange={(e) => onItemChange(e.target.value, index, 'quantity')}
                                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        {/* Remove Button (2 columns) */}
                        <div className="col-span-2 flex justify-end">
                            <Button
                                variant="danger"
                                // The inner button should not submit the form
                                onClick={(e) => { e.preventDefault(); onRemoveItem(index); }}
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                ))}

                <div className="pt-2">
                    <Button
                        variant="primary"
                        onClick={onAddItem}
                        className="text-primary-500 hover:text-primary-600"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {`Add ${title.replace('Select ', '')}`}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrderLineItemSelection;