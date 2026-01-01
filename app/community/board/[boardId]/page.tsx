import { getPosts, createPost } from '@/app/lib/api/community-actions';
import { prisma } from '@/app/lib/prisma';
import Link from 'next/link';

interface Board {
    id: string;
    name: string;
    stockSymbol: string | null;
}

interface PostWithCount {
    id: string;
    title: string;
    author: string;
    createdAt: Date;
    _count: {
        comments: number;
    };
}

export default async function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
    const { boardId } = await params;
    const board = await prisma.board.findUnique({ where: { id: boardId } }) as Board | null;
    const posts = await getPosts(boardId) as PostWithCount[];

    if (!board) return <div>Board not found</div>;

    return (
        <div className="board-container">
            <Link href="/community" className="back-link">← BACK TO COMMUNITY</Link>
            <header className="board-header">
                <h1 className="board-title">{board.name}</h1>
                <p className="board-meta">{board.stockSymbol ? `Stock: ${board.stockSymbol}` : 'General Discussion'}</p>
            </header>

            <div className="content-grid">
                {/* Post List */}
                <section className="posts-section">
                    <h2 className="section-title">RECENT POSTS</h2>
                    <div className="posts-list">
                        {posts.map((post) => (
                            <Link key={post.id} href={`/community/post/${post.id}`} className="post-card">
                                <h3 className="post-title">{post.title}</h3>
                                <div className="post-meta">
                                    <span>by {post.author}</span>
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    <span>{post._count.comments} comments</span>
                                </div>
                            </Link>
                        ))}
                        {posts.length === 0 && <p>No posts yet. Start the conversation!</p>}
                    </div>
                </section>

                {/* Create Post Form */}
                <aside className="create-section">
                    <div className="create-card">
                        <h3>CREATE POST</h3>
                        <form action={createPost} className="create-form">
                            <input type="hidden" name="boardId" value={boardId} />
                            <input type="text" name="author" placeholder="Nickname" required className="input author-input" />
                            <input type="password" name="password" placeholder="Password (for deletion)" className="input password-input" />
                            <input type="text" name="title" placeholder="Title" required className="input title-input" />
                            <textarea name="content" placeholder="Content" required className="input content-input" rows={5}></textarea>
                            <button type="submit" className="submit-btn">POST</button>
                        </form>
                    </div>
                </aside>
            </div>

            <style>{`
        .board-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .back-link {
            font-weight: bold;
            margin-bottom: 1rem;
            display: inline-block;
        }
        .board-header {
            margin-bottom: 3rem;
            border-bottom: var(--border-thick);
            padding-bottom: 1rem;
        }
        .board-title {
            font-size: 4rem;
            line-height: 1;
        }
        .content-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 3rem;
        }
        .section-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            border-bottom: var(--border-thin);
        }
        .post-card {
            display: block;
            background: var(--color-white);
            border: var(--border-thin);
            padding: 1.5rem;
            margin-bottom: 1rem;
            text-decoration: none;
            color: var(--color-primary);
            transition: all 0.2s;
        }
        .post-card:hover {
            border-color: var(--color-accent);
            transform: translateX(5px);
        }
        .post-title {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
        }
        .post-meta {
            font-size: 0.9rem;
            color: #666;
            display: flex;
            gap: 1rem;
        }
        .create-card {
            background: var(--color-primary);
            color: var(--color-white);
            padding: 1.5rem;
        }
        .create-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 1rem;
        }
        .input {
            padding: 0.8rem;
            font-family: var(--font-body);
            border: none;
        }
        .submit-btn {
            padding: 1rem;
            background: var(--color-accent);
            color: var(--color-primary);
            font-weight: 900;
            border: none;
            cursor: pointer;
            text-transform: uppercase;
        }
        .submit-btn:hover {
            background: var(--color-white);
        }
        @media (max-width: 768px) {
            .content-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
        </div>
    );
}
