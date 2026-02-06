"use client";

import Link from "next/link";
import { createContext, useContext, useMemo, useState } from "react";
import SignInDialog from "@/components/SignInDialog";
import { db } from "@/lib/db";

interface AppShellProps {
  children: React.ReactNode;
}

interface AuthContextValue {
  email: string | null;
  userId: string | null;
  isSignedIn: boolean;
  openSignIn: (message?: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AppShell");
  }
  return context;
};

export default function AppShell({ children }: AppShellProps) {
  const { user } = db.useAuth();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [signInMessage, setSignInMessage] = useState("Sign in to continue.");

  const openSignIn = (message?: string) => {
    setSignInMessage(message ?? "Sign in to continue.");
    setIsSignInOpen(true);
  };

  const handleSignOut = async () => {
    await db.auth.signOut();
  };

  const authValue = useMemo<AuthContextValue>(
    () => ({
      email: user?.email ?? null,
      userId: user?.id ?? null,
      isSignedIn: Boolean(user),
      openSignIn,
      signOut: handleSignOut,
    }),
    [user],
  );

  return (
    <AuthContext.Provider value={authValue}>
      <div className="container">
        <nav className="nav">
          <div className="nav-links">
            <Link href="/">Feed</Link>
            <Link href="/create">Create</Link>
          </div>
          <div className="nav-actions">
            {user ? (
              <>
                <span className="nav-user">{user.email}</span>
                <button
                  type="button"
                  className="btn btn-secondary nav-btn"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn nav-btn"
                onClick={() => openSignIn()}
              >
                Sign in
              </button>
            )}
          </div>
        </nav>
        {children}
      </div>
      <SignInDialog
        open={isSignInOpen}
        message={signInMessage}
        onClose={() => setIsSignInOpen(false)}
      />
    </AuthContext.Provider>
  );
}
