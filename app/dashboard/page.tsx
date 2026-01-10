'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { File, Folder, Trash2, Upload, HardDrive, LogOut, Download, Plus, ChevronLeft, Search, SortAsc, SortDesc, FolderPlus, X, FileText, Image, Video, Music, Archive, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FileInfo {
    name: string;
    isDirectory: boolean;
    size: number;
    modified: string;
}

export default function Dashboard() {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [currentPath, setCurrentPath] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const [usage, setUsage] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'size' | 'modified'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [creatingFolder, setCreatingFolder] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const fetchFiles = async (path: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
            if (res.ok) {
                const data = await res.json();
                setFiles(data.files);
                setUsage(data.usage);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentPath);
    }, [currentPath]);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleUpload = async (files: FileList) => {
        setUploading(true);
        const fileArray = Array.from(files);

        for (const file of fileArray) {
            setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

            try {
                const res = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`, {
                    method: 'POST',
                    headers: {
                        'x-filename': encodeURIComponent(file.name),
                        'content-length': file.size.toString(),
                    },
                    body: file,
                });

                if (res.ok) {
                    setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
                } else {
                    const errorData = await res.json();
                    alert(`Upload Failed: ${file.name} - ${errorData.error || 'Unknown error'}`);
                }
            } catch (error) {
                alert(`Error Uploading: ${file.name}`);
            }
        }

        setUploading(false);
        setUploadProgress({});
        fetchFiles(currentPath);
    };

    const handleDelete = async (filename: string) => {
        if (!confirm(`Delete ${filename}?`)) return;
        try {
            const filePath = currentPath ? `${currentPath}/${filename}` : filename;
            const res = await fetch(`/api/files?path=${encodeURIComponent(filePath)}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchFiles(currentPath);
            }
        } catch (error) {
            alert('Delete failed');
        }
    };

    const handleDownload = async (filename: string) => {
        const filePath = currentPath ? `${currentPath}/${filename}` : filename;
        const url = `/api/files?path=${encodeURIComponent(filePath)}&action=download`;
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setCreatingFolder(true);

        try {
            const res = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ folderName: newFolderName.trim() }),
            });

            if (res.ok) {
                setNewFolderName('');
                setShowCreateFolder(false);
                fetchFiles(currentPath);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create folder');
            }
        } catch (error) {
            alert('Failed to create folder');
        } finally {
            setCreatingFolder(false);
        }
    };

    const getFileIcon = (filename: string, isDirectory: boolean) => {
        if (isDirectory) return <Folder className="text-yellow-400" size={24} />;

        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
        const videoExts = ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv'];
        const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
        const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
        const docExts = ['pdf', 'doc', 'docx', 'txt', 'md', 'xls', 'xlsx', 'ppt', 'pptx'];

        if (imageExts.includes(ext)) return <Image className="text-green-400" size={24} />;
        if (videoExts.includes(ext)) return <Video className="text-purple-400" size={24} />;
        if (audioExts.includes(ext)) return <Music className="text-pink-400" size={24} />;
        if (archiveExts.includes(ext)) return <Archive className="text-orange-400" size={24} />;
        if (docExts.includes(ext)) return <FileText className="text-blue-400" size={24} />;

        return <File className="text-cyan-400" size={24} />;
    };

    const filteredAndSortedFiles = files
        .filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            // Directories first
            if (a.isDirectory !== b.isDirectory) {
                return a.isDirectory ? -1 : 1;
            }

            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'size':
                    comparison = a.size - b.size;
                    break;
                case 'modified':
                    comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUpload(e.dataTransfer.files);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    return (
        <div
            className="flex-1 p-8 text-white relative z-10"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-8 backdrop-blur-sm bg-black/20 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        CRESSETS STORAGE
                    </h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <HardDrive size={16} />
                        <span>{formatSize(usage)} / 35 GB</span>
                        <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-500"
                                style={{ width: `${(usage / (35 * 1024 * 1024 * 1024)) * 100}%` }}
                            />
                        </div>
                    </div>
                    <button onClick={() => router.push('/')} className="text-red-400 hover:text-red-300">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Breadcrumbs */}
            {currentPath && (
                <div className="mb-4 flex items-center gap-2 text-sm">
                    <button
                        onClick={() => setCurrentPath('')}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        Root
                    </button>
                    {currentPath.split('/').map((segment, index, arr) => (
                        <span key={index} className="flex items-center gap-2">
                            <span className="text-gray-500">/</span>
                            <button
                                onClick={() => setCurrentPath(arr.slice(0, index + 1).join('/'))}
                                className={`${index === arr.length - 1 ? 'text-white' : 'text-cyan-400 hover:text-cyan-300'} transition-colors`}
                            >
                                {segment}
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Actions Bar */}
            <div className="mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex gap-2">
                    {currentPath && (
                        <button
                            onClick={() => setCurrentPath(currentPath.split('/').slice(0, -1).join('/'))}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all border border-white/5"
                        >
                            <ChevronLeft size={18} />
                            BACK
                        </button>
                    )}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 border border-cyan-500/50 rounded-lg hover:bg-cyan-600/40 text-cyan-400 transition-all disabled:opacity-50"
                    >
                        <Upload size={18} />
                        {uploading ? 'UPLOADING...' : 'UPLOAD'}
                    </button>
                    <button
                        onClick={() => setShowCreateFolder(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg hover:bg-purple-600/40 text-purple-400 transition-all"
                    >
                        <FolderPlus size={18} />
                        NEW FOLDER
                    </button>
                    <button
                        onClick={() => fetchFiles(currentPath)}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all border border-white/5 disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Search & Sort */}
                <div className="flex-1 flex gap-4 justify-end items-center">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-cyan-500/50 transition-colors outline-none w-48"
                        />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'size' | 'modified')}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:border-cyan-500/50 transition-colors outline-none cursor-pointer"
                    >
                        <option value="name">Name</option>
                        <option value="size">Size</option>
                        <option value="modified">Date</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
                    </button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={(e) => e.target.files && handleUpload(e.target.files)}
                />
            </div>

            {/* Create Folder Modal */}
            <AnimatePresence>
                {showCreateFolder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
                        onClick={() => setShowCreateFolder(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900/90 border border-white/10 rounded-2xl p-6 w-96 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Create New Folder</h3>
                                <button
                                    onClick={() => setShowCreateFolder(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Folder name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                className="w-full p-3 bg-black/50 border border-white/20 rounded-lg text-white focus:border-purple-500 transition-colors placeholder:text-gray-500 outline-none mb-4"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCreateFolder(false)}
                                    className="flex-1 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateFolder}
                                    disabled={creatingFolder || !newFolderName.trim()}
                                    className="flex-1 px-4 py-2 bg-purple-600/40 border border-purple-500/50 rounded-lg hover:bg-purple-600/60 text-purple-300 transition-all disabled:opacity-50"
                                >
                                    {creatingFolder ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="mb-4 p-4 bg-black/40 border border-cyan-500/30 rounded-xl">
                    <h4 className="text-sm font-medium text-cyan-400 mb-2">Uploading...</h4>
                    {Object.entries(uploadProgress).map(([name, progress]) => (
                        <div key={name} className="mb-2">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span className="truncate max-w-[200px]">{name}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Drag Overlay */}
            {dragActive && (
                <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-cyan-400 rounded-lg m-4 pointer-events-none">
                    <h2 className="text-3xl font-bold text-cyan-200">DROP FILE TO UPLOAD</h2>
                </div>
            )}

            {/* File List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-4 h-36 animate-pulse" />
                    ))
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredAndSortedFiles.map((file, index) => (
                            <motion.div
                                key={file.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.02 }}
                                layout
                                className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-cyan-500/50 transition-all group cursor-pointer relative overflow-hidden"
                                onClick={() => file.isDirectory ? setCurrentPath(currentPath ? `${currentPath}/${file.name}` : file.name) : null}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div className="p-3 bg-white/5 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                                        {getFileIcon(file.name, file.isDirectory)}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!file.isDirectory && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDownload(file.name); }}
                                                className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all"
                                                title="Download"
                                            >
                                                <Download size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }}
                                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="font-medium truncate mb-1 text-sm" title={file.name}>{file.name}</h3>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>{file.isDirectory ? 'Folder' : formatSize(file.size)}</span>
                                        <span>{formatDate(file.modified)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!loading && filteredAndSortedFiles.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-20 text-gray-500 border-2 border-dashed border-white/10 rounded-2xl">
                        <Upload size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">
                            {searchQuery ? 'NO MATCHING FILES' : 'NO FILES FOUND'}
                        </p>
                        <p className="text-sm opacity-70">
                            {searchQuery ? 'Try a different search term' : 'Drop files here or click Upload to add files'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
