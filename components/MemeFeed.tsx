'use client';

import { db } from '@/lib/db';
import MemeCard from './MemeCard';

export default function MemeFeed() {
  const { isLoading, error, data } = db.useQuery({
    memes: {
      $: { order: { createdAt: 'desc' } },
    },
    votes: {},
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading memes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Error loading memes: {error.message}</p>
      </div>
    );
  }

  const memes = data?.memes || [];
  const allVotes = data?.votes || [];

  if (memes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>No memes yet. Be the first to create one!</p>
      </div>
    );
  }

  return (
    <div className="meme-feed">
      {memes.map((meme) => {
        const memeVotes = allVotes.filter((vote: any) => vote.memeId === meme.id);
        return <MemeCard key={meme.id} meme={meme} votes={memeVotes} />;
      })}
    </div>
  );
}
