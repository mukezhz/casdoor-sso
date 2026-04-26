import { createFileRoute } from "@tanstack/react-router";
import { clearToken, fetchUserInfo, getSdk, getStoredToken, hasSilentSigninParam, hasAuthCodeInUrl, exchangeCodeForToken, AuthError } from "../lib/auth";
import { useState, useEffect, useCallback, useRef } from "react";

export function HomePage() {
  const [username, setUsername] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginMethod, setLoginMethod] = useState<"signin" | "popupSignin">("signin");
  const [statusMessage, setStatusMessage] = useState<string>("Idle");
  const silentSigninAttemptedRef = useRef(false);

  // Load existing token on mount
  useEffect(() => {
    const loadUser = async (): Promise<void> => {
      try {
        const token = getStoredToken();
        if (!token) {
          setIsLoggedIn(false);
          setUsername("");
          setLoading(false);
          return;
        }
        const user = await fetchUserInfo(token);
        setUsername(user.name ?? "");
        setIsLoggedIn(true);
      } catch {
        clearToken();
        setIsLoggedIn(false);
        setUsername("");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Check token validity when page becomes visible or periodically
  useEffect(() => {
    const checkToken = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          await fetchUserInfo(token);
          // Token is still valid
        } catch (error) {
          if (error instanceof AuthError) {
            console.log("[Auth] Token is no longer valid, clearing local state");
            clearToken();
            setIsLoggedIn(false);
            setUsername("");
          } else {
            // Network error — backend is down, keep session state and show message
            console.log("[Auth] Backend unavailable, keeping session state");
            setStatusMessage("Backend unavailable. Will retry...");
          }
        }
      }
    };

    const handleVisibilityChange = () => {
      if (globalThis.document.visibilityState === 'visible') {
        checkToken();
      }
    };

    // Check on visibility change
    globalThis.document.addEventListener('visibilitychange', handleVisibilityChange);
    // Periodic check every 60 seconds
    const intervalId = setInterval(checkToken, 6000);

    return () => {
      globalThis.document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, []);

  // Handle silent signin and code exchange (run only after initial token check)
  useEffect(() => {
    if (loading || isLoggedIn) return;
    let cancelled = false;
    const handleAuthFlow = async () => {
      // If auth code is present in URL, exchange it for token
      if (hasAuthCodeInUrl()) {
        setStatusMessage("Completing sign-in...");
        try {
          const token = await exchangeCodeForToken();
          if (token && !cancelled) {
            const user = await fetchUserInfo(token);
            setUsername(user.name ?? "");
            setIsLoggedIn(true);
            globalThis.history.replaceState({}, "", "/");
            setStatusMessage("Signed in successfully");
          }
        } catch (error) {
          if (!cancelled) {
            setStatusMessage("Sign-in failed");
          }
        }
        return;
      }

      // Only attempt silent signin once per session
      if (silentSigninAttemptedRef.current) return;

      if (hasSilentSigninParam() || !silentSigninAttemptedRef.current) {
        silentSigninAttemptedRef.current = true;
        setStatusMessage("Auto signing in...");
        const sdk = getSdk();
        try {
          globalThis.location.href = sdk.getSigninUrl();
        } catch (error) {
          if (!cancelled) setStatusMessage("Auto sign-in failed");
          silentSigninAttemptedRef.current = false;
        }
      }
    };
    handleAuthFlow();
    return () => { cancelled = true; };
  }, [loading, isLoggedIn]);

  const gotoSignInPage = useCallback((event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    console.log("[Auth] Login button clicked", { loginMethod });
    setStatusMessage(`Click captured. Starting ${loginMethod}...`);

    try {
      const sdk = getSdk();

      if (loginMethod === "signin") {
        globalThis.location.href = sdk.getSigninUrl();
        return;
      }

      sdk.popupSignin("http://localhost:8080");
      setStatusMessage("Popup sign-in requested");
    } catch (error) {
      console.error("[Auth] Sign-in start failed", error);
      setStatusMessage("Sign-in failed to start. Check console for details.");
    }
  }, [loginMethod]);

  const signOut = (): void => {
    const performLogout = async () => {
      try {
        const token = getStoredToken();
        if (!token) {
          globalThis.location.href = "/";
          return;
        }

        // Call backend logout endpoint
        const response = await fetch(`http://localhost:8080/api/logout?token=${encodeURIComponent(token)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        const result = await response.json();
        console.log("[Auth] Logout response:", result);
      } catch (error) {
        console.error("[Auth] Logout error:", error);
      } finally {
        // Always clear local state
        clearToken();
        setIsLoggedIn(false);
        setUsername("");
        globalThis.location.href = "/";
      }
    };

    performLogout();
  };

  return (
    <section className="auth-card">
      <h1 className="auth-title">Casdoor Login</h1>
      <p id="result" className="auth-result">
        userName: <span className="username">{username || "Not signed in"}</span>
      </p>
      <p className="auth-subtitle">status: {statusMessage}</p>
      <div className="auth-actions">
        {isLoggedIn ? (
          <button type="button" id="signOut" className="auth-btn" onClick={signOut}>
            Logout
          </button>
        ) : (
          <div className="auth-actions">
            <select
              id="loginMethod"
              className="login-select"
              value={loginMethod}
              onChange={(event) => setLoginMethod(event.target.value as "signin" | "popupSignin")}
            >
              <option value="signin">Signin</option>
              <option value="popupSignin">PopupSignin</option>
            </select>
            <button
              type="button"
              id="signIn"
              className="auth-btn"
              onMouseDown={() => {
                console.log("[Auth] Login button mouse down detected");
                setStatusMessage("Pointer interaction detected");
              }}
              onClick={gotoSignInPage}
            >
              Login with Casdoor
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
