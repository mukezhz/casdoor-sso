import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { exchangeCodeForToken, hasAuthCodeInUrl } from "../lib/auth";

function CallbackPage() {
  const navigate = useNavigate({ from: "/callback" });
  const handledRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    const completeSignIn = async (): Promise<void> => {
      if (!hasAuthCodeInUrl()) {
        navigate({ to: "/" });
        return;
      }

      await exchangeCodeForToken();
      globalThis.history.replaceState({}, "", "/callback");
      navigate({ to: "/" });
    };

    completeSignIn().catch(() => {
      setError("Sign-in failed. The backend may be unavailable.");
    });
  }, [navigate]);

  if (error) {
    return (
      <section className="auth-card">
        <h1 className="auth-title">Sign-in Failed</h1>
        <p className="auth-subtitle">{error}</p>
        <div className="auth-actions">
          <button
            type="button"
            className="auth-btn"
            onClick={() => navigate({ to: "/" })}
          >
            Return home
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-card">
      <h1 className="auth-title">Signing in</h1>
      <p className="auth-subtitle">Completing sign-in...</p>
    </section>
  );
}

export const Route = createFileRoute("/callback")({
  component: CallbackPage,
});
