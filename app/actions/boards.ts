'use server';

import db from '@/lib/db';
import { Post } from '@/types/stock';

export async function getAllRecentPosts(): Promise<(Post & { symbol: string })[]> {
    const posts = db.prepare(`
        SELECT p.*, s.name as stockName 
        FROM posts p 
        ORDER BY p.createdAt DESC 
        LIMIT 50
    `).all() as any[];

    return posts.map(p => ({
        ...p,
        id: p.id.toString(),
        createdAt: new Date(p.createdAt).toLocaleString()
    }));
}

export async function getTrendingSymbols(): Promise<{ symbol: string; count: number }[]> {
    return db.prepare(`
        SELECT symbol, COUNT(*) as count 
        FROM posts 
        GROUP BY symbol 
        ORDER BY count DESC 
        LIMIT 5
    `).all() as { symbol: string; count: number }[];
}
