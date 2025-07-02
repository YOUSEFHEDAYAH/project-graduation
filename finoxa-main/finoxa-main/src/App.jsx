import { useEffect } from "react";
import { createBrowserRouter, Navigate, RouterProvider, Router } from "react-router";

import { useAuthStore } from "@/stores/auth-store";

import SignupPage from "@/routes/auth/signup/page";
import LoginPage from "@/routes/auth/login/page";
import VerifyEmailPage from "@/routes/auth/verify-email/page";
import ResetPasswordPage from "@/routes/auth/reset-password/page";
import SuccessPage from "@/routes/auth/reset-password/success/page";
import ConfirmPage from "@/routes/auth/reset-password/confirm/page";
import UpdatePasswordPage from "@/routes/auth/update-password/page";
import Layout from "@/routes/dashboard/layout";
import ScreenerPage from "@/routes/dashboard/screener/page";
import Stocks from "@/routes/dashboard/screener/stocks";
import Indices from "@/routes/dashboard/screener/indices";
import TickerPage from "@/routes/dashboard/screener/_tickerId/page";
import Overview from "@/routes/dashboard/screener/_tickerId/overview";
import Charting from "@/routes/dashboard/screener/_tickerId/charting";
import Historical from "@/routes/dashboard/screener/_tickerId/historical";
import Profile from "@/routes/dashboard/screener/_tickerId/profile";
import NewsPage from "@/routes/dashboard/news/page";
import NotFound from "@/routes/not-found";

import { Toaster } from "@/components/ui/sonner";

import ThemeProvider from "@/components/theme-provider";
import { ProtectedRoute } from "@/components/protected-route";
import { RedircetToDashboard } from "@/components/redirect-to-dashboard";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/dashboard" />,
    },
    {
        path: "auth/signup",
        element: (
            <RedircetToDashboard>
                <SignupPage />
            </RedircetToDashboard>
        ),
    },
    {
        path: "auth/login",
        element: (
            <RedircetToDashboard>
                <LoginPage />
            </RedircetToDashboard>
        ),
    },
    {
        path: "auth/verify-email",
        element: <VerifyEmailPage />,
    },
    {
        path: "auth/reset-password",
        element: (
            <RedircetToDashboard>
                <ResetPasswordPage />
            </RedircetToDashboard>
        ),
    },
    {
        path: "auth/reset-password/success",
        element: (
            <RedircetToDashboard>
                <SuccessPage />
            </RedircetToDashboard>
        ),
    },
    {
        path: "auth/reset-password/confirm",
        element: <ConfirmPage />,
    },
    {
        path: "auth/update-password",
        element: <UpdatePasswordPage />,
    },
    {
        path: "dashboard",
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "screener",
                element: <ScreenerPage />,
                children: [
                    {
                        index: true,
                        element: <Stocks />,
                    },
                    {
                        path: "stocks",
                        element: <Stocks />,
                    },
                    {
                        path: "indices",
                        element: <Indices />,
                    },
                ],
            },
            {
                path: "screener/:tickerId",
                element: <TickerPage />,
                children: [
                    {
                        index: true,
                        element: <Overview />,
                    },
                    {
                        path: "overview",
                        element: <Overview />,
                    },
                    {
                        path: "charting",
                        element: <Charting />,
                    },
                    {
                        path: "historical",
                        element: <Historical />,
                    },
                    {
                        path: "profile",
                        element: <Profile />,
                    },
                ],
            },
            {
                path: "news",
                element: <NewsPage />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
    {
        path: "/not-found",
        element: <NotFound />,
    },
]);

function App() {
    useEffect(() => {
        useAuthStore.getState().initAuth();
    }, []);

    return (
        <ThemeProvider
            defaultTheme="light"
            storageKey="ui-theme"
        >
            <RouterProvider router={router} />
            <Toaster richColors />
        </ThemeProvider>
    );
}

export default App;
