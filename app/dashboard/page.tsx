'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { File, Folder, Trash2, Upload, HardDrive, LogOut, Download, ChevronLeft, Search, SortAsc, SortDesc, FolderPlus, X, FileText, Image, Video, Music, Archive, RefreshCw, Home } from 'lucide-react';
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

    const handleUpload = async (uploadFiles: FileList) => {
        setUploading(true);
        const fileArray = Array.from(uploadFiles);

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
                    alert(`Upload Failed: ${file.name} - ${errorData.error || 'Unknown Error'}`);
                }
            } catch {
                alert(`Error: ${file.name}`);
            }
        }

        setUploading(false);
        setUploadProgress({});
        fetchFiles(currentPath);
    };

    const handleDelete = async (filename: string) => {
        if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;
        try {
            const filePath = currentPath ? `${currentPath}/${filename}` : filename;
            const res = await fetch(`/api/files?path=${encodeURIComponent(filePath)}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchFiles(currentPath);
            }
        } catch {
            alert('Delete failed');
        }
    };

    const handleDownload = (filename: string) => {
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
                headers: { 'Content-Type': 'application/json' },
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
        } catch {
            alert('Failed to create folder');
        } finally {
            setCreatingFolder(false);
        }
    };

    const getFileIcon = (filename: string, isDirectory: boolean) => {
        if (isDirectory) return <Folder className="text-[#8B7355]" size={24} strokeWidth={1.5} />;

        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        const videoExts = ['mp4', 'webm', 'avi', 'mov', 'mkv'];
        const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];
        const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
        const docExts = ['pdf', 'doc', 'docx', 'txt', 'md', 'xls', 'xlsx'];

        if (imageExts.includes(ext)) return <Image className="text-emerald-600" size={24} strokeWidth={1.5} />;
        if (videoExts.includes(ext)) return <Video className="text-violet-600" size={24} strokeWidth={1.5} />;
        if (audioExts.includes(ext)) return <Music className="text-rose-500" size={24} strokeWidth={1.5} />;
        if (archiveExts.includes(ext)) return <Archive className="text-amber-600" size={24} strokeWidth={1.5} />;
        if (docExts.includes(ext)) return <FileText className="text-blue-600" size={24} strokeWidth={1.5} />;

        return <File className="text-gray-400" size={24} strokeWidth={1.5} />;
    };

    const filteredAndSortedFiles = files
        .filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
            let comparison = 0;
            switch (sortBy) {
                case 'name': comparison = a.name.localeCompare(b.name); break;
                case 'size': comparison = a.size - b.size; break;
                case 'modified': comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime(); break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.length > 0) {
            handleUpload(e.dataTransfer.files);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const usagePercent = (usage / (35 * 1024 * 1024 * 1024)) * 100;

    return (
        <div
            className="min-h-screen p-6 lg:p-10 font-[family-name:var(--font-inter)]"
            style={{ backgroundColor: '#F5F0E8', color: '#2C2C2C' }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-full shadow-sm border border-[#E0D8CC]">
                        <HardDrive className="text-[#8B7355]" size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-light text-[#2C2C2C]" style={{ fontFamily: "serif" }}>Cressets</h1>
                        <p className="text-[#6B6B6B] text-sm tracking-wider uppercase mt-1">File Management System</p>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full lg:w-auto">
                    <div className="flex-1 lg:flex-none flex items-center gap-4 bg-white/50 p-3 rounded-lg border border-[#E0D8CC]">
                        <div className="flex-1 lg:w-48">
                            <div className="flex justify-between text-xs text-[#6B6B6B] mb-1.5 uppercase tracking-wider font-medium">
                                <span>{formatSize(usage)} Used</span>
                                <span>35 GB Limit</span>
                            </div>
                            <div className="h-1.5 bg-[#E0D8CC] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(usagePercent, 100)}%`,
                                        backgroundColor: '#8B7355'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="p-3 text-[#6B6B6B] hover:text-[#2C2C2C] hover:bg-white rounded-full transition-all border border-transparent hover:border-[#E0D8CC]"
                        title="Logout"
                    >
                        <LogOut size={20} strokeWidth={1.5} />
                    </button>
                </div>
            </motion.div>

            {/* Breadcrumbs */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 flex items-center gap-2 text-sm text-[#6B6B6B]">
                <button
                    onClick={() => setCurrentPath('')}
                    className={`flex items-center gap-1 hover:text-[#8B7355] transition-colors ${!currentPath ? 'text-[#8B7355] font-medium' : ''}`}
                >
                    <Home size={14} /> Home
                </button>
                {currentPath.split('/').map((segment, index, arr) => (
                    <span key={index} className="flex items-center gap-2">
                        <span className="text-[#E0D8CC]">/</span>
                        <button
                            onClick={() => setCurrentPath(arr.slice(0, index + 1).join('/'))}
                            className={`hover:text-[#8B7355] transition-colors ${index === arr.length - 1 ? 'text-[#2C2C2C] font-medium' : ''}`}
                        >
                            {segment}
                        </button>
                    </span>
                ))}
            </motion.div>

            {/* Toolbar */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                <div className="flex gap-3 flex-wrap">
                    {currentPath && (
                        <button
                            onClick={() => setCurrentPath(currentPath.split('/').slice(0, -1).join('/'))}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E0D8CC] text-[#2C2C2C] rounded-md hover:bg-[#FAF9F6] transition-all text-sm font-medium"
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                    )}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#2C2C2C] text-white rounded-md hover:opacity-90 transition-all text-sm font-medium tracking-wide uppercase shadow-sm"
                    >
                        <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                    <button
                        onClick={() => setShowCreateFolder(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E0D8CC] text-[#2C2C2C] rounded-md hover:border-[#8B7355] hover:text-[#8B7355] transition-all text-sm font-medium"
                    >
                        <FolderPlus size={16} /> New Folder
                    </button>
                    <button
                        onClick={() => fetchFiles(currentPath)}
                        disabled={loading}
                        className="p-2.5 bg-white border border-[#E0D8CC] text-[#6B6B6B] rounded-md hover:text-[#2C2C2C] transition-all"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Search & Sort */}
                <div className="flex gap-3 items-center">
                    <div className="relative group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] group-focus-within:text-[#8B7355] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-[#E0D8CC] rounded-md text-sm text-[#2C2C2C] focus:border-[#8B7355] transition-all w-full lg:w-64 outline-none placeholder:text-[#BBB]"
                        />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'size' | 'modified')}
                        className="px-4 py-2.5 bg-white border border-[#E0D8CC] rounded-md text-sm text-[#2C2C2C] focus:border-[#8B7355] transition-all cursor-pointer outline-none"
                    >
                        <option value="name">Name</option>
                        <option value="size">Size</option>
                        <option value="modified">Date</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-2.5 bg-white border border-[#E0D8CC] rounded-md hover:border-[#8B7355] transition-all text-[#6B6B6B]"
                    >
                        {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                    </button>
                </div>

                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && handleUpload(e.target.files)} />
            </motion.div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-white border border-[#E0D8CC] rounded-md shadow-sm">
                    <h4 className="text-xs font-bold text-[#8B7355] uppercase tracking-wider mb-3">Uploading...</h4>
                    {Object.entries(uploadProgress).map(([name, progress]) => (
                        <div key={name} className="mb-3 last:mb-0">
                            <div className="flex justify-between text-xs text-[#6B6B6B] mb-1">
                                <span className="truncate max-w-[200px] font-medium">{name}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1 bg-[#F5F0E8] rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-300 bg-[#8B7355]" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Create Folder Modal */}
            <AnimatePresence>
                {showCreateFolder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0a0a0f]/20 backdrop-blur-sm"
                            onClick={() => setShowCreateFolder(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative w-full max-w-sm bg-white p-6 rounded-lg shadow-xl border border-[#E0D8CC]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-serif text-[#2C2C2C]">New Folder</h3>
                                <button onClick={() => setShowCreateFolder(false)} className="text-[#9B9B9B] hover:text-[#2C2C2C]"><X size={20} /></button>
                            </div>
                            <input
                                type="text"
                                placeholder="Folder Name"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                className="w-full px-4 py-3 bg-[#F9F7F2] border border-[#E0D8CC] rounded-md text-[#2C2C2C] focus:border-[#8B7355] transition-all placeholder:text-[#BBB] mb-6 outline-none"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setShowCreateFolder(false)} className="flex-1 px-4 py-2.5 bg-white border border-[#E0D8CC] text-[#6B6B6B] rounded-md hover:bg-[#F9F7F2]">Cancel</button>
                                <button
                                    onClick={handleCreateFolder}
                                    disabled={creatingFolder || !newFolderName.trim()}
                                    className="flex-1 px-4 py-2.5 bg-[#2C2C2C] text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-all font-medium"
                                >
                                    {creatingFolder ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main Content: File List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white border border-[#E0D8CC] rounded-lg p-6 h-32 animate-pulse" />
                    ))
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredAndSortedFiles.map((file, index) => (
                            <motion.div
                                key={file.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.02 }}
                                layout
                                className="group relative bg-white border border-[#E0D8CC] rounded-lg p-5 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                onClick={() => file.isDirectory ? setCurrentPath(currentPath ? `${currentPath}/${file.name}` : file.name) : null}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-[#F9F7F2] rounded-md group-hover:bg-[#F5F0E8] transition-colors border border-transparent group-hover:border-[#E0D8CC]">
                                        {getFileIcon(file.name, file.isDirectory)}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!file.isDirectory && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDownload(file.name); }} className="p-1.5 text-[#6B6B6B] hover:text-[#8B7355] hover:bg-[#F5F0E8] rounded transition-all" title="Download">
                                                <Download size={16} />
                                            </button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }} className="p-1.5 text-[#6B6B6B] hover:text-red-500 hover:bg-red-50 rounded transition-all" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium text-[#2C2C2C] truncate mb-1 text-sm group-hover:text-[#8B7355] transition-colors" title={file.name}>{file.name}</h3>
                                    <div className="flex justify-between items-center text-xs text-[#9B9B9B] uppercase tracking-wide">
                                        <span>{file.isDirectory ? 'Folder' : formatSize(file.size)}</span>
                                        <span>{formatDate(file.modified)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!loading && filteredAndSortedFiles.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex flex-col items-center justify-center p-20 border-2 border-dashed border-[#E0D8CC] rounded-xl bg-white/50">
                        <div className="p-4 bg-[#F5F0E8] rounded-full mb-4">
                            <Upload size={32} className="text-[#8B7355]" />
                        </div>
                        <p className="text-lg font-serif text-[#2C2C2C] mb-1">{searchQuery ? 'No results found' : 'This folder is empty'}</p>
                        <p className="text-sm text-[#6B6B6B]">{searchQuery ? 'Try different keywords' : 'Drag files here or start a new upload'}</p>
                    </motion.div>
                )}
            </div>

            {/* Drag Overlay */}
            <AnimatePresence>
                {dragActive && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#8B7355]/90 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
                        <div className="p-10 border-4 border-white border-dashed rounded-xl text-center">
                            <Upload size={64} className="text-white mx-auto mb-6" />
                            <h2 className="text-3xl font-serif text-white mb-2">Drop files here</h2>
                            <p className="text-white/80 uppercase tracking-widest text-sm">to upload instantly</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
