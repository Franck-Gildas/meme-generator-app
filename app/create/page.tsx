'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { db } from '@/lib/db';
import { id } from '@instantdb/react';
import { getUserId } from '@/lib/utils';
import MemeCanvas from '@/components/MemeCanvas';

interface TextBox {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  width: number;
  height: number;
}

export default function CreatePage() {
  const router = useRouter();
  const [isPosting, setIsPosting] = useState(false);

  const handlePostMeme = async (imageUrl: string, textBoxes: TextBox[]) => {
    if (isPosting) return;

    setIsPosting(true);
    try {
      const memeId = id();
      const userId = getUserId();

      await db.transact(
        db.tx.memes[memeId].update({
          imageUrl,
          textBoxes: JSON.stringify(textBoxes),
          createdAt: Date.now(),
          createdBy: userId,
          upvotes: 0,
        })
      );

      router.push('/');
    } catch (error) {
      console.error('Error posting meme:', error);
      alert('Failed to post meme. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div>
      <header>
        <h1>Create Meme</h1>
      </header>
      <MemeCanvas onPostMeme={handlePostMeme} />
      {isPosting && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Posting meme...</p>
        </div>
      )}
    </div>
  );
}
