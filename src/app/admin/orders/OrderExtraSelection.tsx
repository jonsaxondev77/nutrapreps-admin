// components/admin/OrderExtraSelection.tsx (New File)
'use client';

import React from 'react';
import Button from '@/components/ui/button/Button';
import Select from '@/components/form/Select';
import { Plus } from 'lucide-react';
import { ExtraDto } from '@/types/orders';

interface SelectOption {
    value: string;
    label: string;
}

interface OrderExtraSelectionProps {
    title: string;
    items: ExtraDto[];
    availableOptions: any[] | undefined; 
    onAddItem: (e: React.MouseEvent) => void;
    onRemoveItem: (index: number) => void;
    onItemChange: (value: string | number, index: number, field: 'extraId' | 'quantity') => void;
}

const OrderExtraSelection: React.FC<OrderExtraSelectionProps> = ({
    title,
    items,
    availableOptions,
    onAddItem,
    onRemoveItem,
    onItemChange,
}) => {
    // Helper to format available Extra options
    const formattedAvailableOptions: SelectOption[] = [
        { value: '0', label: `Select ${title.replace('Select ', '').slice(0, -1)}` },
        // Assuming extrasData has a name and price/supplement field, 
        // similar to meal options, but we map 'extraId'
        ...(availableOptions ?? []).map((extra: any) => ({
            value: extra.id.toString(),
            label: `${extra.name} (+£${(extra.price || 0).toFixed(2)})`
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
                        {/* Extra Select (7 columns) */}
                        <div className="col-span-7">
                            <Select
                                value={itemSelection.extraId?.toString() || '0'}
                                options={formattedAvailableOptions}
                                // Note the field name is 'extraId'
                                onChange={(value) => onItemChange(value, index, 'extraId')} 
                            />
                        </div>

                        {/* Quantity Input (3 columns) - Made it wider */}
                        <div className="col-span-3">
                            <label htmlFor={`qty-${title.toLowerCase().replace(/\s/g, '-')}-${index}`} className="sr-only">Quantity</label>
                            <input
                                id={`qty-${title.toLowerCase().replace(/\s/g, '-')}-${index}`}
                                type="number"
                                min="1"
                                value={itemSelection.quantity}
                                // Note the field name is 'quantity'
                                onChange={(e) => onItemChange(e.target.value, index, 'quantity')}
                                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        {/* Remove Button (2 columns) */}
                        <div className="col-span-2 flex justify-end">
                            <Button
                                variant="danger"
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

export default OrderExtraSelection;