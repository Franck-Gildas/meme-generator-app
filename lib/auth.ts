import { db } from "@/lib/db";

export const sendMagicCode = async (email: string) => {
  return db.auth.sendMagicCode({ email });
};

export const signInWithMagicCode = async (email: string, code: string) => {
  return db.auth.signInWithMagicCode({ email, code });
};

export const signOut = async () => {
  return db.auth.signOut();
};
