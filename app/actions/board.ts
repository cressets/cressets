'use server';

import { getBoardPosts as getPostsFromDb, addPost as addPostToDb } from '@/lib/stocks';
import { Post } from '@/types/stock';
import { revalidatePath } from 'next/cache';

export async function getPostsAction(symbol: string): Promise<Post[]> {
    return await getPostsFromDb(symbol);
}

export async function addPostAction(symbol: string, author: string, content: string): Promise<Post> {
    const post = await addPostToDb(symbol, author, content);
    revalidatePath(`/stocks/${symbol}`);
    return post;
}
