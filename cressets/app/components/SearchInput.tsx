'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';

const SearchContainer = styled.form`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.25rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  color: white;
  font-size: 1.125rem;
  font-family: 'Inter', sans-serif;
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  opacity: 0.5;
`;

export default function SearchInput() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // For now, if the query looks like a symbol (digits), go to stock page.
        // Otherwise, likely need a search results page or assume exact match name->symbol?
        // Since we don't have a search results backend yet that returns symbols from names efficiently
        // (the public API is limited), we will clear the implementation:
        // If it is numeric, go to symbol. If text, we might need a search page using 'fetchStockData'.
        // Let's implement a simple direct navigation for now or trigger a search param update.

        // Simplification: Trigger a search via URL query param on main page or redirect to stock if specific.
        // Let's use search params on the home page for "results".
        if (query.trim()) {
            router.push(`/?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <SearchContainer onSubmit={handleSearch}>
            <Input
                type="text"
                placeholder="Search for a stock (e.g., Samsung or 005930)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <SearchIcon>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </SearchIcon>
        </SearchContainer>
    );
}
