'use server';

import { prisma } from '../lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getComments(stockSymbol: string) {
    try {
        const comments = await prisma.comment.findMany({
            where: { stockSymbol },
            orderBy: { createdAt: 'desc' },
        });
        return comments;
    } catch (error) {
        console.error('Failed to get comments:', error);
        return [];
    }
}

export async function postComment(stockSymbol: string, content: string) {
    try {
        await prisma.comment.create({
            data: {
                stockSymbol,
                content,
            },
        });
        revalidatePath(`/stock/${stockSymbol}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to post comment:', error);
        return { success: false, error: 'Failed to post comment' };
    }
}
