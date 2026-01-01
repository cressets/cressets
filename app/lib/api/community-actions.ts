'use server';

import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';

// --- Board Actions ---

export async function getGeneralBoard() {
    let board = await prisma.board.findFirst({
        where: { name: 'General' },
    });

    if (!board) {
        board = await prisma.board.create({
            data: { name: 'General', stockSymbol: null },
        });
    }
    return board;
}

export async function getStockBoard(stockSymbol: string, stockName: string) {
    let board = await prisma.board.findUnique({
        where: { stockSymbol },
    });

    if (!board) {
        board = await prisma.board.create({
            data: { name: stockName, stockSymbol },
        });
    }
    return board;
}

export async function getTrendingBoards() {
    // Logic: Boards with most posts in last 24h? Or just random for MVP?
    // Let's just return 3 random boards that are NOT General for now, or based on post count.
    const boards = await prisma.board.findMany({
        where: { NOT: { name: 'General' } },
        take: 3,
        orderBy: { posts: { _count: 'desc' } }
    });
    return boards;
}

// --- Post Actions ---

export async function getPosts(boardId: string) {
    return await prisma.post.findMany({
        where: { boardId },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { comments: true } } }
    });
}

export async function getPost(postId: string) {
    return await prisma.post.findUnique({
        where: { id: postId },
        include: {
            comments: { orderBy: { createdAt: 'asc' } },
            board: true
        },
    });
}

export async function createPost(formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const author = formData.get('author') as string || 'Anonymous';
    const password = formData.get('password') as string;
    const boardId = formData.get('boardId') as string;

    if (!title || !content || !boardId) {
        throw new Error('Missing required fields');
    }

    await prisma.post.create({
        data: {
            title,
            content,
            author,
            password,
            boardId,
        },
    });

    revalidatePath(`/community/board/${boardId}`);
}

// --- Comment Actions ---

export async function createComment(formData: FormData) {
    const content = formData.get('content') as string;
    const author = formData.get('author') as string || 'Anonymous';
    const postId = formData.get('postId') as string;

    if (!content || !postId) {
        throw new Error('Missing required fields');
    }

    await prisma.comment.create({
        data: {
            content,
            author,
            postId,
        },
    });

    revalidatePath(`/community/post/${postId}`);
}
