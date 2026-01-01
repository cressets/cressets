import Link from 'next/link';
import { getGeneralBoard, getTrendingBoards } from '@/app/lib/api/community-actions';

export default async function CommunityPage() {
    const generalBoard = await getGeneralBoard();
    const trendingBoards = await getTrendingBoards();

    return (
        <div className="community-container">
            <h1 className="page-title">COMMUNITY</h1>
            <p className="subtitle">JOIN THE CONVERSATION</p>

            <section className="boards-section">
                <h2 className="section-title">GENERAL</h2>
                <Link href={`/community/board/${generalBoard.id}`} className="board-card general-card">
                    <h3>GENERAL DISCUSSION</h3>
                    <p>Talk about anything market related.</p>
                </Link>
            </section>

            <section className="boards-section">
                <h2 className="section-title">TRENDING STOCKS</h2>
                <div className="boards-grid">
                    {trendingBoards.map((board: { id: string; name: string; stockSymbol: string | null }) => (
                        <Link key={board.id} href={`/community/board/${board.id}`} className="board-card">
                            <h3>{board.name}</h3>
                            <p>Stock Discussion</p>
                        </Link>
                    ))}
                    {trendingBoards.length === 0 && (
                        <p>No trending boards yet. Be the first to start a conversation in the Market section!</p>
                    )}
                </div>
            </section>

            <style>{`
        .community-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .page-title {
            font-size: 5rem;
            line-height: 1;
            margin-bottom: 0.5rem;
        }
        .subtitle {
            font-family: var(--font-heading);
            font-size: 1.5rem;
            color: var(--color-tan);
            margin-bottom: 3rem;
            border-bottom: var(--border-thick);
            padding-bottom: 1rem;
        }
        .section-title {
            font-size: 2rem;
            margin-bottom: 1.5rem;
            border-bottom: var(--border-thin);
        }
        .boards-section {
            margin-bottom: 4rem;
        }
        .board-card {
            display: block;
            border: var(--border-thick);
            padding: 2rem;
            background: var(--color-white);
            text-decoration: none;
            transition: transform 0.2s;
            color: var(--color-primary);
        }
        .board-card:hover {
            transform: translateY(-5px);
            box-shadow: 5px 5px 0px var(--color-primary);
        }
        .general-card {
            background: var(--color-primary);
            color: var(--color-white);
        }
        .general-card:hover {
            background: var(--color-accent);
        }
        .boards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
        }
      `}</style>
        </div>
    );
}
