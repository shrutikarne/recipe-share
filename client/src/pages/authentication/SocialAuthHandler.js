import { useEffect } from "react";
import { toast } from "react-toastify";
import "./SocialAuthHandler.scss";

// This page handles the redirect from social login and stores the JWT
export default function SocialAuthHandler() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (token) {
            localStorage.setItem("token", token);
            toast.success("Login successful! 🎉");
            window.location.href = "/"; // Redirect to home or dashboard
        } else {
            toast.error("Social login failed. Please try again.");
            window.location.href = "/login?error=social";
        }
    }, []);
    return (
        <div className="social-auth-handler">
            <div className="loader"></div>
            <p>Signing you in...</p>
        </div>
    );
}
