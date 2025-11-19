'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { Loader2, Plus } from 'lucide-react';

import { useLazySearchActiveCustomersQuery } from '@/lib/services/customersApi';
import Autocomplete from '@/components/autocomplete';
import { useAdminPlaceOrderMutation, useGetAvailableMealsQuery, useGetAvailableExtrasQuery, useGetAvailableAddonsQuery } from '@/lib/services/ordersApi';
import Switch from '@/components/form/switch/Switch';
import DatePickerCustom from '@/components/form/date-picker-custom';
import ErrorAlert from '@/components/common/ErrorAlert';
import { useDebounce } from '@/hooks/useDebounce';
import Select from '@/components/form/Select';
import { MealDto, MealOption, ExtraDto } from '@/types/orders'; 

// Assuming these reusable components are correctly imported from your project structure
import OrderLineItemSelection from './OrderLineItemSelection'; 
import OrderExtraSelection from './OrderExtraSelection'; 


// Helper to calculate the start of the week (Sunday)
const getSundayForDate = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
};

interface AutocompleteOption {
    value: string | number;
    label: string;
}

interface AdminOrderFormState {
    accountId: number | null;
    weekstart: Date;
    hasPayment: boolean;
    plan: ALaCartOrder
}

interface AdminAddItemsToOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ALaCartOrder {
    id: number;
    // NOTE: MealDto interface in frontend must still include 'day' for backend compatibility,
    // even though we no longer track it via user input here.
    mealOptions: MealDto[],
    addons: MealDto[],
    extras: ExtraDto[]
}

const initialFormState: AdminOrderFormState = {
    accountId: null,
    // We keep this defaulted to Sunday but allow the user to change it in the picker
    weekstart: getSundayForDate(new Date()),
    hasPayment: true,
    plan: { id: 1, mealOptions: [], addons: [], extras: [] }
};


const AdminAddItemsToOrderModal: React.FC<AdminAddItemsToOrderModalProps> = ({ isOpen, onClose }) => {

    const [formState, setFormState] = useState<AdminOrderFormState>(initialFormState);
    const [formError, setFormError] = useState<string | null>(null);

    const [customerSearch, setCustomerSearch] = useState('');
    const debouncedSearchTerm = useDebounce(customerSearch, 500);
    const [skipSearchOnSelect, setSkipSearchOnSelect] = useState(false);

    const [
        triggerCustomerSearch,
        { data: searchResultsData, isFetching: isFetchingCustomers }
    ] = useLazySearchActiveCustomersQuery();

    const { data: mealOptionsData } = useGetAvailableMealsQuery();
    const { data: addonsData } = useGetAvailableAddonsQuery();
    const { data: extrasData } = useGetAvailableExtrasQuery();

    const [placeOrder, { isLoading: isSubmitting, error: placeError, isSuccess }] = useAdminPlaceOrderMutation();

    const [showMealOptions, setShowMealOptions] = useState(false);
    const [showAddons, setShowAddons] = useState(false);
    const [showExtras, setShowExtras] = useState(false);

    const isLoadingData = false;

    // REMOVED: dayOptions as they are no longer needed for line item selection.

    useEffect(() => {
        const searchTerm = debouncedSearchTerm.trim();

        if (skipSearchOnSelect) {
            setSkipSearchOnSelect(false);
            return;
        }

        if (searchTerm.length > 0) {
            triggerCustomerSearch({ searchTerm });
        }

    }, [debouncedSearchTerm, triggerCustomerSearch, skipSearchOnSelect]);

    const customerOptions: AutocompleteOption[] = useMemo(() =>
        searchResultsData
            ? searchResultsData.map((c: any) => ({
                value: c.id.toString(),
                label: `${c.firstName} ${c.lastName} (${c.email})`
            }))
            : [],
        [searchResultsData]);

    // --- TOGGLE HANDLERS ---
    const handleToggleMealOptions = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowMealOptions(prev => !prev);
    }

    const handleToggleAddons = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowAddons(prev => !prev);
    }

    const handleToggleExtras = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowExtras(prev => !prev);
    }

    // --- MEAL OPTIONS HANDLERS (DAY LOGIC REMOVED) ---
    const addMealOptionRow = (e: React.MouseEvent) => {
        e.preventDefault();
        setFormState(prev => ({
            ...prev,
            plan: {
                ...prev.plan,
                mealOptions: [...prev.plan.mealOptions, { mealOptionId: null, quantity: 1 }] // Removed 'day: null'
            }
        }))
    }

    const removeMealOptionRow = (index: number) => {
        setFormState(prev => ({
            ...prev,
            plan: {
                ...prev.plan,
                mealOptions: prev.plan.mealOptions.filter((_, i) => i !== index),
            },
        }));
    };

    // NOTE: 'day' field is removed from signature and logic
    const handleMealOptionChange = (value: string | number, index: number, field: 'mealOptionId' | 'quantity') => {
        let processedValue: string | number | null = value;

        if (field === 'quantity') {
            processedValue = Number(value);
        } else if (field === 'mealOptionId') {
            processedValue = value === '0' ? null : Number(value);
        }

        setFormState(prev => ({
            ...prev,
            plan: {
                ...prev.plan,
                mealOptions: prev.plan.mealOptions.map((meal, i) =>
                    i === index ? {
                        ...meal,
                        [field]: processedValue
                    } : meal
                ),
            },
        }));
    };

    // --- ADDONS HANDLERS (DAY LOGIC REMOVED) ---
    const addAddonRow = (e: React.MouseEvent) => {
        e.preventDefault();
        setFormState(prev => ({
            ...prev,
            plan: {
                ...prev.plan,
                addons: [...prev.plan.addons, { mealOptionId: null, quantity: 1 }] // Removed 'day: null'
            }
        }))
    }

    const removeAddonRow = (index: number) => {
        setFormState(prev => ({
            ...prev,
            plan: {
                ...prev.plan,
                addons: prev.plan.addons.filter((_, i) => i !== index),
            },
        }));
    };

    // NOTE: 'day' field is removed from signature and logic
    const handleAddonOptionChange = (value: string | number, index: number, field: 'mealOptionId' | 'quantity') => {
        let processedValue: string | number | null = value;

        if (field === 'quantity') {
            processedValue = Number(value);
        } else if (field === 'mealOptionId') {
            processedValue = value === '0' ? null : Number(value);
        }

        setFormState(prev => ({
            ...prev,
            plan: {
                ...prev.plan,
                addons: prev.plan.addons.map((addon, i) =>
                    i === index ? {
                        ...addon,
                        [field]: processedValue
                    } : addon
                ),
            },
        }));
    };

    // --- EXTRAS HANDLERS (Unchanged) ---
    const addExtraRow = (e: React.MouseEvent) => {
        e.preventDefault();
        setFormState(prev => ({
            ...prev,
            plan: {
                ...prev.plan,
                extras: [...prev.plan.extras, { extraId: null, quantity: 1 }]
            }
        }))
    }

    const removeExtraRow = (index: number) => {
        setFormState(prev => ({
            ...prev,
            plan: {
                ...prev.plan,
                extras: prev.plan.extras.filter((_, i) => i !== index),
            },
        }));
    };

    const handleExtraChange = (value: string | number, index: number, field: 'extraId' | 'quantity') => {
        let processedValue: string | number = value;

        if (field === 'quantity') {
            processedValue = Math.max(1, Number(value));
        } else if (field === 'extraId') {
            processedValue = value === '0' ? null : Number(value);
        }

        setFormState(prev => ({
            ...prev,
            plan: {
                ...prev.plan,
                extras: prev.plan.extras.map((extra, i) =>
                    i === index ? {
                        ...extra,
                        [field]: processedValue
                    } : extra
                ),
            },
        }));
    };

    // --- GENERAL HANDLERS ---
    const handleCustomerChange = (selectedOption: AutocompleteOption | null) => {
        if (selectedOption) {
            setSkipSearchOnSelect(true);
        }
        setFormState(prev => ({
            ...prev,
            accountId: selectedOption ? Number(selectedOption.value) : null
        }));
    };

    const handleDateChange = (date: Date) => { setFormState(prev => ({ ...prev, weekstart: date })); };

    // --- FINAL SUBMISSION LOGIC (UPDATED) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!formState.accountId) {
            setFormError('Please select a customer account.');
            return;
        }

        // 1. Determine the delivery day from the selected date
        const selectedDayOfWeek = formState.weekstart.getDay();
        let orderItemDeliveryDay: 'Sunday' | 'Wednesday' | 'Both' = 'Sunday';
        
        if (selectedDayOfWeek === 0) {
            orderItemDeliveryDay = 'Sunday';
        } else if (selectedDayOfWeek === 3) {
            orderItemDeliveryDay = 'Wednesday';
        }
        
        const mealAndAddonItems = [...formState.plan.mealOptions, ...formState.plan.addons];

        const validMealsAndAddons = mealAndAddonItems.filter(m => m.mealOptionId !== null && m.quantity > 0);
        const validExtras = formState.plan.extras.filter(e => e.extraId !== null && e.quantity > 0);

        if (validMealsAndAddons.length === 0 && validExtras.length === 0) {
            setFormError('Order must contain at least one valid meal, addon, or extra.');
            return;
        }
        
        if (mealAndAddonItems.length > 0 && mealAndAddonItems.some(m => m.mealOptionId === null || m.quantity <= 0)) {
             setFormError('Please ensure all selected meals/addons have a meal option and a quantity greater than zero.');
             return;
        }

        const weekstartSunday = getSundayForDate(formState.weekstart).toISOString();
        
        const payload = {
            accountId: formState.accountId,
            weekstart: weekstartSunday,
            hasPayment: true,

            orderItems: [{
                planId: formState.plan.id, 
                deliveryDay: orderItemDeliveryDay,
                meals: validMealsAndAddons.map(m => ({
                    mealOptionId: m.mealOptionId,
                    quantity: m.quantity,
                    day: orderItemDeliveryDay, 
                })),
            }],
            
            extras: validExtras.map(e => ({
                extraId: e.extraId,
                quantity: e.quantity,
            })),
        };

        try {
            console.log(payload);
            await placeOrder(payload).unwrap(); 
            setFormState(initialFormState);
            onClose();
        } catch (err) {
            console.error('Failed to place admin order:', err);
            const errorMessage = (placeError as any)?.data?.message || 'An unknown error occurred during submission.';
            setFormError(errorMessage);
        }
    };

    const submitButtonText = isSubmitting 
        ? 'Placing Order...' 
        : `Place A La Carte Order ${formState.hasPayment ? '' : '(UNPAID)'}`;
    
    const errorDisplay = formError || (placeError as any)?.data?.message || null;

    if (!isOpen) return null;

    if (isLoadingData) {
        return (
             <Modal isOpen={isOpen} onClose={onClose} className="max-w-[1000px] p-5 lg:p-10">
                 <div className="flex justify-center items-center h-40">
                     <Loader2 className="w-8 h-8 animate-spin" />
                     <span className="ml-3">Loading customer data...</span>
                 </div>
             </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[1000px] p-5 lg:p-10 min-h-[600px]">
            <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
                Place New Admin A La Carte Order
            </h4>

            <form onSubmit={handleSubmit} className="space-y-6 p-2">

                {errorDisplay && <ErrorAlert error={{ message: errorDisplay }} title="Order Error" />}

                {/* General Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg dark:border-gray-700">
                    <h3 className="md:col-span-3 text-lg font-semibold dark:text-white/90">General Order Details</h3>

                    <div className="md:col-span-2">
                        <Autocomplete
                            label="Account"
                            name="accountId"
                            value={customerOptions.find(c => Number(c.value) === formState.accountId) || null}
                            onChange={handleCustomerChange}
                            inputValue={customerSearch}
                            onInputValueChange={setCustomerSearch}
                            isLoading={isFetchingCustomers}
                            options={customerOptions}
                            placeholder="Search for customer by name or email..."
                            required
                        />
                    </div>

                    <div className="flex flex-col space-y-1">
                        <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Order Date</label>
                        <DatePickerCustom
                            id="weekstart"
                            selected={formState.weekstart}
                            onChange={handleDateChange}
                            enableSundaysAndWednesdays
                            // Removed enableSundaysOnly={true} to allow selecting Wed/Sun delivery
                        />
                        <p className="text-xs text-gray-500 mt-1">Select the exact Sunday or Wednesday delivery date.</p>
                    </div>

                   
                </div>

                {/* Button Section for Spacing and Toggling */}
                <div className="flex flex-wrap gap-4 mt-6 mb-6"> 
                    <Button variant="outline" onClick={handleToggleMealOptions} className="w-40">
                        {showMealOptions ? 'Hide Meals' : 'Add Meals'}
                    </Button>
                    <Button variant="outline" onClick={handleToggleAddons} className="w-40">
                        {showAddons ? 'Hide Addons' : 'Add Addons'}
                    </Button>
                    <Button variant="outline" onClick={handleToggleExtras} className="w-40">
                        {showExtras ? 'Hide Extras' : 'Add Extras'}
                    </Button>
                </div>
                {/* End Button Section */}

                {/* Meals Section (Now without a day selector in the item rows) */}
                {showMealOptions && (
                    <OrderLineItemSelection
                        title="Select Meal Options"
                        items={formState.plan.mealOptions}
                        availableOptions={mealOptionsData}
                        // Removed dayOptions prop, assuming the component adjusts
                        onAddItem={addMealOptionRow}
                        onRemoveItem={removeMealOptionRow}
                        onItemChange={handleMealOptionChange}
                    />
                )}

                {/* Addons Section (Now without a day selector in the item rows) */}
                {showAddons && (
                    <OrderLineItemSelection
                        title="Select Addons"
                        items={formState.plan.addons}
                        availableOptions={addonsData}
                        // Removed dayOptions prop, assuming the component adjusts
                        onAddItem={addAddonRow}
                        onRemoveItem={removeAddonRow}
                        onItemChange={handleAddonOptionChange}
                    />
                )}

                {/* Extras Section */}
                {showExtras && (
                    <OrderExtraSelection
                        title="Select Extras"
                        items={formState.plan.extras}
                        availableOptions={extrasData}
                        onAddItem={addExtraRow}
                        onRemoveItem={removeExtraRow}
                        onItemChange={handleExtraChange}
                    />
                )}

                {/* Submission Button */}
                <div className="mt-8 pt-4 border-t dark:border-gray-700">
                    <Button type="submit" disabled={isSubmitting || !formState.accountId} isLoading={isSubmitting}>
                        {submitButtonText}
                    </Button>
                    {isSuccess && <p className="text-sm text-green-600 mt-2">Order placed successfully. Closing modal...</p>}
                </div>
            </form>
        </Modal >
    );
};

export default AdminAddItemsToOrderModal;