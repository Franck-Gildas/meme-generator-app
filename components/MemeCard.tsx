'use client';

import { useEffect, useRef } from 'react';
import UpvoteButton from './UpvoteButton';

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

interface Meme {
  id: string;
  imageUrl: string;
  textBoxes: string;
  createdAt: number;
  upvotes: number;
}

interface Vote {
  id: string;
  userId: string;
}

interface MemeCardProps {
  meme: Meme;
  votes: Vote[];
}

export default function MemeCard({ meme, votes }: MemeCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const textBoxes: TextBox[] = JSON.parse(meme.textBoxes || '[]');
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Scale canvas for display (max 600px width)
      const maxDisplayWidth = 600;
      let displayWidth = img.width;
      let displayHeight = img.height;

      if (displayWidth > maxDisplayWidth) {
        const scale = maxDisplayWidth / displayWidth;
        displayWidth = maxDisplayWidth;
        displayHeight = img.height * scale;
      }

      canvas.width = displayWidth;
      canvas.height = displayHeight;

      // Draw image scaled
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      // Calculate scale factors
      const scaleX = displayWidth / img.width;
      const scaleY = displayHeight / img.height;

      // Draw text boxes scaled
      textBoxes.forEach((textBox) => {
        ctx.font = `bold ${textBox.fontSize * scaleX}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw black border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 6 * scaleX;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(
          textBox.text,
          textBox.x * scaleX,
          textBox.y * scaleY
        );

        // Draw text
        ctx.fillStyle = textBox.color || '#ffffff';
        ctx.fillText(textBox.text, textBox.x * scaleX, textBox.y * scaleY);
      });
    };
    img.src = meme.imageUrl;
  }, [meme]);

  return (
    <div className="meme-card">
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: '8px',
        }}
      />
      <div className="meme-card-footer">
        <UpvoteButton
          memeId={meme.id}
          currentUpvotes={meme.upvotes}
          votes={votes}
        />
        <span className="meme-date">
          {new Date(meme.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
