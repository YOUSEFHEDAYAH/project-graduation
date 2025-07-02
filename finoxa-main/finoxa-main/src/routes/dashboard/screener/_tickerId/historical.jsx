import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import moment from "moment";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import numeral from "numeral";
import { axiosInstance } from "@/utils/axios-instance";

const Historical = () => {
    const { tickerId } = useParams();
    const { ticker } = useOutletContext();

    const [selectValue, setSelectValue] = useState("price");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (startDate && !endDate) {
            const nextDay = new Date(startDate);
            nextDay.setDate(nextDay.getDate() + 1);
            // Format to YYYY-MM-DD for input type="date"
            const formattedDate = nextDay.toISOString().split("T")[0];
            setEndDate(formattedDate);
        }

        if (endDate && !startDate) {
            const previousDay = new Date(endDate);
            previousDay.setDate(previousDay.getDate() - 1);
            console.log(previousDay);
            // Format to YYYY-MM-DD for input type="date"
            const formattedDate = previousDay.toISOString().split("T")[0];
            setStartDate(formattedDate);
        }

        if (startDate && endDate) {
            if (new Date(startDate) > new Date(endDate)) {
                const nextDay = new Date(startDate);
                nextDay.setDate(nextDay.getDate() + 1);
                const formattedDate = nextDay.toISOString().split("T")[0];
                setEndDate(formattedDate);
            }
        }
    }, [startDate, endDate]);

    const { data: quotes, isLoadingQuotes } = useQuery({
        queryKey: ["historical", tickerId, startDate, endDate],
        queryFn: async () => {
            if (selectValue !== "price") return null;

            try {
                const response = await axiosInstance.get(`/quotes/${tickerId}`, {
                    params: {
                        start: startDate,
                        end: endDate,
                    },
                });

                return response.data.data.sort((a, b) => {
                    const dateA = new Date(a.t);
                    const dateB = new Date(b.t);
                    return dateB - dateA;
                });
            } catch (error) {
                console.error("Error fetching quotes:", error.response.data.message);
            }
        },
    });

    const { data: scores, isLoading: isLoadingScores } = useQuery({
        queryKey: ["scores", tickerId, startDate, endDate],
        queryFn: async () => {
            if (selectValue !== "score") return null;
            try {
                const response = await axiosInstance.get(`/sentiments/trend/${tickerId}`, {
                    params: {
                        period_start: startDate,
                        period_end: endDate,
                    },
                });

                return response.data.data.sort((a, b) => {
                    const dateA = new Date(a.t);
                    const dateB = new Date(b.t);
                    return dateB - dateA;
                });
            } catch (error) {
                console.error("Error fetching scores:", error.response.data.message);
            }
        },
    });

    return (
        <div className="p-4">
            <Card className="bg-background border-none shadow-none">
                <CardHeader className="p-0">
                    <CardTitle>Historical Data</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-8 p-0">
                    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2 md:w-[624px] md:grid-cols-3">
                        <div className="grid gap-2">
                            <Label>Data Type</Label>
                            <Select
                                defaultValue="price"
                                value={selectValue}
                                onValueChange={setSelectValue}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="price">Price</SelectItem>
                                    {ticker?.market === "stocks" && <SelectItem value="score">Sentiment score</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                name="start-date"
                                onChange={(e) => setStartDate(e.target.value)}
                                value={startDate}
                                className="w-full"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                name="end-date"
                                onChange={(e) => setEndDate(e.target.value)}
                                value={endDate}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-md border">
                        {selectValue === "price" ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="bg-background sticky left-0 after:absolute after:top-0 after:-right-2 after:h-full after:w-2 after:bg-linear-[90deg,_rgba(171,181,186,0.15),_transparent]">
                                            Date
                                        </TableHead>
                                        <TableHead className="text-center">Open</TableHead>
                                        <TableHead className="text-center">High</TableHead>
                                        <TableHead className="text-center">Low</TableHead>
                                        <TableHead className="text-center">Close</TableHead>
                                        <TableHead className="text-center">Volume</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingQuotes ? (
                                        <>
                                            {Array.from({ length: 10 }).map((_, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Skeleton className="h-4" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </>
                                    ) : (
                                        quotes?.map((quote) => (
                                            <TableRow key={quote.t}>
                                                <TableCell className="bg-background sticky left-0 w-[140px] font-medium after:absolute after:top-0 after:-right-2 after:h-full after:w-2 after:bg-linear-[90deg,_rgba(171,181,186,0.15),_transparent]">
                                                    {moment(quote.t).format("MMM DD, YYYY")}
                                                </TableCell>
                                                <TableCell className="text-center">{quote.o.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">{quote.h.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">{quote.l.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">{quote.c.toFixed(2)}</TableCell>
                                                <TableCell className="text-center">{numeral(quote.v).format("0,0")}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="bg-background sticky left-0 after:absolute after:top-0 after:-right-2 after:h-full after:w-2 after:bg-linear-[90deg,_rgba(171,181,186,0.15),_transparent]">
                                            Date
                                        </TableHead>
                                        <TableHead className="pl-8">Sentiment Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingScores ? (
                                        <>
                                            {Array.from({ length: 10 }).map((_, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Skeleton className="h-4" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Skeleton className="h-4" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </>
                                    ) : (
                                        scores?.map((score) => (
                                            <TableRow key={score.t}>
                                                <TableCell className="bg-background sticky left-0 w-[140px] font-medium after:absolute after:top-0 after:-right-2 after:h-full after:w-2 after:bg-linear-[90deg,_rgba(171,181,186,0.15),_transparent]">
                                                    {moment(score.t).format("MMM DD, YYYY")}
                                                </TableCell>
                                                <TableCell className="pl-8">{score.s.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Historical;
