"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Folder, Image, FileText, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface BunnyFile {
    Guid: string;
    ObjectName: string;
    IsDirectory: boolean;
    Path: string;
    FullPath: string;
    WebUrl?: string;
}

interface FileSelectorProps {
    onFileSelect: (file: BunnyFile) => void;
    onClose: () => void;
}

export const FileSelector: React.FC<FileSelectorProps> = ({ onFileSelect, onClose }) => {
    const [files, setFiles] = useState<BunnyFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPath, setCurrentPath] = useState('');

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
            let data: BunnyFile[] = await response.json();
            const PULL_ZONE_URL = process.env.NEXT_PUBLIC_BUNNY_CDN_PULL_ZONE_HOSTNAME;
            if (PULL_ZONE_URL) {
                data = data.map(file => ({
                    ...file,
                    WebUrl: file.IsDirectory ? undefined : `https://${PULL_ZONE_URL}/${file.FullPath}`
                }));
            }
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
        } else {
            onFileSelect(file);
        }
    };

    const handleBackClick = () => {
        if (currentPath === '/') return;
        const pathParts = currentPath.split('/').filter(Boolean);
        const parentPath = pathParts.length > 1 ? `/${pathParts.slice(0, -1).join('/')}/` : '/';
        fetchFiles(parentPath);
    };

    const renderFileIcon = (file: BunnyFile) => {
        if (file.IsDirectory) {
            return <Folder className="w-12 h-12 text-blue-500 mb-2" />;
        }
        const extension = file.ObjectName.split('.').pop()?.toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif'].includes(extension || '');
        if (isImage && file.WebUrl) {
            return (
                <div className="w-12 h-12 flex items-center justify-center mb-2 overflow-hidden rounded-md border">
                    <img
                        src={file.WebUrl}
                        alt={file.ObjectName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            );
        }
        return <FileText className="w-12 h-12 text-gray-400 mb-2" />;
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold">File Selector</h3>
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
                                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors relative cursor-pointer"
                                onClick={() => handleFileClick(file)}
                            >
                                {renderFileIcon(file)}
                                <span className="text-xs text-center truncate w-full mt-2">{file.ObjectName}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};