"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '../ui/button/Button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<boolean>;
    fileName: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, fileName }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        setIsDeleting(true);
        setError(null);
        const success = await onConfirm();
        setIsDeleting(false);
        if (success) {
            onClose();
        } else {
            setError(`Failed to delete "${fileName}". Please try again.`);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <div className="p-6">
                <div className="flex items-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Confirm Deletion</h3>
                </div>
                <p className="text-gray-600 dark:text-white">
                    Are you sure you want to delete <span className="font-bold">{fileName}</span>? This action cannot be undone.
                </p>
                {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                        <p>{error}</p>
                    </div>
                )}
                <div className="flex items-center justify-end w-full gap-3 mt-6">
                    <Button onClick={onClose} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={isDeleting}>
                        {isDeleting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};