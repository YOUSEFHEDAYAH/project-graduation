import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { useQueries } from "@tanstack/react-query";
import { useDocumentTitle } from "@uidotdev/usehooks";

import numeral from "numeral";

import { IndexCard } from "@/components/index-card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/utils/axios-instance";

const tickers = ["^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX"];

const fetchIndexData = async (ticker) => {
    try {
        const [metaRes, priceRes, quoteRes] = await Promise.all([
            axiosInstance.get(`/tickers/${ticker}`),
            axiosInstance.get(`/prices/${ticker}`),
            axiosInstance.get(`/quotes/${ticker}`, {
                params: {
                    period: "1d",
                    interval: "1m",
                },
            }),
        ]);

        const metaData = metaRes.data;
        const priceData = priceRes.data;
        const quoteData = quoteRes.data;

        const formattedQuotes = Array.isArray(quoteData?.data)
            ? quoteData.data.map((point) => ({
                  x: new Date(point.t),
                  y: point.c,
              }))
            : [];

        return {
            ...metaData.data,
            price: priceData.data.price,
            change_percent: priceData.data.price_change_percent,
            quotes: formattedQuotes,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

const ScreenerPage = () => {
    useDocumentTitle("Screener - Finoxa");

    const location = useLocation();

    const [pathname, setPathname] = useState(location.pathname);

    const indexQueries = useQueries({
        queries: tickers.map((ticker) => ({
            queryKey: ["index", ticker],
            queryFn: () => fetchIndexData(ticker),
            refetchInterval: 30_000,
            staleTime: 60_000 * 5,
        })),
    });

    const isLoading = indexQueries.some((q) => q.isLoading);
    const indices = indexQueries.map((q) => q.data).filter(Boolean);

    useEffect(() => {
        setPathname(location.pathname);
    }, [location]);

    return (
        <>
            <section className="p-4 md:p-7">
                <div className="w-full">
                    {isLoading ? (
                        <div className="flex flex-nowrap gap-7 overflow-x-auto">
                            <Skeleton className="h-[158px] w-full" />
                            <Skeleton className="hidden h-[158px] w-full sm:block" />
                            <Skeleton className="hidden h-[158px] w-full xl:block" />
                            <Skeleton className="hidden h-[158px] w-full xl:block" />
                            <Skeleton className="hidden h-[158px] w-full xl:block" />
                        </div>
                    ) : (
                        <Carousel
                            opts={{
                                dragFree: true,
                            }}
                        >
                            <CarouselContent className="-ml-7">
                                {indices.map((index) => (
                                    <CarouselItem
                                        key={index.id}
                                        className="pl-7 sm:basis-1/2 md:basis-1/2 xl:basis-1/5"
                                    >
                                        <IndexCard
                                            name={index.name}
                                            value={`$${numeral(index.price).format("0,0.00")}`}
                                            change={`${index.change_percent?.toFixed(2)}%`}
                                            isPositive={!index.change_percent?.toFixed(2).startsWith("-")}
                                            quotes={index.quotes}
                                        />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                    )}
                </div>
            </section>
            <section className="p-4 md:p-7">
                <div className="w-full">
                    <div className="flex items-center gap-4">
                        <Button
                            asChild
                            variant="ghost"
                            className={cn("cursor-pointer", !pathname?.endsWith("indices") && "bg-secondary")}
                        >
                            <Link to="/dashboard/screener/stocks">Stocks</Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            className={cn("cursor-pointer", pathname?.endsWith("indices") && "bg-secondary")}
                        >
                            <Link to="/dashboard/screener/indices">Indices</Link>
                        </Button>
                    </div>
                    <div className="mt-7">
                        <Outlet />
                    </div>
                </div>
            </section>
        </>
    );
};

export default ScreenerPage;
