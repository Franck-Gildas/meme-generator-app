'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { id } from '@instantdb/react';
import { getUserId } from '@/lib/utils';

interface UpvoteButtonProps {
  memeId: string;
  currentUpvotes: number;
  votes: Array<{ id: string; userId: string; memeId: string }>;
}

export default function UpvoteButton({
  memeId,
  currentUpvotes,
  votes,
}: UpvoteButtonProps) {
  const [isVoting, setIsVoting] = useState(false);
  const userId = getUserId();
  const hasVoted = votes.some((vote) => vote.userId === userId);

  const handleUpvote = async () => {
    if (hasVoted || isVoting) return;

    setIsVoting(true);
    try {
      const voteId = id();

      await db.transact([
        db.tx.votes[voteId].update({
          memeId,
          userId,
          createdAt: Date.now(),
        }),
        db.tx.memes[memeId].update({
          upvotes: currentUpvotes + 1,
        }),
      ]);
    } catch (error) {
      console.error('Error upvoting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      className="upvote-btn"
      disabled={hasVoted || isVoting}
      style={{
        background: hasVoted ? 'var(--success)' : 'var(--accent)',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        cursor: hasVoted ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <span>▲</span>
      <span>{currentUpvotes}</span>
    </button>
  );
}
