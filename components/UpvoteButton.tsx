"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import type { Vote } from "@/types";

interface UpvoteButtonProps {
  memeId: string;
  currentUpvotes: number;
  votes: Vote[];
}

export default function UpvoteButton({
  memeId,
  currentUpvotes,
  votes,
}: UpvoteButtonProps) {
  const [isVoting, setIsVoting] = useState(false);
  const { user } = db.useAuth();
  const userIdentifiers = [user?.id, user?.email].filter(
    (value): value is string => Boolean(value),
  );
  const userIdentifier = userIdentifiers[0] ?? null;
  const existingVote =
    userIdentifiers.length > 0
      ? votes.find((vote) => userIdentifiers.includes(vote.userId))
      : null;
  const hasVoted = Boolean(existingVote);
  const buttonTitle = !userIdentifier
    ? "Sign in to upvote"
    : hasVoted
      ? "Remove upvote"
      : "Upvote";

  const handleUpvote = async () => {
    if (!userIdentifier || isVoting) return;

    setIsVoting(true);
    try {
      if (hasVoted && existingVote) {
        await db.transact([
          db.tx.votes[existingVote.id].delete(),
          db.tx.memes[memeId].update({
            upvotes: Math.max(0, currentUpvotes - 1),
          }),
        ]);
      } else {
        const voteId = id();
        await db.transact([
          db.tx.votes[voteId].update({
            memeId,
            userId: userIdentifier,
            createdAt: Date.now(),
          }),
          db.tx.memes[memeId].update({
            upvotes: currentUpvotes + 1,
          }),
        ]);
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      type="button"
      className={`action-button upvote-button ${hasVoted ? "is-active" : ""}`}
      disabled={!userIdentifier || isVoting}
      aria-pressed={hasVoted}
      aria-label={buttonTitle}
      title={buttonTitle}
    >
      <span className="upvote-icon" aria-hidden="true">
        ▲
      </span>
      <span className="upvote-count">{currentUpvotes}</span>
    </button>
  );
}
