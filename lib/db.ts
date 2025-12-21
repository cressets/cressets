import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure .data directory exists for the database file
const dbDir = path.join(process.cwd(), '.data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'cressets.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_posts_symbol ON posts(symbol);

  CREATE TABLE IF NOT EXISTS insights (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    author TEXT,
    time TEXT,
    image TEXT,
    content TEXT,
    url TEXT,
    scrapedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stock_news (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    title TEXT NOT NULL,
    source TEXT,
    time TEXT,
    content TEXT,
    url TEXT,
    scrapedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_stock_news_symbol ON stock_news(symbol);

  CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

export default db;
