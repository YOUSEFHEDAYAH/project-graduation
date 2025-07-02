import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { SidebarProvider } from "@/components/ui/sidebar";

import { Header } from "@/components/layouts/header";
import { AppSidebar } from "@/components/layouts/app-sidebar";

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
            navigate("/dashboard/screener", { replace: true });
        }
    }, [location, navigate]);

    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="h-[100vh] w-full overflow-hidden">
                <main className="bg-background h-[100vh]">
                    <Header />
                    <div className="h-[calc(100vh-53px)] overflow-x-hidden overflow-y-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default Layout;
