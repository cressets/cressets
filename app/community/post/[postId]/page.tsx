import { getPost, createComment } from '@/app/lib/api/community-actions';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PostWithComments {
    id: string;
    title: string;
    content: string;
    author: string;
    boardId: string;
    createdAt: Date;
    comments: {
        id: number;
        content: string;
        author: string;
        createdAt: Date;
    }[];
}

export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params;
    const post = await getPost(postId) as PostWithComments | null;

    if (!post) return notFound();

    return (
        <div className="post-container">
            <Link href={`/community/board/${post.boardId}`} className="back-link">← BACK TO BOARD</Link>

            <article className="post-content">
                <header className="post-header">
                    <h1 className="post-title">{post.title}</h1>
                    <div className="post-meta">
                        <span>Posted by <span className="author">{post.author}</span></span>
                        <span>{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                </header>
                <div className="post-body">
                    {post.content.split('\n').map((line: string, i: number) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>
            </article>

            <section className="comments-section">
                <h2 className="section-title">COMMENTS ({post.comments.length})</h2>

                <div className="comments-list">
                    {post.comments.map((comment) => (
                        <div key={comment.id} className="comment-card">
                            <div className="comment-header">
                                <span className="comment-author">{comment.author}</span>
                                <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="comment-body">{comment.content}</p>
                        </div>
                    ))}
                    {post.comments.length === 0 && <p>No comments yet.</p>}
                </div>

                <div className="comment-form-box">
                    <h3>LEAVE A COMMENT</h3>
                    <form action={createComment} className="comment-form">
                        <input type="hidden" name="postId" value={post.id} />
                        <input type="text" name="author" placeholder="Nickname" required className="input author-input" />
                        <textarea name="content" placeholder="Your comment..." required className="input content-input" rows={3}></textarea>
                        <button type="submit" className="submit-btn">SUBMIT</button>
                    </form>
                </div>
            </section>

            <style>{`
        .post-container {
            max-width: 900px;
            margin: 0 auto;
            padding-bottom: 4rem;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 2rem;
            font-weight: bold;
        }
        .post-content {
            background: var(--color-white);
            border: var(--border-thick);
            padding: 2rem;
            margin-bottom: 3rem;
        }
        .post-title {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            line-height: 1.2;
        }
        .post-meta {
            font-family: var(--font-heading);
            color: #666;
            border-bottom: var(--border-thin);
            padding-bottom: 1rem;
            margin-bottom: 2rem;
        }
        .author {
            color: var(--color-primary);
            font-weight: bold;
        }
        .post-body {
            font-size: 1.1rem;
            line-height: 1.6;
        }
        .section-title {
             font-size: 1.5rem;
             margin-bottom: 1.5rem;
             border-bottom: var(--border-thin);
        }
        .comment-card {
            background: #fff;
            border: var(--border-thin);
            padding: 1rem;
            margin-bottom: 1rem;
        }
        .comment-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            color: #666;
        }
        .comment-author {
            font-weight: bold;
            color: var(--color-primary);
        }
        .comment-form-box {
            margin-top: 3rem;
            background: var(--color-secondary);
            border: var(--border-thick);
            padding: 2rem;
        }
        .comment-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 1rem;
        }
        .input {
            padding: 1rem;
            border: var(--border-thin);
            font-family: var(--font-body);
        }
        .submit-btn {
             padding: 1rem;
            background: var(--color-primary);
            color: var(--color-white);
            font-weight: 900;
            border: none;
            cursor: pointer;
        }
        .submit-btn:hover {
            background: var(--color-accent);
        }
      `}</style>
        </div>
    );
}
