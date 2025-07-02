import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDocumentTitle } from "@uidotdev/usehooks";
import { useInView } from "react-intersection-observer";

import { useCombobox } from "@/hooks/use-combobox";

import { Article } from "@/components/article";
import { Combobox } from "@/components/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { LoaderIcon } from "lucide-react";
import { axiosInstance } from "@/utils/axios-instance";

const NewsPage = () => {
    useDocumentTitle("News - Finoxa");

    const [tickers, setTickers] = useState([
        {
            label: "All Stocks",
            value: "all",
        },
    ]);

    const [sources, setSources] = useState([
        {
            label: "All Sources",
            value: "all",
        },
    ]);

    const { ref, inView } = useInView({
        threshold: 1,
    });
    const stocksCombobox = useCombobox("all");
    const sourcesCombobox = useCombobox("all");

    const fetchNews = async ({ pageParam = 1, ticker = stocksCombobox.value?.toUpperCase() || "" }) => {
        if (ticker === "ALL") ticker = "";

        try {
            const response = await axiosInstance.get("/news", {
                params: {
                    ticker: ticker,
                    limit: 10,
                    page: pageParam,
                    sort_by: "publishedAt",
                    order: "desc",
                },
            });

            const data = await response.data;

            const srcs = new Set();

            for (const article of data.data) {
                srcs.add(article.publisher.name);
                setSources((prev) => {
                    if (prev.find((s) => s.value === article.publisher.name.toLowerCase())) return prev;
                    return [...prev, { label: article.publisher.name, value: article.publisher.name.toLowerCase() }];
                });

                const tickers = new Set(article.tickers);

                for (const ticker of tickers) {
                    setTickers((prev) => {
                        if (prev.find((t) => t.value === ticker.toLowerCase())) return prev;
                        return [...prev, { label: ticker, value: ticker.toLowerCase() }];
                    });
                }
            }

            if (sourcesCombobox.value && sourcesCombobox.value !== "all") {
                return {
                    ...data,
                    data: data.data.filter((article) => article.publisher.name.toLowerCase() === sourcesCombobox.value),
                };
            }

            return data;
        } catch (error) {
            console.error("Error fetching news:", error.response.data.message);
        }
    };

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ["news", stocksCombobox.value, sourcesCombobox.value],
        queryFn: fetchNews,
        getNextPageParam: (lastPage) => {
            return lastPage.pagination?.has_next ? lastPage.pagination.page + 1 : undefined;
        },
        refetchOnWindowFocus: false,
    });

    const news = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data?.pages]);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, inView]);

    return (
        <section className="p-4 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">News</h1>
                <div className="flex flex-wrap items-center gap-4">
                    <Combobox
                        items={tickers}
                        open={stocksCombobox.open}
                        value={stocksCombobox.value}
                        onClose={stocksCombobox.onColse}
                        onSelect={stocksCombobox.onSelect}
                        placeholder="Stocks"
                        searchPlaceholder="Search stocks"
                    />
                    <Combobox
                        items={sources}
                        open={sourcesCombobox.open}
                        value={sourcesCombobox.value}
                        onClose={sourcesCombobox.onColse}
                        onSelect={sourcesCombobox.onSelect}
                        placeholder="Sources"
                        searchPlaceholder="Search sources"
                    />
                </div>
            </div>
            <div className="mt-7">
                {isLoading ? (
                    <div className="flex flex-col gap-7 overflow-x-auto">
                        <Skeleton className="h-44 w-full rounded-lg" />
                        <Skeleton className="h-44 w-full rounded-lg" />
                        <Skeleton className="h-44 w-full rounded-lg" />
                        <Skeleton className="h-44 w-full rounded-lg" />
                        <Skeleton className="h-44 w-full rounded-lg" />
                        <Skeleton className="h-44 w-full rounded-lg" />
                    </div>
                ) : (
                    <>
                        <div>
                            {news.map((article) => (
                                <Article
                                    key={article.id}
                                    article={article}
                                />
                            ))}
                        </div>
                        <div
                            ref={ref}
                            className="flex items-center justify-center py-4"
                        >
                            {isFetchingNextPage && <LoaderIcon className="text-muted-foreground animate-spin" />}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};
export default NewsPage;
