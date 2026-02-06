"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import MemeCard from "@/components/MemeCard";
import { db } from "@/lib/db";
import type { Meme, Vote } from "@/types";

export default function MemeDetailPage() {
  const params = useParams();
  const memeId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { isLoading, error, data } = db.useQuery({
    memes: {
      $: { order: { createdAt: "desc" } },
    },
    votes: {},
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>Loading meme...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>Error loading meme: {error.message}</p>
      </div>
    );
  }

  const memes: Meme[] = data?.memes || [];
  const votes: Vote[] = data?.votes || [];
  const meme = memes.find((item) => item.id === memeId);
  const memeVotes = votes.filter((vote) => vote.memeId === memeId);

  if (!meme) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>Meme not found.</p>
        <Link href="/" style={{ color: "var(--accent)" }}>
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header>
        <h1>Meme</h1>
      </header>
      <MemeCard meme={meme} votes={memeVotes} />
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Link href="/" style={{ color: "var(--accent)" }}>
          Back to feed
        </Link>
      </div>
    </div>
  );
}
