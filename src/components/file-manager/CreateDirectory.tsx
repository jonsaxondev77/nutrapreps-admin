"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/modal';
import { FolderPlus, Loader2, X, AlertTriangle } from 'lucide-react';
import Label from '@/components/form/Label';
import Button from '../ui/button/Button';
import InputFieldCustom from '../form/input/InputFieldCustom';

interface CreateDirectoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPath: string;
    onCreate: (folderName: string) => Promise<boolean>;
}

export const CreateDirectoryModal: React.FC<CreateDirectoryModalProps> = ({
    isOpen,
    onClose,
    currentPath,
    onCreate,
}) => {
    const [folderName, setFolderName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetModal = () => {
        setFolderName('');
        setError(null);
        setIsCreating(false);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!folderName.trim()) {
            setError('Folder name cannot be empty.');
            return;
        }

        setIsCreating(true);
        const success = await onCreate(folderName);
        setIsCreating(false);

        if (success) {
            toast.success('Directory created successfully!');
            handleClose();
        } else {
            setError(`Failed to create directory. Please try again.`);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] p-5 lg:p-10">
            <div className="p-6">
               
                <div className="flex items-center mb-4">
                    <FolderPlus className="w-8 h-8 text-blue-500 mr-3" />
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90">Create New Folder</h4>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    Current Path: <span className="font-mono">{currentPath || '/'}</span>
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="folderName">Folder Name</Label>
                        <InputFieldCustom
                            id="folderName"
                            type="text"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            disabled={isCreating}
                            required
                            className='dark:text-white'
                        />
                    </div>
                    {error && (
                        <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            {error}
                        </div>
                    )}
                    <div className="flex items-center justify-end w-full gap-3 mt-6">
                       
                        <Button size="sm" disabled={isCreating}>
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Folder'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};