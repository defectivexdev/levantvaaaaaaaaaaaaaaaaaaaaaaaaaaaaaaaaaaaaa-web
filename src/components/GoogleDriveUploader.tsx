'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface UploadedFile {
    fileId: string;
    fileName: string;
    webViewLink: string;
    webContentLink: string;
    mimeType: string;
    size: string;
}

interface UploadProgress {
    fileName: string;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
    result?: UploadedFile;
}

export default function GoogleDriveUploader() {
    const [isDragging, setIsDragging] = useState(false);
    const [uploads, setUploads] = useState<UploadProgress[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        handleFiles(files);
        
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFiles = async (files: File[]) => {
        for (const file of files) {
            await uploadFile(file);
        }
    };

    const uploadFile = async (file: File) => {
        const uploadId = Date.now() + Math.random();
        const newUpload: UploadProgress = {
            fileName: file.name,
            progress: 0,
            status: 'uploading',
        };

        setUploads(prev => [...prev, newUpload]);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Create XMLHttpRequest for progress tracking
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    setUploads(prev =>
                        prev.map(upload =>
                            upload.fileName === file.name && upload.status === 'uploading'
                                ? { ...upload, progress }
                                : upload
                        )
                    );
                }
            });

            // Handle completion
            const uploadPromise = new Promise<UploadedFile>((resolve, reject) => {
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.responseText);
                        if (response.success) {
                            resolve(response.file);
                        } else {
                            reject(new Error(response.error || 'Upload failed'));
                        }
                    } else {
                        const response = JSON.parse(xhr.responseText);
                        reject(new Error(response.error || `Upload failed with status ${xhr.status}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Network error occurred'));
                });

                xhr.addEventListener('abort', () => {
                    reject(new Error('Upload cancelled'));
                });
            });

            xhr.open('POST', '/api/upload/gdrive');
            xhr.send(formData);

            const result = await uploadPromise;

            setUploads(prev =>
                prev.map(upload =>
                    upload.fileName === file.name && upload.status === 'uploading'
                        ? { ...upload, status: 'success', progress: 100, result }
                        : upload
                )
            );
        } catch (error: any) {
            console.error('Upload error:', error);
            setUploads(prev =>
                prev.map(upload =>
                    upload.fileName === file.name && upload.status === 'uploading'
                        ? { ...upload, status: 'error', error: error.message }
                        : upload
                )
            );
        }
    };

    const removeUpload = (fileName: string) => {
        setUploads(prev => prev.filter(upload => upload.fileName !== fileName));
    };

    const formatFileSize = (bytes: string | number) => {
        const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
            {/* Upload Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                    transition-all duration-200
                    ${isDragging
                        ? 'border-accent-gold bg-accent-gold/10 scale-[1.02]'
                        : 'border-white/20 hover:border-accent-gold/50 hover:bg-white/5'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-4">
                    <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center
                        ${isDragging ? 'bg-accent-gold/20' : 'bg-white/10'}
                        transition-colors
                    `}>
                        <Upload size={32} className={isDragging ? 'text-accent-gold' : 'text-gray-400'} />
                    </div>

                    <div>
                        <p className="text-lg font-semibold text-white mb-1">
                            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                        </p>
                        <p className="text-sm text-gray-400">
                            or click to browse • Max 100MB per file
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload List */}
            {uploads.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        Uploads ({uploads.length})
                    </h3>

                    {uploads.map((upload, index) => (
                        <div
                            key={`${upload.fileName}-${index}`}
                            className="bg-[#111] border border-white/10 rounded-lg p-4"
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className="shrink-0 mt-1">
                                    {upload.status === 'uploading' && (
                                        <Loader2 size={20} className="text-blue-400 animate-spin" />
                                    )}
                                    {upload.status === 'success' && (
                                        <CheckCircle size={20} className="text-green-400" />
                                    )}
                                    {upload.status === 'error' && (
                                        <AlertCircle size={20} className="text-red-400" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <p className="text-sm font-medium text-white truncate">
                                            {upload.fileName}
                                        </p>
                                        <button
                                            onClick={() => removeUpload(upload.fileName)}
                                            className="text-gray-500 hover:text-white transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Progress Bar */}
                                    {upload.status === 'uploading' && (
                                        <div className="space-y-1">
                                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-accent-gold h-full transition-all duration-300"
                                                    style={{ width: `${upload.progress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                Uploading... {upload.progress}%
                                            </p>
                                        </div>
                                    )}

                                    {/* Success */}
                                    {upload.status === 'success' && upload.result && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-green-400">
                                                ✓ Uploaded successfully • {formatFileSize(upload.result.size)}
                                            </p>
                                            <div className="flex gap-2">
                                                <a
                                                    href={upload.result.webViewLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-accent-gold hover:text-accent-gold/80 transition-colors"
                                                >
                                                    <ExternalLink size={12} />
                                                    View in Drive
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(upload.result!.webViewLink);
                                                    }}
                                                    className="text-xs text-gray-400 hover:text-white transition-colors"
                                                >
                                                    Copy Link
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error */}
                                    {upload.status === 'error' && (
                                        <p className="text-xs text-red-400">
                                            ✗ {upload.error || 'Upload failed'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
