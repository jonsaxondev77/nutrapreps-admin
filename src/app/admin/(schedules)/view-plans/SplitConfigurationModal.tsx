// src/app/admin/(schedules)/view-plans/SplitConfigurationModal.tsx

import React, { JSX, useState, useEffect } from 'react';

import Button from '@/components/ui/button/Button';
import { TrashBinIcon, PencilIcon, CloseIcon, LoaderIcon } from '@/icons';
import { Modal } from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import SelectCustom from '@/components/form/SelectCustom'; // Assumed component path

// --- ASSUMED INTERFACES (Must match schedulerApi.ts and driver types) ---
interface ScheduleDetail {
    stopPosition: number;
    name: string;
    address_Line1: string;
    address_Line2: string;
    address_Line3: string;
    address_Postcode: string;
}

interface Plan {
    planId: string;
    planTitle: string;
    stopsAdded: number;
}

interface Driver { 
    id: number; 
    firstName: string; 
    surname: string; 
} 

interface RouteSegmentAssignment {
    endStopPosition: number;
    driverId: number;
    planId: string;
}
// --------------------------------------------------------

interface SplitConfigurationModalProps {
    plan: Plan;
    currentSplits: number[];
    scheduleData: ScheduleDetail[] | null; 
    drivers: Driver[]; 
    currentSegments: RouteSegmentAssignment[];
    isLoading: boolean; 
    error: string | null;
    // NEW PROP: Total assignments per driver ID across ALL plans
    driverAssignmentCounts: Record<number, number>; 
    onSave: (planId: string, splits: number[], segments: RouteSegmentAssignment[]) => void;
    onClose: () => void;
}

// --- CORE LOGIC: Segment Calculation ---
const calculateSegments = (
    currentCutPoints: number[], 
    stopsAdded: number, 
    planId: string, 
    driverAssignmentsToPreserve: RouteSegmentAssignment[]
): RouteSegmentAssignment[] => {
    if (stopsAdded === 0) return [];

    const maxStop = stopsAdded;
    const sortedCutPoints = [...currentCutPoints].sort((a, b) => a - b).filter(s => s > 0 && s < maxStop);
    
    let allSegmentsEnds = [...sortedCutPoints, maxStop];
    allSegmentsEnds = Array.from(new Set(allSegmentsEnds)).filter(s => s > 0).sort((a, b) => a - b);
    
    // Create a lookup map from EndStopPosition to DriverId from the assignments to preserve
    const assignmentLookup = new Map<number, number>();
    driverAssignmentsToPreserve.forEach(s => assignmentLookup.set(s.endStopPosition, s.driverId));

    const segments: RouteSegmentAssignment[] = [];
    
    allSegmentsEnds.forEach(cutPoint => {
        const driverId = assignmentLookup.get(cutPoint) || 0; 

        segments.push({
            endStopPosition: cutPoint,
            planId: planId,
            driverId: driverId, 
        });
    });
    
    return segments.sort((a, b) => a.endStopPosition - b.endStopPosition);
};


const SplitConfigurationModal: React.FC<SplitConfigurationModalProps> = ({
    plan,
    currentSplits,
    scheduleData,
    drivers,
    currentSegments,
    driverAssignmentCounts,
    onSave,
    onClose,
    isLoading,
    error,
}) => {
    const [points, setPoints] = useState<number[]>(currentSplits);
    const [localError, setLocalError] = useState<string | null>(error);
    
    // Tracks if the user has finalized the cut points
    const [isCuttingComplete, setIsCuttingComplete] = useState<boolean>(currentSegments.length > 0);
    
    // Derived state holding the full segments (stop positions + driver assignments)
    const [segmentAssignments, setSegmentAssignments] = useState<RouteSegmentAssignment[]>([]);

    const maxSplittableStop = plan.stopsAdded > 0 ? plan.stopsAdded - 1 : 0;
    const hasData = scheduleData && scheduleData.length > 0; 
    
    // 1. Effect to synchronize raw points state with derived segmentAssignments list
    useEffect(() => {
        const newAssignments = calculateSegments(
            points, 
            plan.stopsAdded, 
            plan.planId, 
            segmentAssignments // Pass local state for preservation
        );
        setSegmentAssignments(newAssignments);
    }, [points, plan.stopsAdded, plan.planId]); 

    // 2. Effect to seed the initial segmentAssignments from props on mount
    useEffect(() => {
        if (currentSegments.length > 0 && segmentAssignments.length === 0) {
            setSegmentAssignments(currentSegments);
            setIsCuttingComplete(true); 
        }
        setLocalError(error);
    }, [currentSegments, error]);
    

    // --- Interactive Handlers ---

    const handleTogglePoint = (stopPosition: number) => {
        setLocalError(null);
        if (plan.stopsAdded <= 1 || stopPosition > maxSplittableStop) {
             return setLocalError('Cannot split after the final stop or route has < 2 stops.');
        }
        
        setPoints(prev => {
            if (prev.includes(stopPosition)) {
                return prev.filter(p => p !== stopPosition);
            } else {
                return [...prev, stopPosition].sort((a, b) => a - b);
            }
        });
        // If cuts are changed, unlock the assignment phase
        setIsCuttingComplete(false); 
    };
    
    const handleRemovePoint = (pointToRemove: number) => {
        setPoints(prev => prev.filter(p => p !== pointToRemove));
    };
    
    const handleDriverChange = (endStopPosition: number, driverId: number) => {
        setSegmentAssignments(prev => prev.map(s => 
            s.endStopPosition === endStopPosition ? { ...s, driverId } : s
        ));
    };
    
    const handleLockCuts = () => {
        if (plan.stopsAdded > 0) {
            setIsCuttingComplete(true);
            setLocalError(null);
        } else {
            setLocalError('Cannot proceed without route data.');
        }
    };

    // --- Save Handler ---
    const handleSave = () => {
        // Must be complete to save
        if (!isCuttingComplete || isAssignmentIncomplete) return;
        
        // 1. Filter segments to ONLY include those explicitly assigned (driverId > 0)
        const finalSegments = segmentAssignments.filter(s => s.driverId > 0); 
        
        // 2. Determine the raw split points that correspond to the final segments
        const finalSplits = finalSegments
            .map(s => s.endStopPosition)
            .filter(pos => pos < plan.stopsAdded); 

        onSave(plan.planId, finalSplits, finalSegments);
    };

    // --- Render Logic ---
    const segmentsToDisplay = segmentAssignments.filter(s => s.endStopPosition > 0).sort((a, b) => a.endStopPosition - b.endStopPosition);
    let currentStart = 1;
    
    const isAssignmentIncomplete = segmentsToDisplay.some(s => s.driverId === 0 && s.endStopPosition > 0);
    const totalSheets = segmentsToDisplay.length;
    
    // Generates the sheet breakdown list for the right pane
    const renderSheetBreakdown = () => {
        let output: JSX.Element[] = [];
        let sheetIndex = 1;

        if (plan.stopsAdded === 0) return [<span key="empty">No stops available.</span>];
        
        // 1. Pre-calculate local assignments count for the *entire* current route
        const localAssignmentsCount = new Map<number, number>();
        segmentAssignments.forEach(s => {
            if (s.driverId > 0) {
                localAssignmentsCount.set(s.driverId, (localAssignmentsCount.get(s.driverId) || 0) + 1);
            }
        });

        segmentsToDisplay.forEach(segment => {
            const startStop = currentStart;
            const endStop = segment.endStopPosition;
            const isAssigned = segment.driverId > 0;

            output.push(
                <div key={`segment-${sheetIndex}`} className="p-3 mb-3 rounded-md transition-colors bg-gray-50 dark:bg-gray-700">
                    <span className={`font-semibold ${isAssigned ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                        Sheet {sheetIndex}:
                    </span> Stops {startStop} &ndash; {endStop}
                    
                    <div className='flex items-center space-x-2 mt-2'>
                        <SelectCustom
                            id={`driver-select-${endStop}`}
                            options={[
                                { value: '0', label: `--- Select Driver ---` },
                                // 🌟 FINAL CALCULATION FIX: Shows already-assigned load (Workload - 1 for current slot)
                                ...drivers.map(d => {
                                    const driverId = d.id;
                                    
                                    // 1. Get total assignments from external plans (Global Prop)
                                    const externalCount = driverAssignmentCounts[driverId] || 0;
                                    
                                    // 2. Count how many times this driver is used in the current local state
                                    const localCount = localAssignmentsCount.get(driverId) || 0;
                                    
                                    // 3. Subtract 1 from the local count if the driver is currently assigned to the segment being rendered
                                    const assignmentsBeforeThisSlot = externalCount + localCount - (driverId === segment.driverId ? 1 : 0);
                                    
                                    // 4. Final Count: Total workload including the segment being selected (i.e., assignmentsBeforeThisSlot + 1)
                                    const totalWorkloadIfChosen = assignmentsBeforeThisSlot + 1;

                                    const label = `${d.firstName} ${d.surname}${totalWorkloadIfChosen > 1 ? ` (${totalWorkloadIfChosen} assigned)` : ''}`;
                                    
                                    // The value is the driver ID as a string
                                    return { value: driverId.toString(), label: label };
                                })
                                // ----------------------------------------------------------------------
                            ]}
                            // Value must also be converted to string for SelectCustom
                            value={segment.driverId.toString() || '0'} 
                            onChange={(e) => handleDriverChange(segment.endStopPosition, parseInt(e.target.value))}
                            className="w-full text-sm"
                            disabled={!isCuttingComplete} // Disable assignment unless cuts are confirmed
                        />
                        <button 
                            onClick={() => handleRemovePoint(endStop)} 
                            className="text-red-600 hover:text-red-400 p-1 rounded transition-colors flex-shrink-0"
                            title={`Remove split after Stop ${endStop}`}
                            disabled={endStop === plan.stopsAdded} // Always enabled unless it's the final stop
                        >
                            <TrashBinIcon size={16} />
                        </button>
                    </div>
                </div>
            );
            
            currentStart = endStop + 1;
            sheetIndex++;
        });

        return output;
    };


    return (
        <Modal 
            title={`Configure Driver Assignments: ${plan.planTitle}`}
            onClose={onClose}
            isOpen={true} 
            className="max-w-4xl" 
        >
            <div className="flex p-5 h-[70vh]">
                
                {/* LEFT SIDE: Schedule List (Interactive Splitting) */}
                <div className="w-1/2 overflow-y-auto pr-4 border-r dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-3 dark:text-white">
                        Route Stops ({plan.stopsAdded} Total)
                    </h3>
                    <p className='text-sm text-gray-500 mb-4'>
                        {isCuttingComplete 
                            ? 'Cuts Locked. Use Edit Cuts to change.'
                            : 'Double-click a stop to set/remove a split point *after* that stop.'}
                    </p>
                    
                    {/* local error rendering */}
                    {error && <div className="text-red-500 p-3 bg-red-50 rounded-md text-sm mb-4">{error}</div>}
                    
                    {!hasData && (<div className="text-gray-500 p-3">Loading stop details...</div>)}

                    {hasData && (
                        <div className="space-y-1">
                            {scheduleData!.map((item) => (
                                <div 
                                    key={item.stopPosition} 
                                    className={`p-2 rounded-md transition-colors text-sm flex items-center cursor-pointer ${
                                        points.includes(item.stopPosition) 
                                            ? 'bg-red-100 dark:bg-red-900/50 border border-red-400' 
                                            : !isCuttingComplete && item.stopPosition <= maxSplittableStop ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'cursor-default opacity-70'
                                    }`}
                                    onDoubleClick={!isCuttingComplete ? () => handleTogglePoint(item.stopPosition) : undefined} 
                                    title={
                                        isCuttingComplete 
                                            ? "Cuts are locked. Use 'Edit Cuts' to modify."
                                            : item.stopPosition <= maxSplittableStop 
                                                ? `Double-click to split after stop ${item.stopPosition}`
                                                : `Final stop - cannot split.`
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

                {/* RIGHT SIDE: Driver Assignment Configuration */}
                <div className="w-1/2 pl-4 flex flex-col space-y-4">
                    <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700">
                        <p className="font-bold text-lg text-indigo-800 dark:text-white">
                            Total Sheets: {totalSheets}
                        </p>
                    </div>

                    {/* Assignment Control Block */}
                    {!isCuttingComplete ? (
                        <div className="border p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/50 flex-grow flex flex-col justify-center items-center space-y-3">
                            <p className="font-semibold text-center text-lg">Step 1: Finalize Route Cuts</p>
                            <p className="text-sm text-center">
                                Review the left pane. Once complete, confirm the cuts to start assigning drivers.
                            </p>
                            <Button 
                                onClick={handleLockCuts} 
                                disabled={plan.stopsAdded === 0}
                                variant="primary"
                            >
                                {points.length > 0 ? `Confirm ${points.length} Cut(s)` : 'Confirm Single Sheet'}
                            </Button>
                        </div>
                    ) : (
                        // Assignment UI (Only visible when cuts are locked)
                        <div className="border p-4 rounded-lg bg-white dark:bg-gray-800 space-y-3 flex-grow overflow-y-auto">
                            <h4 className="font-semibold text-base mb-3 border-b pb-2 dark:border-gray-700 dark:text-white">Assignments:</h4>
                            
                            {isAssignmentIncomplete && (
                                <p className="text-sm text-red-500 mb-3 flex items-center">
                                    <CloseIcon size={16} className="mr-1" /> All segments must be assigned a driver.
                                </p>
                            )}

                            {totalSheets > 0 ? (
                                <div className="flex flex-col text-sm">
                                    {renderSheetBreakdown()}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 pt-5">No segments to assign.</div>
                            )}
                            
                            {/* Option to UNLOCK cuts */}
                            <div className="flex justify-start pt-3 border-t dark:border-gray-700">
                                <Button 
                                    onClick={() => setIsCuttingComplete(false)} 
                                    variant="secondary"
                                    size="sm"
                                >
                                    <PencilIcon size={16} className='mr-1' /> Edit Cuts
                                </Button>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between p-4 border-t dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 self-center">
                    {points.length} Splits set.
                </p>
                <div className="flex space-x-4">
                    <Button onClick={onClose} variant="secondary">Cancel</Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={!isCuttingComplete || isAssignmentIncomplete}
                        variant="primary"
                    >
                        Save & Assign ({isAssignmentIncomplete ? 'Incomplete' : totalSheets} Sheets)
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SplitConfigurationModal;