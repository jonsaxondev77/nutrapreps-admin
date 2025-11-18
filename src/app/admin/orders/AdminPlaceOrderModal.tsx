'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { useAdminPlaceOrderMutation, useGetAvailableMealsQuery, useGetAvailableExtrasQuery } from '@/lib/services/ordersApi';
import Button from '@/components/ui/button/Button';
import { Loader2, Plus, Minus, Trash } from 'lucide-react';
import { AdminPlaceOrderRequest, OrderItemDto, ExtraDto } from '@/types/orders';

import Select from '@/components/form/Select';
import Switch from '@/components/form/switch/Switch';
import InputField from '@/components/form/input/InputField';
import DatePickerCustom from '@/components/form/date-picker-custom';
import ErrorAlert from '@/components/common/ErrorAlert';
import { useGetCustomersQuery } from '@/lib/services/customersApi';
import { useGetPackagesQuery } from '@/lib/services/packagesApi';
import Autocomplete from '@/components/autocomplete';

// Included Helper Method
const getSundayForDate = (date: Date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
};


// --- Local State Types (Simplified) ---
interface SelectedMeal {
    mealOptionId: number;
    quantity: number;
    day: 'Sunday' | 'Wednesday' | 'Both';
}

interface SelectedExtra {
    extraId: number;
    quantity: number;
}

interface SelectedPlan {
    id: string;
    planId: number;
    deliveryDay: 'Sunday' | 'Wednesday' | 'Both';
    meals: SelectedMeal[];
    planName?: string;
    mealsPerWeek?: number;
}

interface AdminOrderFormState {
    accountId: number | null;
    weekstart: Date;
    hasPayment: boolean;
    plans: SelectedPlan[];
    extras: SelectedExtra[];
}

interface AdminPlaceOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialFormState: AdminOrderFormState = {
    accountId: null,
    weekstart: getSundayForDate(new Date()),
    hasPayment: false,
    plans: [{ id: 'default-1', planId: 0, deliveryDay: 'Sunday', meals: [] }], 
    extras: [],
};

const AdminPlaceOrderModal: React.FC<AdminPlaceOrderModalProps> = ({ isOpen, onClose }) => {
    
    const [formState, setFormState] = useState<AdminOrderFormState>(initialFormState);
    const [formError, setFormError] = useState<string | null>(null);

    // --- Data Fetching ---
    const { data: customersData, isLoading: isLoadingCustomers } = useGetCustomersQuery({ pageNumber: 1, pageSize: 20000 });
    const { data: packagesData, isLoading: isLoadingPackages } = useGetPackagesQuery({ page: 1, size: 1000 });
    const { data: mealOptionsData } = useGetAvailableMealsQuery();
    const { data: extrasData } = useGetAvailableExtrasQuery();
    
    const [placeOrder, { isLoading: isPlacing, error: placeError }] = useAdminPlaceOrderMutation();
    
    const isSubmitting = isPlacing;
    const isLoadingData = isLoadingCustomers || isLoadingPackages;

    // --- Data Lookups (Memoized for efficiency) ---
    const customerOptions = useMemo(() => customersData?.data
        .map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName} (${c.email})` })) ?? [], 
    [customersData]);

    const packageLookup = useMemo(() => packagesData?.data.reduce((acc, p) => {
        // @ts-ignore
        acc[p.id] = p;
        return acc;
    }, {} as Record<number, any>) ?? {}, [packagesData]);

    const mealOptionLookup = useMemo(() => mealOptionsData?.reduce((acc, mo) => {
        acc[mo.id] = mo;
        return acc;
    }, {} as Record<number, any>) ?? {}, [mealOptionsData]);

    const extraLookup = useMemo(() => extrasData?.reduce((acc, e) => {
        // @ts-ignore
        acc[e.id] = e;
        return acc;
    }, {} as Record<number, any>) ?? {}, [extrasData]);

    // --- Form Handlers ---
    const handleAddPlan = (e: React.MouseEvent) => {
        e.preventDefault(); 
        setFormState(prev => ({
            ...prev,
            plans: [...prev.plans, { id: 'default-' + Date.now().toString(), planId: 0, deliveryDay: 'Sunday', meals: [] }],
        }));
    };

    const handleUpdatePlan = (id: string, field: keyof SelectedPlan, value: any) => {
        setFormState(prev => ({
            ...prev,
            plans: prev.plans.map(p => {
                if (p.id === id) {
                    const updatedPlan = { ...p, [field]: value };
                    
                    if (field === 'planId') {
                        const newPlan = packageLookup[value as number];
                        if (newPlan) {
                            // @ts-ignore
                            updatedPlan.planName = newPlan.name;
                            // @ts-ignore
                            updatedPlan.mealsPerWeek = newPlan.mealsPerWeek;
                            updatedPlan.meals = [];
                        } else {
                            updatedPlan.planName = undefined;
                            updatedPlan.mealsPerWeek = undefined;
                            updatedPlan.meals = [];
                        }
                    }
                    return updatedPlan;
                }
                return p;
            }),
        }));
    };

    const handleRemovePlan = (e: React.MouseEvent, id: string) => {
        e.preventDefault(); 
        setFormState(prev => ({
            ...prev,
            plans: prev.plans.filter(p => p.id !== id),
        }));
    };

    const handleAddMealToPlan = (e: React.MouseEvent, planId: string) => {
        e.preventDefault(); 
        setFormState(prev => ({
            ...prev,
            plans: prev.plans.map(p => {
                if (p.id === planId) {
                    const newMeal: SelectedMeal = {
                        mealOptionId: 0,
                        quantity: 1,
                        day: p.deliveryDay !== 'Both' ? p.deliveryDay : 'Sunday', 
                    };
                    return { ...p, meals: [...p.meals, newMeal] };
                }
                return p;
            }),
        }));
    };
    
    const handleUpdateMealInPlan = (planId: string, mealIndex: number, field: keyof SelectedMeal, value: any) => {
        setFormState(prev => ({
            ...prev,
            plans: prev.plans.map(p => {
                if (p.id === planId) {
                    const newMeals = p.meals.map((m, i) => i === mealIndex ? { ...m, [field]: value } : m);
                    return { ...p, meals: newMeals };
                }
                return p;
            }),
        }));
    };

    const handleRemoveMealFromPlan = (e: React.MouseEvent, planId: string, mealIndex: number) => {
        e.preventDefault(); 
        setFormState(prev => ({
            ...prev,
            plans: prev.plans.map(p => {
                if (p.id === planId) {
                    return { ...p, meals: p.meals.filter((_, i) => i !== mealIndex) };
                }
                return p;
            }),
        }));
    };

    const handleAddExtra = (e: React.MouseEvent) => {
        e.preventDefault(); 
        setFormState(prev => ({
            ...prev,
            extras: [...prev.extras, { extraId: 0, quantity: 1 }],
        }));
    };

    const handleUpdateExtra = (index: number, field: keyof SelectedExtra, value: any) => {
        setFormState(prev => ({
            ...prev,
            extras: prev.extras.map((e, i) => i === index ? { ...e, [field]: value } : e),
        }));
    };

    const handleRemoveExtra = (e: React.MouseEvent, index: number) => {
        e.preventDefault(); 
        setFormState(prev => ({
            ...prev,
            extras: prev.extras.filter((_, i) => i !== index),
        }));
    };

    // --- Calculation and Total Display (Estimate) ---
    const calculatedTotal = useMemo(() => {
        let total = 0;
        
        const plans = formState.plans.filter(p => p.planId > 0);
        const extras = formState.extras.filter(e => e.extraId > 0 && e.quantity > 0);

        // 1. Calculate plan and meal supplement costs
        plans.forEach(p => {
            const planDetails = packageLookup[p.planId];
            if (planDetails) {
                 // @ts-ignore
                total += planDetails.price || 0;
            }

            p.meals.filter(m => m.mealOptionId > 0 && m.quantity > 0).forEach(m => {
                const mealOptionDetails = mealOptionLookup[m.mealOptionId];
                if (mealOptionDetails) {
                    total += (mealOptionDetails.supplement || 0) * m.quantity;
                }
            });
        });

        // 2. Calculate extra costs
        extras.forEach(e => {
            const extraDetails = extraLookup[e.extraId];
            if (extraDetails) {
                 // @ts-ignore
                total += (extraDetails.price || 0) * e.quantity;
            }
        });

        return total;
    }, [formState.plans, formState.extras, packageLookup, mealOptionLookup, extraLookup]);

    // --- Submission Logic ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        setFormError(null);

        // --- Validation ---
        if (formState.accountId === null || formState.accountId === 0) {
            setFormError('Please select a customer.');
            return;
        }
        if (formState.plans.length === 0) {
             setFormError('The order must contain at least one package/plan.');
             return;
        }
        
        const invalidPlans = formState.plans.some(p => {
            return p.planId === 0 || (p.deliveryDay === 'Both' && p.meals.length === 0);
        });
        
        if (invalidPlans) {
            setFormError('All plans must be selected and include meal selections for split delivery options.');
            return;
        }
        
        // --- DTO Construction ---
        const orderItems: OrderItemDto[] = formState.plans.map(p => ({
            planId: p.planId,
            deliveryDay: p.deliveryDay,
            meals: p.meals.map(m => ({
                mealOptionId: m.mealOptionId,
                quantity: m.quantity,
                day: m.day,
            })).filter(m => m.mealOptionId > 0 && m.quantity > 0),
        })).filter(p => p.planId > 0);

        const extras: ExtraDto[] = formState.extras.map(e => ({
            extraId: e.extraId,
            quantity: e.quantity,
        })).filter(e => e.extraId > 0 && e.quantity > 0);
        
        // --- API Call ---
        try {
             const request: AdminPlaceOrderRequest = {
                accountId: formState.accountId!,
                weekstart: formState.weekstart.toISOString(),
                hasPayment: formState.hasPayment,
                orderItems,
                extras,
            };
            await placeOrder(request).unwrap();
            onClose();
        } catch (error: any) {
            console.error('Order submission failed:', error);
            const errorMessage = error?.data?.message || error?.error || 'An unexpected error occurred during submission.';
            setFormError(errorMessage);
        }
    };

    const submitButtonText = 'Place Order';
    const errorDisplay = formError || (placeError as any)?.data?.message || null;
    
    if (!isOpen) return null;

    if (isLoadingData) {
         return (
             <Modal isOpen={isOpen} onClose={onClose} className="max-w-[1000px] p-5 lg:p-10">
                 <div className="flex justify-center items-center h-40">
                     <Loader2 className="w-8 h-8 animate-spin" />
                     <span className="ml-3">Loading order form data...</span>
                 </div>
             </Modal>
         );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[1000px] p-5 lg:p-10">
            <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
                Place New Admin Order
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar p-2">
                
                {errorDisplay && <ErrorAlert error={{ message: errorDisplay }} title="Order Error" />}

                {/* --- 1. General Info --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg dark:border-gray-700">
                    <h3 className="md:col-span-3 text-lg font-semibold dark:text-white/90">General Details</h3>
                    
                    {/* Instructional Note */}
                    <div className="md:col-span-3 p-3 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 rounded text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-semibold mb-1">Important: Amending/Correcting Mid-Week Orders</p>
                        <p>If you are correcting a mistake or adding an item specifically for a **Wednesday** delivery in the *current* cycle, you must still select the original **Sunday** as the "Week Start Date". Then, select the correct plan and choose "Wednesday (Single)" as the delivery day. This ensures the delivery date is correctly linked to the ongoing weekly batch.</p>
                    </div>
                    
                    <Autocomplete
                        label="Customer Account"
                        name="accountId"
                        // The value should be the currently selected customer object for display
                        value={customerOptions.find(c => c.value === formState.accountId) || null} 
                        // Handle the change: the component returns the full selected option object
                        onChange={(selectedOption) => {
                            setFormState(prev => ({ 
                                ...prev, 
                                accountId: selectedOption ? Number(selectedOption.value) : null 
                            }));
                        }}
                        // The options are already memoized, just pass them directly
                        options={customerOptions.filter(c => c.value > 0)}
                        placeholder="Search for customer by name or email..."
                        required
                    />
                    
                    <div className="flex items-center space-x-4">
                    <label className="text-gray-600 dark:text-gray-300">Order Date</label>
                    <DatePickerCustom
                        label="Week Start Date (Sunday)"
                        selected={formState.weekstart}
                        onChange={(date: Date) => setFormState(prev => ({ ...prev, weekstart: date }))}
                        enableSundaysOnly={true}
                    />
                    </div>

                    <div className="flex items-center space-x-4">
                        <label className="text-gray-600 dark:text-gray-300">Payment Status (Paid)</label>
                        <Switch
                            checked={formState.hasPayment}
                            onChange={(checked: boolean) => setFormState(prev => ({ ...prev, hasPayment: checked }))}
                        />
                        <span className={`text-sm font-semibold ${formState.hasPayment ? 'text-green-500' : 'text-red-500'}`}>
                            {formState.hasPayment ? 'PAID' : 'UNPAID'}
                        </span>
                    </div>
                </div>

                {/* --- 2. Packages/Plans Selection --- */}
                <div className="p-4 border rounded-lg dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold dark:text-white/90">Meal Plans/Packages</h3>
                        <Button variant="primary" startIcon={<Plus size={16} />} onClick={handleAddPlan}>
                            Add Plan
                        </Button>
                    </div>

                    {formState.plans.map((plan, planIndex) => {
                        const totalMealQuantity = plan.meals.reduce((sum, meal) => sum + meal.quantity, 0);

                        return (
                            <div key={plan.id} className="p-4 mb-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                                <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                                    <h4 className="font-medium">Plan {planIndex + 1}: {plan.planName || 'Not Selected'}</h4>
                                    <Button variant="outline" startIcon={<Trash size={16} />} onClick={(e) => handleRemovePlan(e, plan.id)}>
                                        Remove Plan
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <Select
                                        label="Package"
                                        name={`plan-${plan.id}-package`}
                                        value={plan.planId.toString()} 
                                        onChange={(value) => handleUpdatePlan(plan.id, 'planId', Number(value))}
                                        options={[{ value: '0', label: 'Select Package' }, ...packagesData?.data.map(p => ({ value: p.id.toString(), label: `${p.name} (£${(p.price || 0).toFixed(2)})` })) ?? []]}
                                        required
                                        className="md:col-span-2"
                                    />
                                    <Select
                                        label="Delivery Day"
                                        name={`plan-${plan.id}-day`}
                                        value={plan.deliveryDay}
                                        onChange={(value) => handleUpdatePlan(plan.id, 'deliveryDay', value as 'Sunday' | 'Wednesday' | 'Both')}
                                        options={[
                                            { value: 'Sunday', label: 'Sunday (Single)' },
                                            { value: 'Wednesday', label: 'Wednesday (Single)' },
                                            { value: 'Both', label: 'Split (Sunday & Wednesday)' },
                                        ]}
                                        required
                                    />
                                </div>

                                <h5 className="font-semibold mt-4 mb-2 flex justify-between items-center">
                                    Meal Selection ({totalMealQuantity} / {plan.mealsPerWeek || '??'})
                                    <Button size="xs" variant="primary" startIcon={<Plus size={12} />} onClick={(e) => handleAddMealToPlan(e, plan.id)} disabled={plan.planId === 0 || totalMealQuantity >= (plan.mealsPerWeek || 999)}>
                                        Add Meal
                                    </Button>
                                </h5>
                                
                                <div className="space-y-2">
                                    {plan.meals.map((meal, mealIndex) => (
                                        <div key={mealIndex} className="grid grid-cols-12 gap-2 items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                                            <div className="col-span-5">
                                                <Select
                                                    label=""
                                                    name={`meal-${plan.id}-${mealIndex}-option`}
                                                    value={meal.mealOptionId.toString()} 
                                                    onChange={(value) => handleUpdateMealInPlan(plan.id, mealIndex, 'mealOptionId', Number(value))}
                                                    options={[{ value: '0', label: 'Select Meal Option' }, ...mealOptionsData?.map(mo => ({ 
                                                        value: mo.id.toString(), 
                                                        label: `${(mo as any).meal.name} - ${mo.name} (+£${(mo.supplement || 0).toFixed(2)})` 
                                                    })) ?? []]}
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <InputField
                                                    label=""
                                                    name={`meal-${plan.id}-${mealIndex}-quantity`}
                                                    type="number" 
                                                    value={meal.quantity}
                                                    onChange={(e) => handleUpdateMealInPlan(plan.id, mealIndex, 'quantity', Number(e.target.value))}
                                                    min={1}
                                                />
                                            </div>
                                            
                                            {/* Conditional rendering for Meal Day Select */}
                                            {plan.deliveryDay === 'Both' ? (
                                                <div className="col-span-3">
                                                    <Select
                                                        label=""
                                                        name={`meal-${plan.id}-${mealIndex}-day`}
                                                        value={meal.day}
                                                        onChange={(value) => handleUpdateMealInPlan(plan.id, mealIndex, 'day', value as 'Sunday' | 'Wednesday' | 'Both')}
                                                        options={[
                                                            { value: 'Sunday', label: 'Sunday' },
                                                            { value: 'Wednesday', label: 'Wednesday' },
                                                        ]}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="col-span-3 flex items-center justify-start text-gray-600 dark:text-gray-300">
                                                    <p className="text-sm">Day: {plan.deliveryDay}</p>
                                                </div>
                                            )}
                                            
                                            <Button size="sm" variant="outline" onClick={(e) => handleRemoveMealFromPlan(e, plan.id, mealIndex)} className="col-span-1">
                                                <Minus size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- 3. Extras Selection --- */}
                 <div className="p-4 border rounded-lg dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold dark:text-white/90">Extras/Add-ons</h3>
                        <Button variant="primary" startIcon={<Plus size={16} />} onClick={handleAddExtra}>
                            Add Extra
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {formState.extras.map((extra, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                                <div className="col-span-8">
                                    <Select
                                        label=""
                                        name={`extra-${index}-id`}
                                        value={extra.extraId.toString()}
                                        onChange={(value) => handleUpdateExtra(index, 'extraId', Number(value))}
                                        options={[{ value: '0', label: 'Select Extra' }, ...extrasData?.map(e => ({ value: e.id.toString(), label: `${e.name} (£${(e.price || 0).toFixed(2)})` })) ?? []]}
                                        required
                                    />
                                </div>
                                <div className="col-span-3">
                                    <InputField
                                        label=""
                                        name={`extra-${index}-quantity`}
                                        type="number"
                                        value={extra.quantity}
                                        onChange={(e) => handleUpdateExtra(index, 'quantity', Number(e.target.value))}
                                        min={1}
                                    />
                                </div>
                                <Button variant="outline" onClick={(e) => handleRemoveExtra(e, index)} className="col-span-1">
                                    <Minus size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- 4. Totals and Submission --- */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-gray-700">
                    <div className="text-xl font-bold dark:text-white/90">
                        Estimated Subtotal: <span className="text-theme-primary">£{calculatedTotal.toFixed(2)}</span>
                        <p className="text-sm font-normal text-gray-500 mt-1">
                            *Final total including delivery fee will be calculated on the server.
                        </p>
                    </div>

                    <div className="flex space-x-4">
                        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button variant="primary" disabled={isSubmitting || isLoadingData}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {submitButtonText}
                        </Button>
                    </div>
                </div>

            </form>
        </Modal>
    );
};

export default AdminPlaceOrderModal;