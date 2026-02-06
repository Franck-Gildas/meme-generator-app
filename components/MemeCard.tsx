"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import UpvoteButton from "./UpvoteButton";
import { db } from "@/lib/db";
import { formatRelativeTime } from "@/lib/utils";
import { Meme, TextBox, Vote } from "@/types";

interface MemeCardProps {
  meme: Meme;
  votes: Vote[];
}

export default function MemeCard({ meme, votes }: MemeCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = db.useAuth();
  const isOwner = Boolean(
    meme.createdBy &&
    (meme.createdBy === user?.id || meme.createdBy === user?.email),
  );
  const isUuid = meme.createdBy
    ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        meme.createdBy,
      )
    : false;
  const handle = meme.createdBy?.includes("@")
    ? meme.createdBy.split("@")[0]
    : null;
  const rawName = isOwner
    ? handle
      ? `You (@${handle})`
      : "You"
    : meme.createdBy
      ? meme.createdBy.includes("@")
        ? `@${meme.createdBy.split("@")[0]}`
        : isUuid
          ? "Member"
          : meme.createdBy
      : "Anonymous";
  const displayName =
    rawName.length > 18 ? `${rawName.slice(0, 18)}...` : rawName;
  const avatarInitial = (
    handle?.charAt(0) ||
    displayName.trim().charAt(0) ||
    "A"
  ).toUpperCase();
  const createdAtLabel = formatRelativeTime(meme.createdAt);
  const ageMs = Date.now() - meme.createdAt;
  const isNew = ageMs >= 0 && ageMs < 1000 * 60 * 15;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this meme? This cannot be undone.",
    );
    if (!confirmed || isDeleting) return;

    setIsDeleting(true);
    try {
      await db.transact([db.tx.memes[meme.id].delete()]);
    } catch (error) {
      console.error("Error deleting meme:", error);
      alert("Failed to delete meme. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const textBoxes: TextBox[] = JSON.parse(meme.textBoxes || "[]");
    const sourceImageUrl = meme.imageUrl || meme.baseImageUrl;
    const shouldRenderText = false;
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext("2d");
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

      if (shouldRenderText) {
        // Draw text boxes scaled
        textBoxes.forEach((textBox) => {
          ctx.font = `bold ${textBox.fontSize * scaleX}px Arial`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Draw black border
          ctx.strokeStyle = "black";
          ctx.lineWidth = 6 * scaleX;
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.strokeText(textBox.text, textBox.x * scaleX, textBox.y * scaleY);

          // Draw text
          ctx.fillStyle = textBox.color || "#ffffff";
          ctx.fillText(textBox.text, textBox.x * scaleX, textBox.y * scaleY);
        });
      }
    };
    img.src = sourceImageUrl;
  }, [meme]);

  return (
    <div className="meme-card">
      <div className="meme-card-header">
        <div className="meme-user">
          <div className="meme-avatar" aria-hidden="true">
            {avatarInitial}
          </div>
          <span className="meme-user-name">{displayName}</span>
        </div>
        <div className="meme-meta">
          {isNew && <span className="meme-badge">New</span>}
          <span
            className="meme-timestamp"
            title={new Date(meme.createdAt).toLocaleString()}
          >
            {createdAtLabel}
          </span>
        </div>
      </div>
      <Link href={`/meme/${meme.id}`} className="meme-media">
        <canvas ref={canvasRef} />
      </Link>
      <div className="meme-card-footer">
        <div className="meme-actions">
          <div className="meme-actions-left">
            <UpvoteButton
              memeId={meme.id}
              currentUpvotes={meme.upvotes}
              votes={votes}
            />
            <Link href={`/meme/${meme.id}`} className="action-button">
              View
            </Link>
            {isOwner && (
              <Link href={`/meme/${meme.id}/edit`} className="action-button">
                Edit
              </Link>
            )}
          </div>
          {isOwner && (
            <div className="meme-actions-right">
              <button
                onClick={handleDelete}
                className="action-button action-button--danger"
                disabled={isDeleting}
                type="button"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
