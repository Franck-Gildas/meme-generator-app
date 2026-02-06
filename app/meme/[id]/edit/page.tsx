"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import MemeCanvas from "@/components/MemeCanvas";
import { db } from "@/lib/db";
import type { Meme, TextBox } from "@/types";

export default function EditMemePage() {
  const params = useParams();
  const router = useRouter();
  const memeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = db.useAuth();

  const { isLoading, error, data } = db.useQuery({
    memes: {
      $: { order: { createdAt: "desc" } },
    },
  });

  const memes: Meme[] = data?.memes || [];
  const meme = memes.find((item) => item.id === memeId);
  const isOwner = Boolean(
    meme?.createdBy &&
    (meme.createdBy === user?.id || meme.createdBy === user?.email),
  );

  const initialTextBoxes = useMemo<TextBox[]>(() => {
    if (!meme?.textBoxes) return [];
    try {
      return JSON.parse(meme.textBoxes) as TextBox[];
    } catch {
      return [];
    }
  }, [meme]);

  const handleUpdateMeme = async (
    imageUrl: string,
    textBoxes: TextBox[],
    baseImageUrl: string,
  ) => {
    if (isUpdating || !memeId) return;
    setIsUpdating(true);
    try {
      await db.transact(
        db.tx.memes[memeId].update({
          imageUrl,
          baseImageUrl,
          textBoxes: JSON.stringify(textBoxes),
        }),
      );
      router.push(`/meme/${memeId}`);
    } catch (updateError) {
      console.error("Error updating meme:", updateError);
      alert("Failed to update meme. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

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

  if (!isOwner) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>You can only edit memes you created.</p>
        <Link href={`/meme/${memeId}`} style={{ color: "var(--accent)" }}>
          Back to meme
        </Link>
      </div>
    );
  }

  if (!meme.baseImageUrl) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>This meme was created before editing was available.</p>
        <Link href={`/meme/${memeId}`} style={{ color: "var(--accent)" }}>
          Back to meme
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header>
        <h1>Edit Meme</h1>
      </header>
      <MemeCanvas
        onUpdateMeme={handleUpdateMeme}
        initialImageUrl={meme.baseImageUrl}
        initialTextBoxes={initialTextBoxes}
      />
      {isUpdating && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>Updating meme...</p>
        </div>
      )}
    </div>
  );
}
