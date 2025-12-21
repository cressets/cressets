'use server';

import db from '@/lib/db';
import { Post } from '@/types/stock';
import { revalidatePath } from 'next/cache';

export async function getPostsAction(symbol: string): Promise<Post[]> {
    const posts = db.prepare('SELECT * FROM posts WHERE symbol = ? ORDER BY createdAt DESC').all(symbol) as any[];
    return posts.map(p => ({
        ...p,
        id: p.id.toString(),
        createdAt: new Date(p.createdAt).toLocaleString()
    }));
}

export async function addPostAction(symbol: string, author: string, content: string): Promise<Post> {
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();

    db.prepare('INSERT INTO posts (id, symbol, author, content, createdAt) VALUES (?, ?, ?, ?, ?)')
        .run(id, symbol, author, content, createdAt);

    revalidatePath(`/stocks/${symbol}`);
    revalidatePath('/boards');

    return {
        id,
        author,
        content,
        createdAt: new Date(createdAt).toLocaleString(),
        likes: 0
    };
}
