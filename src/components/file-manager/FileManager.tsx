"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { ChevronLeft, Folder, Image, FileText, Trash2, Upload, Loader2, X, FileUp, FolderPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/modal';
import Button from '../ui/button/Button';
import { CreateDirectoryModal } from './CreateDirectory';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface BunnyFile {
    Guid: string;
    ObjectName: string;
    IsDirectory: boolean;
    Path: string;
    FullPath: string;
}

export const FileManager: React.FC = () => {
    const [files, setFiles] = useState<BunnyFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPath, setCurrentPath] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState<BunnyFile | null>(null);

    const fetchFiles = useCallback(async (path: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('path', path);
            const response = await fetch(`/api/bunny-cdn?${params.toString()}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || `HTTP error: ${response.status}`);
            }
            const data: BunnyFile[] = await response.json();
            setFiles(data);
            setCurrentPath(path);
        } catch (error: any) {
            console.error('Fetch error:', error);
            toast.error(error.message);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFiles('/');
    }, [fetchFiles]);

    const handleFileClick = (file: BunnyFile) => {
        if (file.IsDirectory) {
            const newPath = file.Path;
            fetchFiles(newPath);
        }
    };

    const handleBackClick = () => {
        if (currentPath === '/') return;
        const pathParts = currentPath.split('/').filter(Boolean);
        const parentPath = pathParts.length > 1 ? `/${pathParts.slice(0, -1).join('/')}/` : '/';
        fetchFiles(parentPath);
    };

    const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', currentPath);

        try {
            const response = await fetch('/api/bunny-cdn', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Upload failed');
            }

            toast.success('File uploaded successfully!');
            fetchFiles(currentPath);
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleCreateDirectory = async (folderName: string) => {
        setIsCreating(true);
        const toastId = toast.loading(`Creating folder ${folderName}...`);

        try {
            const path = `${currentPath}${folderName}/`;
            const response = await fetch(`/api/bunny-cdn`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to create directory');
            }

            toast.success('Directory created successfully!', { id: toastId });
            fetchFiles(currentPath);
            setIsCreateModalOpen(false);
        } catch (error: any) {
            console.error('Create directory error:', error);
            toast.error(error.message, { id: toastId });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (file: BunnyFile) => {
        const toastId = toast.loading(`Deleting ${file.ObjectName}...`);

        try {
            const params = new URLSearchParams();
            params.set('path', file.FullPath);

            const response = await fetch(`/api/bunny-cdn?${params.toString()}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Deletion failed');
            }

            toast.success(`${file.ObjectName} deleted successfully!`, { id: toastId });
            fetchFiles(currentPath);
            return true;
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message, { id: toastId });
            return false;
        }
    };

    const renderFileIcon = (file: BunnyFile) => {
        if (file.IsDirectory) {
            return <Folder className="w-12 h-12 text-blue-500 mb-2" />;
        }
        const extension = file.ObjectName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
            case 'webp':
            case 'avif':
                return <Image className="w-12 h-12 text-green-500 mb-2" />;
            default:
                return <FileText className="w-12 h-12 text-gray-400 mb-2" />;
        }
    };

    return (
        <>
            <div className="flex flex-col h-[70vh] bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold">File Manager</h3>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <FolderPlus size={20} className="mr-2" />
                            New Folder
                        </Button>
                        <label htmlFor="file-upload" className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 disabled:opacity-50">
                            {uploading ? <Loader2 className="animate-spin" size={20} /> : <FileUp size={20} />}
                            <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                        </label>
                        <input id="file-upload" type="file" className="sr-only" onChange={handleFileUpload} disabled={uploading} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                        <button onClick={handleBackClick} disabled={currentPath === '/'} className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50">
                            <ChevronLeft size={16} />
                        </button>
                        <span>{currentPath}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {loading ? (
                            <div className="col-span-full flex justify-center items-center h-48">
                                <Loader2 className="animate-spin text-gray-400" size={32} />
                            </div>
                        ) : (
                            files.map((file) => (
                                <div
                                    key={file.Guid}
                                    className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors relative group"
                                >
                                    <button
                                        onClick={() => {
                                            setFileToDelete(file);
                                            setIsDeleteModalOpen(true);
                                        }}
                                        className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label={`Delete ${file.ObjectName}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleFileClick(file)}
                                        className="w-full flex flex-col items-center cursor-pointer"
                                    >
                                        {renderFileIcon(file)}
                                        <span className="text-xs text-center truncate w-full mt-2">{file.ObjectName}</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <CreateDirectoryModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                currentPath={currentPath}
                onCreate={handleCreateDirectory}
                isCreating={isCreating}
            />

            {fileToDelete && (
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={() => handleDelete(fileToDelete)}
                    fileName={fileToDelete.ObjectName}
                />
            )}
        </>
    );
};