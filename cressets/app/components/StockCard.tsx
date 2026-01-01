'use client';

import styled from '@emotion/styled';
import Link from 'next/link';

interface StockData {
    itmsNm: string;
    srtnCd: string;
    clpr: string;
    vs: string;
    fltRt: string;
}

const Card = styled(Link)`
  display: block;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--primary-color);
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const Symbol = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
`;

const Name = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  margin-top: 0.5rem;
  color: var(--text-primary);
`;

const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const Change = styled.div<{ isPositive: boolean }>`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.isPositive ? '#00e5ff' : '#ff2979'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

export default function StockCard({ stock }: { stock: StockData }) {
    const price = parseInt(stock.clpr).toLocaleString();
    const change = parseInt(stock.vs);
    const changeRate = parseFloat(stock.fltRt);
    const isPositive = change >= 0;

    return (
        <Card href={`/stock/${stock.srtnCd}`}>
            <Header>
                <div>
                    <Symbol>{stock.srtnCd}</Symbol>
                    <Name>{stock.itmsNm}</Name>
                </div>
            </Header>
            <PriceSection>
                <Price>₩{price}</Price>
                <Change isPositive={isPositive}>
                    {isPositive ? '▲' : '▼'} {Math.abs(change).toLocaleString()} ({Math.abs(changeRate)}%)
                </Change>
            </PriceSection>
        </Card>
    );
}
