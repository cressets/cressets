'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types/stock';
import { getPostsAction, addPostAction } from '@/app/actions/board';
import { MessageSquare, User, Send, ThumbsUp } from 'lucide-react';

interface StockBoardProps {
    symbol: string;
}

export default function StockBoard({ symbol }: StockBoardProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState('');
    const [author, setAuthor] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            const data = await getPostsAction(symbol);
            setPosts(data);
        };
        fetchPosts();
    }, [symbol]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim() || !author.trim()) return;

        const post = await addPostAction(symbol, author, newPost);
        setPosts([post, ...posts]);
        setNewPost('');
        setAuthor('');
    };

    return (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8 mt-8">
            <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="text-neutral-900" size={24} />
                <h2 className="text-2xl font-bold">종목 토론방</h2>
            </div>

            <form onSubmit={handleSubmit} className="mb-10 space-y-4">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="닉네임"
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="relative">
                    <textarea
                        placeholder="이 종목에 대해 어떻게 생각하시나요?"
                        className="w-full p-4 pb-12 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-neutral-900 outline-none transition-all min-h-[120px] resize-none"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="absolute bottom-3 right-3 bg-neutral-900 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-lg"
                    >
                        <Send size={16} />
                        게시
                    </button>
                </div>
            </form>

            <div className="space-y-6">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post.id} className="group border-b border-neutral-50 pb-6 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                                        <User size={14} className="text-neutral-500" />
                                    </div>
                                    <span className="font-bold text-sm">{post.author}</span>
                                    <span className="text-xs text-neutral-400">{post.createdAt}</span>
                                </div>
                                <button className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-red-500 transition-colors">
                                    <ThumbsUp size={14} />
                                    {post.likes}
                                </button>
                            </div>
                            <p className="text-neutral-700 leading-relaxed ml-10">
                                {post.content}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="py-10 text-center text-neutral-400 italic">
                        아직 작성된 의견이 없습니다. 첫 번째 의견을 남겨보세요!
                    </div>
                )}
            </div>
        </div>
    );
}
