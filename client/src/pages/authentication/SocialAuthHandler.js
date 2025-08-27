import { useEffect } from "react";

// This page handles the redirect from social login and stores the JWT
export default function SocialAuthHandler() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (token) {
            localStorage.setItem("token", token);
            window.location.href = "/"; // Redirect to home or dashboard
        } else {
            window.location.href = "/login?error=social";
        }
    }, []);
    return <div>Signing you in...</div>;
}
