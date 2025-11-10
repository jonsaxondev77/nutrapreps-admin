// src/app/admin/(schedules)/view-plans/SplitConfigurationModal.tsx

import React, { JSX, useState } from 'react';

import Button from '@/components/ui/button/Button';
import { TrashBinIcon, PlusIcon } from '@/icons';
import { Modal } from '@/components/ui/modal';

// NOTE: Interfaces remain the same
interface ScheduleDetail {
    stopPosition: number;
    name: string;
    address_Line1: string;
    address_Line2: string;
    address_Line3: string;
    address_Postcode: string;
    // Include other necessary route stop details here
}

interface Plan {
    planId: string;
    planTitle: string;
    stopsAdded: number;
}

interface SplitConfigurationModalProps {
    plan: Plan;
    currentSplits: number[];
    scheduleData: ScheduleDetail[] | null; 
    isLoading: boolean; 
    error: string | null;
    onSave: (planId: string, points: number[]) => void;
    onClose: () => void;
}

const SplitConfigurationModal: React.FC<SplitConfigurationModalProps> = ({
    plan,
    currentSplits,
    scheduleData,
    onSave,
    onClose,
}) => {
    const [points, setPoints] = useState<number[]>(currentSplits);
    const [localError, setLocalError] = useState<string | null>(null);

    const maxSplittableStop = plan.stopsAdded > 0 ? plan.stopsAdded - 1 : 0;
    const hasData = scheduleData && scheduleData.length > 0; 

    // 🌟 NEW HANDLER: Toggles a stop point on double-click
    const handleTogglePoint = (stopPosition: number) => {
        setLocalError(null);
        
        if (plan.stopsAdded <= 1) {
            return setLocalError('Route must have at least 2 stops to split.');
        }

        // We cannot split *after* the very last stop, so max is stopsAdded - 1.
        if (stopPosition > maxSplittableStop) {
            return setLocalError(`Cannot split after stop #${stopPosition} as it is the final stop.`);
        }
        
        setPoints(prev => {
            if (prev.includes(stopPosition)) {
                // Remove the point
                return prev.filter(p => p !== stopPosition);
            } else {
                // Add the point and sort it
                return [...prev, stopPosition].sort((a, b) => a - b);
            }
        });
    };
    
    // Existing handler to remove from the right pane
    const handleRemovePoint = (pointToRemove: number) => {
        setPoints(prev => prev.filter(p => p !== pointToRemove));
    };
    
    const handleSave = () => {
        onSave(plan.planId, points);
    };

    const renderSheetBreakdown = (currentPoints: number[]) => {
        // (Implementation remains the same as before)
        const sorted = [...currentPoints].sort((a, b) => a - b);
        let output: JSX.Element[] = [];
        let startStop = 1;
        let sheetIndex = 1;

        if (plan.stopsAdded === 0) return [<span key="empty">No stops available.</span>];
        
        if (sorted.length === 0) {
            return [<span key="full-sheet text=indigo-800 dark:text-white">Sheet 1: Stops 1 &ndash; {plan.stopsAdded}</span>];
        }

        for (let i = 0; i < sorted.length; i++) {
            const endStop = sorted[i];
            
            output.push(
                <span key={`sheet-${sheetIndex}`} className="text-gray-800 dark:text-white">
                    <span className="font-semibold text-blue-600 dark:text-white">Sheet {sheetIndex}:</span> Stops {startStop} &ndash; {endStop}
                </span>
            );

            if (endStop >= 1 && endStop <= maxSplittableStop) {
                output.push(
                    <div key={`split-${sheetIndex}`} className="flex items-center space-x-2 text-xs text-red-500 my-0.5 ml-4">
                        <span className="font-mono">--- CUT ---</span>
                        <button 
                            onClick={() => handleRemovePoint(endStop)} 
                            className="text-red-600 hover:text-red-400 p-0.5 rounded"
                            title={`Remove split after Stop ${endStop}`}
                        >
                            <TrashBinIcon size={14} />
                        </button>
                    </div>
                );
            }
            
            startStop = endStop + 1;
            sheetIndex++;
        }

        if (startStop <= plan.stopsAdded) {
            output.push(
                <span key={`sheet-${sheetIndex}`} className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Sheet {sheetIndex}:</span> Stops {startStop} &ndash; {plan.stopsAdded}
                </span>
            );
        }

        return output;
    };

    const totalSheets = points.length + (plan.stopsAdded > 0 ? 1 : 0);

    return (
        <Modal 
            title={`Configure Picking Splits for: ${plan.planTitle}`}
            onClose={onClose}
            isOpen={true} 
            className="max-w-3xl" 
        >
            <div className="flex p-5 h-[70vh]">
                
                {/* LEFT SIDE: Schedule List */}
                <div className="w-1/2 overflow-y-auto pr-4 border-r dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-3 dark:text-white">Route Stops ({plan.stopsAdded} Total)</h3>
                    
                    {localError && <div className="text-red-500 p-3 bg-red-50 rounded-md text-sm mb-4">{localError}</div>}
                    
                    {!hasData && (
                         <div className="text-gray-500 p-3">No stop details found for this plan.</div>
                    )}

                    {hasData && (
                        <div className="space-y-1">
                            {scheduleData!.map((item, index) => (
                                // 🌟 ADDED onDoubleClick HANDLER HERE
                                <div 
                                    key={item.stopPosition} 
                                    className={`p-2 rounded-md transition-colors text-sm flex items-center cursor-pointer ${
                                        points.includes(item.stopPosition) 
                                            ? 'bg-red-100 dark:bg-red-900/50 border border-red-400' 
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                    onDoubleClick={() => handleTogglePoint(item.stopPosition)}
                                    title={
                                        item.stopPosition < plan.stopsAdded 
                                        ? `Double-click to split after stop ${item.stopPosition}`
                                        : `Cannot split after the final stop (${item.stopPosition})`
                                    }
                                >
                                    <span className="font-bold w-10 inline-block text-lg text-indigo-600 dark:text-indigo-400">
                                        {item.stopPosition}
                                    </span>
                                    <div className="flex flex-col flex-grow">
                                        <span className="font-medium dark:text-gray-200">{item.name}</span>
                                        <span className="text-xs text-gray-500">{item.address_Line1}, {item.address_Postcode}</span>
                                    </div>
                                    {points.includes(item.stopPosition) && (
                                        <span className="text-red-600 text-xs font-semibold ml-auto">CUT POINT</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE: Split Configuration */}
                <div className="w-1/2 pl-4 flex flex-col space-y-4">
                    <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700">
                        <p className="font-bold text-lg text-indigo-800 dark:text-white">
                            Total Stops: {plan.stopsAdded} | Total Sheets: {totalSheets}
                        </p>
                    </div>

                    {/* Visual Breakdown of Sheets */}
                    <div className="border p-4 rounded-lg bg-white dark:bg-gray-800 space-y-2 flex-grow overflow-y-auto">
                        <h4 className="font-semibold text-base mb-3 border-b pb-2 dark:border-gray-700 dark:text-white">Sheet Breakdown:</h4>
                        
                        <div className="flex flex-col space-y-2 text-sm">
                            {renderSheetBreakdown(points)}
                        </div>
                    </div>

                    
                </div>
            </div>

            <div className="flex justify-end space-x-4 p-4 border-t dark:border-gray-700">
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save ({points.length} Splits)</Button>
            </div>
        </Modal>
    );
};

export default SplitConfigurationModal;