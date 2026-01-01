'use client';

import { useState, useRef } from 'react';
import { getComments, postComment } from '../actions/discussion';
import styled from '@emotion/styled';

interface Comment {
    id: number;
    stockSymbol: string;
    content: string;
    createdAt: Date;
}

const BoardContainer = styled.div`
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 24px;
    background: var(--accent-gradient);
    border-radius: 2px;
  }
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const CommentItem = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.02);
`;

const CommentContent = styled.p`
  color: var(--text-primary);
  line-height: 1.5;
`;

const CommentDate = styled.span`
  display: block;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const Form = styled.form`
  position: relative;
`;

const TextArea = styled.textarea`
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  color: white;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--secondary-color);
    background: rgba(255, 255, 255, 0.05);
  }
`;

const SubmitButton = styled.button`
  margin-top: 1rem;
  background: var(--accent-gradient);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  float: right;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
`;

export default function DiscussionBoard({
    stockSymbol,
    initialComments
}: {
    stockSymbol: string,
    initialComments: Comment[]
}) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Simple formatting for date
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);

        // Optimistic update
        const tempId = Date.now();
        const optimisticComment: Comment = {
            id: tempId,
            stockSymbol,
            content: newComment,
            createdAt: new Date(),
        };

        setComments([optimisticComment, ...comments]);
        setNewComment('');

        const text = newComment; // capture for error rollback

        try {
            const result = await postComment(stockSymbol, text);
            if (!result.success) {
                throw new Error('Failed');
            }
            // Re-fetch or rely on revalidatePath + parent update? 
            // Since this is a client component, revalidatePath updates server state, 
            // but we need to ensure local state is consistent.
            // Ideally we should sync with server, but for now optimistic is fine.
        } catch (error) {
            // Rollback
            setComments(prev => prev.filter(c => c.id !== tempId));
            setNewComment(text);
            alert('Failed to post comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <BoardContainer>
            <Title>Discussion Board</Title>

            <CommentList>
                {comments.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                        No comments yet. Be the first to share your thoughts!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <CommentItem key={comment.id}>
                            <CommentContent>{comment.content}</CommentContent>
                            <CommentDate>{formatDate(comment.createdAt)}</CommentDate>
                        </CommentItem>
                    ))
                )}
            </CommentList>

            <Form onSubmit={handleSubmit}>
                <TextArea
                    placeholder="Share your insights..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isSubmitting}
                />
                <SubmitButton type="submit" disabled={isSubmitting || !newComment.trim()}>
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                </SubmitButton>
                <div style={{ clear: 'both' }} />
            </Form>
        </BoardContainer>
    );
}
