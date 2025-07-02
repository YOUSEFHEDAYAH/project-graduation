import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router";
import { useDocumentTitle } from "@uidotdev/usehooks";
import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";

import { formatPrice } from "@/utils/format-price";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/utils/axios-instance";

const TickerPage = () => {
    const { tickerId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    useDocumentTitle(`${tickerId} - Finoxa`);

    const [isOverview, setIsOverview] = useState(true);
    const [positive, setPositive] = useState(true);

    const { data: ticker, isLoading } = useQuery({
        queryKey: ["ticker", tickerId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/tickers/${tickerId}`);

            if (response.data.status === false && response.data.message === "Ticker not found") {
                return navigate("/not-found", { replace: true });
            }

            return response.data.data;
        },
    });

    const { data: tickerPrice, isLoading: isPriceLoading } = useQuery({
        queryKey: ["price", tickerId],
        queryFn: async () => {
            const response = await axiosInstance(`/prices/${tickerId}`);

            setPositive(response.data.data?.price_change_percent.toFixed(2).startsWith("-") ? false : true);

            return response.data.data;
        },
        refetchInterval: 5_000,
        staleTime: 10_000,
    });

    useEffect(() => {
        if (["charting", "historical", "profile"].includes(location.pathname.split("/").slice(-1)[0])) {
            setIsOverview(false);
        } else {
            setIsOverview(true);
        }
    }, [location]);

    if (isLoading) {
        return (
            <section className="p-7 pt-[81px]">
                <div className="flex h-full w-full flex-col gap-4">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-10 max-w-96" />
                    <Skeleton className="h-12 max-w-[800px]" />
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="p-4 md:p-7">
                <div className="flex h-full w-full flex-col gap-6">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="font-medium capitalize">
                                <BreadcrumbLink asChild>
                                    <Link to={`/dashboard/screener/${ticker?.market}`}>{ticker?.market}</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <span className="font-bold">.</span>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-medium">{ticker?.ticker}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    {/* Ticker Details */}
                    <div className="flex w-full flex-col gap-2">
                        <div className="flex items-center gap-4">
                            {ticker?.market === "stocks" && (
                                <Avatar className="h-16 w-16 rounded-lg">
                                    <AvatarImage
                                        src={ticker?.logo_url}
                                        alt={ticker?.ticker}
                                    />
                                    <AvatarFallback>
                                        {ticker?.company_name.split(" ")[0]?.slice(0, 1)}
                                        {ticker?.company_name.split(" ")[1]?.slice(0, 1)}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div className="flex flex-col gap-1">
                                <div className="flex flex-wrap gap-2">
                                    <h1 className="text-xl font-bold">{ticker?.company_name ?? ticker?.name}</h1>
                                    <p className="text-muted-foreground text-xl">({ticker?.ticker})</p>
                                </div>
                                <p className="text-muted-foreground text-xs font-medium">
                                    {ticker?.exchange.name ?? ticker?.exchange} <span>.</span> {ticker?.currency}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {isPriceLoading ? (
                                <Skeleton className="h-8 w-40" />
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold">${tickerPrice?.price && formatPrice(tickerPrice?.price)}</h1>
                                    <p
                                        className={cn(
                                            "text-lg font-bold",
                                            String(tickerPrice?.price_change).startsWith("-") ? "text-red-500" : "text-green-500",
                                        )}
                                    >
                                        {tickerPrice?.price_change && formatPrice(tickerPrice?.price_change)}
                                    </p>
                                    <p
                                        className={cn(
                                            "text-lg font-bold",
                                            String(tickerPrice?.price_change_percent).startsWith("-") ? "text-red-500" : "text-green-500",
                                        )}
                                    >
                                        ({tickerPrice?.price_change_percent && formatPrice(tickerPrice?.price_change_percent)}%)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <section className="p-4 md:p-7">
                <nav className="overflow-x-auto overflow-y-hidden [scrollbar-color:var(--color-neutral-200)_transparent] [scrollbar-width:thin]">
                    <ul className="flex gap-8 border-b">
                        <li>
                            <NavLink
                                to="overview"
                                className={({ isActive }) =>
                                    cn(
                                        "relative block h-full p-4",
                                        (isActive || isOverview) &&
                                            "after:bg-foreground after:absolute after:bottom-[-1px] after:left-0 after:h-[1px] after:w-full",
                                    )
                                }
                            >
                                Overview
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="charting"
                                className={({ isActive }) =>
                                    cn(
                                        "relative block h-full p-4",
                                        isActive &&
                                            "after:bg-foreground after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full",
                                    )
                                }
                            >
                                Charting
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="historical"
                                className={({ isActive }) =>
                                    cn(
                                        "relative block h-full p-4",
                                        isActive &&
                                            "after:bg-foreground after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full",
                                    )
                                }
                            >
                                Historical
                            </NavLink>
                        </li>
                        {ticker?.market === "stocks" && (
                            <li>
                                <NavLink
                                    to="profile"
                                    className={({ isActive }) =>
                                        cn(
                                            "relative block h-full p-4",
                                            isActive &&
                                                "after:bg-foreground after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-full",
                                        )
                                    }
                                >
                                    Profile
                                </NavLink>
                            </li>
                        )}
                    </ul>
                </nav>
                <div>
                    <Outlet context={{ positive, ticker }} />
                </div>
            </section>
        </>
    );
};

export default TickerPage;
