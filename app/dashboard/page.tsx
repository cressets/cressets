'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { File, Folder, Trash2, Upload, HardDrive, LogOut, Download, ChevronLeft, Search, SortAsc, SortDesc, FolderPlus, X, FileText, Image, Video, Music, Archive, RefreshCw } from 'lucide-react';
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
                    alert(`업로드 실패: ${file.name} - ${errorData.error || '알 수 없는 오류'}`);
                }
            } catch {
                alert(`오류 발생: ${file.name}`);
            }
        }

        setUploading(false);
        setUploadProgress({});
        fetchFiles(currentPath);
    };

    const handleDelete = async (filename: string) => {
        if (!confirm(`"${filename}"을(를) 삭제하시겠습니까?`)) return;
        try {
            const filePath = currentPath ? `${currentPath}/${filename}` : filename;
            const res = await fetch(`/api/files?path=${encodeURIComponent(filePath)}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchFiles(currentPath);
            }
        } catch {
            alert('삭제 실패');
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
                alert(data.error || '폴더 생성 실패');
            }
        } catch {
            alert('폴더 생성 실패');
        } finally {
            setCreatingFolder(false);
        }
    };

    const getFileIcon = (filename: string, isDirectory: boolean) => {
        if (isDirectory) return <Folder className="text-cyan-400" size={24} />;

        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        const videoExts = ['mp4', 'webm', 'avi', 'mov', 'mkv'];
        const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];
        const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
        const docExts = ['pdf', 'doc', 'docx', 'txt', 'md', 'xls', 'xlsx'];

        if (imageExts.includes(ext)) return <Image className="text-green-400" size={24} />;
        if (videoExts.includes(ext)) return <Video className="text-purple-400" size={24} />;
        if (audioExts.includes(ext)) return <Music className="text-pink-400" size={24} />;
        if (archiveExts.includes(ext)) return <Archive className="text-orange-400" size={24} />;
        if (docExts.includes(ext)) return <FileText className="text-blue-400" size={24} />;

        return <File className="text-gray-400" size={24} />;
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
            year: 'numeric', month: 'short', day: 'numeric',
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
            className="min-h-screen bg-[#0a0a0f] p-6 lg:p-10"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 p-6 rounded-2xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(3, 7, 18, 0.8) 100%)',
                    border: '1px solid rgba(6, 182, 212, 0.2)'
                }}
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
                        <HardDrive className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">내 클라우드</h1>
                        <p className="text-gray-500 text-sm">개인 웹하드</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 w-full lg:w-auto">
                    <div className="flex-1 lg:flex-none flex items-center gap-3">
                        <div className="flex-1 lg:w-48">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>{formatSize(usage)}</span>
                                <span>35 GB</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(usagePercent, 100)}%`,
                                        background: 'linear-gradient(90deg, #06b6d4, #3b82f6)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                        title="로그아웃"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </motion.div>

            {/* Breadcrumbs */}
            {currentPath && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex items-center gap-2 text-sm">
                    <button onClick={() => setCurrentPath('')} className="text-cyan-400 hover:text-cyan-300 transition-colors">홈</button>
                    {currentPath.split('/').map((segment, index, arr) => (
                        <span key={index} className="flex items-center gap-2">
                            <span className="text-gray-600">/</span>
                            <button
                                onClick={() => setCurrentPath(arr.slice(0, index + 1).join('/'))}
                                className={`${index === arr.length - 1 ? 'text-white' : 'text-cyan-400 hover:text-cyan-300'} transition-colors`}
                            >
                                {segment}
                            </button>
                        </span>
                    ))}
                </motion.div>
            )}

            {/* Actions Bar */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex gap-2 flex-wrap">
                    {currentPath && (
                        <button
                            onClick={() => setCurrentPath(currentPath.split('/').slice(0, -1).join('/'))}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all"
                        >
                            <ChevronLeft size={18} /> 이전
                        </button>
                    )}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium disabled:opacity-50 transition-all"
                        style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                    >
                        <Upload size={18} /> {uploading ? '업로드 중...' : '파일 업로드'}
                    </button>
                    <button
                        onClick={() => setShowCreateFolder(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all"
                    >
                        <FolderPlus size={18} /> 새 폴더
                    </button>
                    <button
                        onClick={() => fetchFiles(currentPath)}
                        disabled={loading}
                        className="p-2.5 bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Search & Sort */}
                <div className="flex-1 flex gap-3 justify-end items-center">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="파일 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:border-cyan-500 transition-all w-48 outline-none"
                        />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'size' | 'modified')}
                        className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-300 focus:border-cyan-500 transition-all cursor-pointer outline-none"
                    >
                        <option value="name">이름</option>
                        <option value="size">크기</option>
                        <option value="modified">날짜</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-2.5 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all text-gray-400"
                    >
                        {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
                    </button>
                </div>

                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => e.target.files && handleUpload(e.target.files)} />
            </motion.div>

            {/* Create Folder Modal */}
            <AnimatePresence>
                {showCreateFolder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateFolder(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="p-6 w-full max-w-md rounded-2xl"
                            style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(3, 7, 18, 0.95) 100%)', border: '1px solid rgba(6, 182, 212, 0.2)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">새 폴더 만들기</h3>
                                <button onClick={() => setShowCreateFolder(false)} className="p-2 hover:bg-gray-800 rounded-full"><X size={20} className="text-gray-500" /></button>
                            </div>
                            <input
                                type="text"
                                placeholder="폴더 이름"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-cyan-500 transition-all placeholder:text-gray-600 mb-4 outline-none"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setShowCreateFolder(false)} className="flex-1 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700">취소</button>
                                <button
                                    onClick={handleCreateFolder}
                                    disabled={creatingFolder || !newFolderName.trim()}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-white font-medium disabled:opacity-50"
                                    style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                                >
                                    {creatingFolder ? '생성 중...' : '만들기'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">업로드 중...</h4>
                    {Object.entries(uploadProgress).map(([name, progress]) => (
                        <div key={name} className="mb-2">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span className="truncate max-w-[200px]">{name}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }} />
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Drag Overlay */}
            <AnimatePresence>
                {dragActive && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-cyan-500/10 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none">
                        <div className="p-10 rounded-3xl" style={{ background: 'rgba(6, 182, 212, 0.2)', border: '2px dashed #06b6d4' }}>
                            <Upload size={48} className="text-cyan-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white">파일을 여기에 놓으세요</h2>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-gray-800/50 rounded-2xl p-5 h-36 animate-pulse" />
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
                                className="rounded-2xl p-5 cursor-pointer group relative overflow-hidden transition-all hover:scale-[1.02]"
                                style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(3, 7, 18, 0.6) 100%)', border: '1px solid rgba(255,255,255,0.05)' }}
                                onClick={() => file.isDirectory ? setCurrentPath(currentPath ? `${currentPath}/${file.name}` : file.name) : null}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div className="p-3 bg-gray-800/50 group-hover:bg-cyan-500/20 rounded-xl transition-colors">
                                        {getFileIcon(file.name, file.isDirectory)}
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!file.isDirectory && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDownload(file.name); }} className="p-2 text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all" title="다운로드">
                                                <Download size={16} />
                                            </button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all" title="삭제">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="font-medium text-white truncate mb-1 text-sm" title={file.name}>{file.name}</h3>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>{file.isDirectory ? '폴더' : formatSize(file.size)}</span>
                                        <span>{formatDate(file.modified)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!loading && filteredAndSortedFiles.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex flex-col items-center justify-center p-16 rounded-2xl" style={{ border: '2px dashed rgba(6, 182, 212, 0.3)' }}>
                        <div className="p-4 bg-gray-800 rounded-full mb-4">
                            <Upload size={32} className="text-gray-500" />
                        </div>
                        <p className="text-lg font-medium text-gray-400 mb-2">{searchQuery ? '검색 결과가 없습니다' : '파일이 없습니다'}</p>
                        <p className="text-sm text-gray-600">{searchQuery ? '다른 검색어를 입력해보세요' : '파일을 드래그하거나 업로드 버튼을 클릭하세요'}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
