import { Navigate } from "react-router";

import { useAuthStore } from "@/stores/auth-store";

import { LoaderCircleIcon } from "lucide-react";

export const RedircetToDashboard = ({ children }) => {
    const { user: isAuthenticated, loading: isAuthenticating } = useAuthStore();

    if (isAuthenticating) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <LoaderCircleIcon className="text-primary animate-spin" />
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
};
