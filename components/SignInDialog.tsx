"use client";

import { useEffect, useState } from "react";
import { sendMagicCode, signInWithMagicCode } from "@/lib/auth";

interface SignInDialogProps {
  open: boolean;
  message?: string;
  onClose: () => void;
  onSignedIn?: (email: string) => void;
}

type Step = "email" | "code";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInDialog({
  open,
  message,
  onClose,
  onSignedIn,
}: SignInDialogProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [sentEmail, setSentEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("email");
    setEmail("");
    setSentEmail("");
    setCode("");
    setError("");
  }, [open]);

  const handleSendCode = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setIsSending(true);
      setError("");
      await sendMagicCode(trimmedEmail);
      setSentEmail(trimmedEmail);
      setStep("code");
    } catch (sendError: any) {
      const messageText =
        sendError?.body?.message || "Unable to send the magic code.";
      setError(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError("Enter the code you received.");
      return;
    }

    try {
      setIsVerifying(true);
      setError("");
      await signInWithMagicCode(
        sentEmail || email.trim().toLowerCase(),
        trimmedCode,
      );
      const signedInEmail = sentEmail || email.trim().toLowerCase();
      onSignedIn?.(signedInEmail);
      onClose();
    } catch (verifyError: any) {
      const messageText =
        verifyError?.body?.message || "Unable to verify the code.";
      setError(messageText);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!open) return null;

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true">
      <div className="dialog-card">
        <div className="dialog-header">
          <h2>Sign in</h2>
          <button
            type="button"
            className="dialog-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        {message && <p className="dialog-message">{message}</p>}
        {step === "email" && (
          <>
            <label className="dialog-label" htmlFor="signInEmail">
              Email address
            </label>
            <input
              id="signInEmail"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="dialog-input"
            />
            {error && <p className="dialog-error">{error}</p>}
            <div className="dialog-actions">
              <button
                type="button"
                className="btn"
                onClick={handleSendCode}
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Sign in"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </>
        )}
        {step === "code" && (
          <>
            <p className="dialog-helper">
              Enter the magic code sent to your email.
            </p>
            <label className="dialog-label" htmlFor="signInCode">
              Magic code
            </label>
            <input
              id="signInCode"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="dialog-input"
            />
            {error && <p className="dialog-error">{error}</p>}
            <div className="dialog-actions">
              <button
                type="button"
                className="btn"
                onClick={handleVerifyCode}
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify code"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep("email")}
              >
                Change email
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
