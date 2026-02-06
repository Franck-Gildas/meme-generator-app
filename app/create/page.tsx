"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import MemeCanvas from "@/components/MemeCanvas";
import type { TextBox } from "@/types";
import { useAuth } from "@/components/AppShell";

export default function CreatePage() {
  const router = useRouter();
  const [isPosting, setIsPosting] = useState(false);
  const { isSignedIn, openSignIn } = useAuth();
  const { user } = db.useAuth();

  const handlePostMeme = async (
    imageUrl: string,
    textBoxes: TextBox[],
    baseImageUrl: string,
  ) => {
    if (isPosting) return;
    if (!isSignedIn) {
      openSignIn("Please sign in to post photos or memes.");
      return;
    }

    if (!user?.id) {
      openSignIn("Please sign in to post photos or memes.");
      return;
    }

    setIsPosting(true);
    try {
      const memeId = id();

      await db.transact(
        db.tx.memes[memeId].update({
          imageUrl,
          baseImageUrl,
          textBoxes: JSON.stringify(textBoxes),
          createdAt: Date.now(),
          createdBy: user.id,
          upvotes: 0,
        }),
      );

      router.push("/");
    } catch (error) {
      console.error("Error posting meme:", error);
      alert("Failed to post meme. Please try again.");
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
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>Posting meme...</p>
        </div>
      )}
    </div>
  );
}
