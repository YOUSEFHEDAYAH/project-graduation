import { Navigate } from "react-router";

import { Loader2Icon } from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";

export function ProtectedRoute({ children }) {
    const { user: isAuthenticated, loading: isAuthenticating } = useAuthStore();

    localStorage.removeItem("counter");

    if (isAuthenticating)
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2Icon
                    className="animate-spin"
                    size={18}
                />
            </div>
        );

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/auth/login"
                replace
            />
        );
    }

    return children;
}
