import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import numeral from "numeral";

import { formatPrice } from "@/utils/format-price";
import { axiosInstance } from "@/utils/axios-instance";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const fetchStockPrice = async (tickers = []) => {
    try {
        const response = await axiosInstance.get("/prices", {
            params: {
                tickers: tickers.join(","),
            },
        });
        return response.data.data || [];
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return null;
    }
};

const Stocks = () => {
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);

    const { data: stocks, isLoading } = useQuery({
        queryKey: ["stocks", limit, page],
        queryFn: async () => {
            const response = await axiosInstance.get("/tickers", {
                params: {
                    market: "stocks",
                    limit: limit,
                    page: page,
                    sort_by: "marketCap",
                    order: "desc",
                },
            });
            const tickers = response.data.data || [];

            const prices = await fetchStockPrice(tickers.map((stock) => stock.ticker));

            const enrichedTickers = tickers.map((stock) => ({
                ...stock,
                price: prices[stock.ticker]?.price ?? null,
                change_percent: prices[stock.ticker]?.price_change_percent ?? null,
            }));

            return {
                data: enrichedTickers,
                pagination: response.data.pagination,
            };
        },
        refetchInterval: 60_000 * 5,
        staleTime: 60_000 * 5,
    });

    return (
        <>
            {isLoading ? (
                <div className="flex flex-col gap-4 overflow-x-auto">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Market Cap</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Change</TableHead>
                                <TableHead>Sector</TableHead>
                                <TableHead>Industry</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stocks?.data?.map((stock, index) => (
                                <TableRow key={stock.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Link
                                            to={`/dashboard/screener/${stock.ticker}`}
                                            className="group flex items-center gap-2"
                                        >
                                            <Avatar>
                                                <AvatarImage
                                                    src={stock.logo_url}
                                                    alt={stock.ticker}
                                                />
                                                <AvatarFallback>
                                                    {stock.company_name.split(" ")[0]?.slice(0, 1)}
                                                    {stock.company_name.split(" ")[1]?.slice(0, 1)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold group-hover:underline">{stock.ticker}</span>
                                                <span>{stock.company_name}</span>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {stock.market_cap
                                            ? numeral(stock.market_cap || 0)
                                                  .format("0.000a")
                                                  .toUpperCase()
                                            : "--"}
                                    </TableCell>
                                    <TableCell>{stock.price ? `$${formatPrice(stock.price)}` : "--"}</TableCell>
                                    <TableCell
                                        className={cn(stock.change_percent?.toFixed(2).startsWith("-") ? "text-red-500" : "text-green-500")}
                                    >
                                        {stock.change_percent?.toFixed(2)}%
                                    </TableCell>
                                    <TableCell>{stock.sector || "--"}</TableCell>
                                    <TableCell>{stock.industry || "--"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="flex flex-wrap items-center justify-end gap-4 border-y py-2">
                        <div className="flex items-center gap-x-2">
                            <p className="text-muted-foreground text-sm">Rows per page:</p>
                            <select
                                name="row-per-page"
                                id="row-per-page"
                                className="ring-offset-background focus-visible:ring-ring w-14 rounded border outline-0 focus-visible:ring-2 focus-visible:ring-offset-2"
                                value={limit}
                                onChange={(event) => setLimit(Number(event.target.value))}
                            >
                                {[5, 10, 50].map((pageSize) => (
                                    <option
                                        key={pageSize}
                                        value={pageSize}
                                    >
                                        {pageSize}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm">
                                Page {stocks?.pagination.page} of {stocks?.pagination.total_pages}
                            </p>
                        </div>
                        <div className="flex gap-x-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => setPage(1)}
                                disabled={!stocks?.pagination.has_prev}
                            >
                                <ChevronFirstIcon size={20} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => setPage((old) => Math.max(old - 1, 0))}
                                disabled={!stocks?.pagination.has_prev}
                            >
                                <ChevronLeftIcon size={20} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => setPage((old) => old + 1)}
                                disabled={!stocks?.pagination.has_next}
                            >
                                <ChevronRightIcon size={20} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => setPage(stocks?.pagination.total_pages)}
                                disabled={!stocks?.pagination.has_next}
                            >
                                <ChevronLastIcon size={20} />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Stocks;
