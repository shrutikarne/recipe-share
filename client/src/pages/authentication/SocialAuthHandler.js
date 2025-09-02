import { useEffect } from "react";
import { showSuccessToast, showErrorToast } from "../../utils/ToastConfig";
import { setAuthenticated } from "../../utils/tokenManager";
import "./SocialAuthHandler.scss";

/**
 * SocialAuthHandler page component
 * Handles the redirect from social login and sets authentication state.
 * @returns {JSX.Element}
 */
export default function SocialAuthHandler() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const success = params.get("success");
        if (success === "true") {
            // The cookie is already set by the server
            setAuthenticated(); // Mark as authenticated in session storage
            showSuccessToast("Login successful! 🎉");
            window.location.href = "/"; // Redirect to home or dashboard
        } else {
            showErrorToast("Social login failed. Please try again.");
            window.location.href = "/auth?mode=login&error=social";
        }
    }, []);
    return (
        <div className="social-auth-handler">
            <div className="loader"></div>
            <p>Signing you in...</p>
        </div>
    );
}
