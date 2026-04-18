import { createFileRoute } from "@tanstack/react-router";
import { clearToken, fetchUserInfo, getSdk, getStoredToken, hasSilentSigninParam } from "../lib/auth";
import { useState, useEffect, useCallback } from "react";

export function HomePage() {
  const [username, setUsername] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginMethod, setLoginMethod] = useState<"signin" | "popupSignin">("signin");
  const [statusMessage, setStatusMessage] = useState<string>("Idle");

  // Load existing token on mount
  useEffect(() => {
    console.log("[Auth] Checking for existing token and loading user info");
    const loadUser = async (): Promise<void> => {
      try {
        const token = getStoredToken();
        if (!token) {
          setIsLoggedIn(false);
          setUsername("");
          return;
        }

        const user = await fetchUserInfo(token);
        setUsername(user.name ?? "");
        setIsLoggedIn(true);
      } catch {
        clearToken();
        setIsLoggedIn(false);
        setUsername("");
      }
    };

    loadUser();
  }, []);

  // Handle silent signin when parameter is present
  useEffect(() => {
    const attemptSilentSignin = async () => {
      if (hasSilentSigninParam() && !isLoggedIn) {
        console.log("[Auth] Silent sign-in parameter detected, triggering auto sign-in");
        setStatusMessage("Auto signing in...");
        
        const sdk = getSdk();
        
        try {
          const result = await sdk.popupSignin("http://localhost:8080");
          console.log("[Auth] Popup signin result:", result);
          
          // Check if token was stored
          const token = getStoredToken();
          if (token) {
            const user = await fetchUserInfo(token);
            setUsername(user.name ?? "");
            setIsLoggedIn(true);
            setStatusMessage("Auto signed in successfully");
            
            // Remove silentSignin parameter from URL
            globalThis.history.replaceState({}, "", "/");
          } else {
            setStatusMessage("Auto sign-in failed - no token received");
          }
        } catch (error) {
          console.error("[Auth] Silent signin failed:", error);
          setStatusMessage("Auto sign-in failed");
        }
      }
    };

    attemptSilentSignin();
  }, [isLoggedIn]);

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
