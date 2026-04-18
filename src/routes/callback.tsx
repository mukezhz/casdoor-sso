import { useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { exchangeCodeForToken, hasAuthCodeInUrl } from "../lib/auth";

function CallbackPage() {
  const navigate = useNavigate({ from: "/callback" });
  const handledRef = useRef(false);

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
      navigate({ to: "/" });
    });
  }, [navigate]);

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
