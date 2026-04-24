import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getHomePathForRole, storeAuthSession } from "../utils/auth";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const PLACEHOLDER_GOOGLE_CLIENT_ID = "your-google-client-id";
const GOOGLE_STATE_KEY = "__codecraftGoogleIdentityState";

let googleScriptPromise;

const isConfiguredGoogleClientId = (value = "") =>
  Boolean(value) && value !== PLACEHOLDER_GOOGLE_CLIENT_ID;

const getGoogleIdentityState = () => {
  if (!window[GOOGLE_STATE_KEY]) {
    window[GOOGLE_STATE_KEY] = {
      initializedClientId: "",
      activeCredentialHandler: null,
    };
  }

  return window[GOOGLE_STATE_KEY];
};

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.google), { once: true });
        existingScript.addEventListener("error", () => reject(new Error("Unable to load Google Sign-In")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => {
        googleScriptPromise = null;
        reject(new Error("Unable to load Google Sign-In"));
      };
      document.body.appendChild(script);
    });
  }

  return googleScriptPromise;
};

const initializeGoogleIdentity = (clientId, onCredential) => {
  const googleIdentityState = getGoogleIdentityState();
  googleIdentityState.activeCredentialHandler = onCredential;

  if (googleIdentityState.initializedClientId === clientId) {
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    // Prefer FedCM button UX where supported to reduce popup-window messaging issues.
    use_fedcm_for_button: true,
    callback: (response) => getGoogleIdentityState().activeCredentialHandler?.(response),
  });

  googleIdentityState.initializedClientId = clientId;
};

function GoogleMarkIcon() {
  return (
    <svg
      className="auth-google-mark"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M12.24 10.285v3.821h5.445c-.24 1.545-1.8 4.531-5.445 4.531-3.277 0-5.95-2.715-5.95-6.066s2.673-6.066 5.95-6.066c1.864 0 3.108.794 3.822 1.48l2.607-2.52C17.002 3.915 14.86 3 12.24 3 7.31 3 3.31 7.03 3.31 12s4 9 8.93 9c5.154 0 8.57-3.62 8.57-8.715 0-.587-.065-1.035-.144-1.48H12.24Z"
      />
      <path
        fill="#34A853"
        d="M3.31 7.691 6.453 10c.85-2.57 3.156-4.495 5.787-4.495 1.864 0 3.108.794 3.822 1.48l2.607-2.52C17.002 3.915 14.86 3 12.24 3 8.812 3 5.838 4.968 4.394 7.836L3.31 7.69Z"
      />
      <path
        fill="#FBBC05"
        d="M3 12c0 1.44.347 2.8.965 4l3.335-2.574A5.97 5.97 0 0 1 6.29 12c0-.493.06-.974.172-1.434L3.127 8A8.97 8.97 0 0 0 3 12Z"
      />
      <path
        fill="#4285F4"
        d="M12.24 21c2.52 0 4.636-.83 6.182-2.255l-2.998-2.318c-.828.577-1.9.98-3.184.98-2.618 0-4.84-1.773-5.63-4.167L3.31 15.92C4.74 18.84 8.01 21 12.24 21Z"
      />
    </svg>
  );
}

function GoogleAuthButton({ role, intent = "signin" }) {
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const credentialHandlerRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";
  const googleConfigured = isConfiguredGoogleClientId(googleClientId);

  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (!googleConfigured) {
      setGoogleReady(false);
      return undefined;
    }

    loadGoogleScript()
      .then(() => {
        if (isMounted) {
          setGoogleReady(true);
          setGoogleError("");
        }
      })
      .catch(() => {
        if (isMounted) {
          setGoogleReady(false);
          setGoogleError("Google sign-in could not be loaded right now.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [googleConfigured]);

  credentialHandlerRef.current = async ({ credential }) => {
    if (!credential) {
      setGoogleError("Google sign-in did not return a valid credential.");
      return;
    }

    try {
      setGoogleLoading(true);
      setGoogleError("");

      const response = await api.post("/auth/google", {
        idToken: credential,
        role,
      });

      storeAuthSession(response.data.data);
      navigate(getHomePathForRole(response.data.data.user.role));
    } catch (error) {
      setGoogleError(error.response?.data?.message || "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (!googleConfigured || !googleReady || !buttonRef.current || !window.google?.accounts?.id) {
      return undefined;
    }

    const host = buttonRef.current;

    const handleGoogleResponse = async (response) => {
      await credentialHandlerRef.current?.(response);
    };

    initializeGoogleIdentity(googleClientId, handleGoogleResponse);

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !host) {
        return;
      }

      host.innerHTML = "";

      const width = Math.min(400, Math.max(240, Math.floor(host.offsetWidth || 320)));

      window.google.accounts.id.renderButton(host, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width,
        logo_alignment: "left",
      });
    };

    renderGoogleButton();

    let resizeObserver;

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => renderGoogleButton());
      resizeObserver.observe(host);
    }

    return () => {
      resizeObserver?.disconnect();
      host.innerHTML = "";
    };
  }, [googleClientId, googleConfigured, googleReady, navigate, role]);

  useEffect(() => {
    if (!googleConfigured || !googleReady) {
      return;
    }

    getGoogleIdentityState().activeCredentialHandler = async (response) => {
      await credentialHandlerRef.current?.(response);
    };
  }, [googleConfigured, googleReady, role, navigate]);

  const helperCopy =
    intent === "signup"
      ? "New Google accounts will use the selected role."
      : "Use the selected role for your Google sign-in.";

  const fallbackLabel = googleConfigured ? "Loading Google..." : "Continue with Google";
  const setupMessage =
    "Google sign-in needs a real Google Web Client ID in frontend/.env and backend/.env.";

  const handleFallbackClick = () => {
    if (googleConfigured) {
      setGoogleError("Google sign-in is still loading. Please try again in a moment.");
      return;
    }

    setGoogleError(setupMessage);
  };

  return (
    <div className="auth-social-group">
      <div className="auth-divider">
        <span>or continue with</span>
      </div>

      <div className={`auth-social-shell${googleLoading ? " is-loading" : ""}`}>
        {googleReady ? (
          <>
            <div ref={buttonRef} className="auth-google-button-slot" />
            {googleLoading && (
              <div className="auth-social-loading" aria-live="polite">
                <span className="auth-spinner auth-spinner-light" aria-hidden="true" />
                <span>Signing in with Google...</span>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            className="auth-social-fallback"
            onClick={handleFallbackClick}
            disabled={googleConfigured}
          >
            <GoogleMarkIcon />
            {fallbackLabel}
          </button>
        )}
      </div>

      <p className="auth-social-note">{helperCopy}</p>

      {!googleConfigured && (
        <p className="auth-social-note">
          Add <code>VITE_GOOGLE_CLIENT_ID</code> in the frontend and <code>GOOGLE_CLIENT_ID</code>{" "}
          in the backend to enable Google sign-in.
        </p>
      )}

      {googleError && <p className="auth-social-error">{googleError}</p>}
    </div>
  );
}

export default GoogleAuthButton;
