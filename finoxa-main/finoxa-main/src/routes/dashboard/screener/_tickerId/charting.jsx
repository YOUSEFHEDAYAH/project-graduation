import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import ApexChart from "react-apexcharts";
import { toast } from "sonner";
import moment from "moment";

import { axiosInstance } from "@/utils/axios-instance";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Charting = () => {
    const { tickerId } = useParams();
    const { ticker, positive } = useOutletContext();

    const [color, setColor] = useState(positive ? "#22c55e" : "#ef4444");

    const [dataType, setDataType] = useState("price");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [interval, setInterval] = useState(dataType === "price" ? "1m" : "1d");
    const [period, setPeriod] = useState("1d");

    const priceIntervals = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "5d", "1wk", "1mo", "3mo"];
    const scoreIntervals = ["1d", "1wk", "1mo"];

    const pricePeriods = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "5y", "ytd", "max"];

    const shouldFetch = !!tickerId;

    useEffect(() => {
        setStartDate("");
        setEndDate("");
    }, [period]);

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

    const { data: quoteSeries, isLoading: isLoadingQuotes } = useQuery({
        queryKey: ["price", tickerId, dataType, startDate, endDate, interval, period],
        enabled: shouldFetch && dataType === "price",
        queryFn: async () => {
            const response = await axiosInstance.get(`/quotes/${tickerId}`, {
                params: {
                    period: period,
                    interval: interval,
                    start: startDate,
                    end: endDate,
                },
            });

            if (response.data.success === false) {
                toast.error(response.data.message);
                return [];
            }

            return [
                {
                    name: "Price",
                    data: response.data.data.map((point) => ({
                        x: new Date(point.t),
                        y: point.c,
                    })),
                },
            ];
        },
        refetchInterval: 10_000,
        staleTime: 10_000,
    });

    const { data: scoreSeries, isLoading: isLoadingScores } = useQuery({
        queryKey: ["scores", tickerId, startDate, endDate, interval],
        enabled: shouldFetch && dataType === "score",
        queryFn: async () => {
            const response = await axiosInstance.get(`/sentiments/trend/${tickerId}`, {
                params: {
                    period_start: startDate,
                    period_end: endDate,
                    interval: interval,
                },
            });

            if (response.data.success === false) {
                toast.error(response.data.message);
                return [];
            }

            // Format data for ApexCharts
            return [
                {
                    name: "Sentiment Score",
                    data: response.data.data.map((point) => ({
                        x: new Date(point.t),
                        y: point.s,
                    })),
                },
            ];
        },
        refetchInterval: 10_000,
        staleTime: 10_000,
    });

    useEffect(() => {
        setInterval(dataType === "price" ? "1m" : "1d");

        if (dataType === "price") {
            setColor(positive ? "#22c55e" : "#ef4444");
        } else if (scoreSeries) {
            const lastPoint = scoreSeries[0]?.data[scoreSeries[0]?.data.length - 1];
            setColor(lastPoint?.y > 0 ? "#22c55e" : "#ef4444");
        }
    }, [dataType, positive, scoreSeries]);

    const isLoading = isLoadingScores || isLoadingQuotes;
    const chartData = dataType === "price" ? quoteSeries : scoreSeries;

    // Safely check if data exists and has content
    const hasData = !isLoading && chartData[0]?.data && chartData[0]?.data?.length > 0;

    const lastPoint = chartData?.[0]?.data?.[chartData?.[0]?.data?.length - 1];

    const chartOptions = {
        chart: {
            type: "area",
            zoom: { enabled: true },
            toolbar: { show: false },
        },
        dataLabels: { enabled: false },
        stroke: {
            curve: "straight",
            width: 1,
        },
        xaxis: {
            type: "datetime",
            labels: {
                datetimeUTC: false,
                formatter: (value) =>
                    ["1d", "1wk", "1mo", "3mo", "6mo", "1y", "5y", "ytd", "max"].includes(interval)
                        ? moment(value).format("MMM D")
                        : moment(value).format("h:mm A"),
            },
        },
        yaxis: {
            opposite: true,
            axisBorder: {
                show: true,
                color: "#999", // Customize color
                width: 1,
            },
            axisTicks: {
                show: true,
                color: "#999",
            },
        },
        tooltip: {
            shared: false,
            custom: ({ dataPointIndex }) => {
                const point = chartData?.[0]?.data?.[dataPointIndex];
                if (!point) return "";
                return `<div class="text-xs">
                        <span class="bg-neutral-200/50 w-full block px-2 p-1 font-medium border-b">${moment(point?.x).format(dataType === "price" ? "M/D h:mm A" : "M/D/YYYY")}</span>
                        <div class="grid grid-cols-2 gap-1 p-2">
                            <span>${dataType === "price" ? "Price" : "Score"}:</span>
                            <span class="justify-self-end">${point?.y}</span>
                        </div>
                    </div>`;
            },
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.5,
                stops: [50, 90, 100],
            },
        },
        colors: [color],
        annotations: {
            yaxis: lastPoint?.y
                ? [
                      {
                          y: lastPoint.y,
                          borderColor: color,
                          label: {
                              borderColor: color,
                              style: {
                                  color: "#fff",
                                  background: color,
                              },
                              text: lastPoint.y.toFixed(2),
                          },
                      },
                  ]
                : [],
        },
    };

    return (
        <div className="p-4">
            <Card className="bg-background border-none shadow-none">
                <CardHeader className="p-0">
                    <CardTitle>Charting</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-8 p-0">
                    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-3 md:grid-cols-4 lg:w-[900px] lg:grid-cols-5">
                        <div className="grid gap-2">
                            <Label>Chart Type</Label>
                            <Select
                                value={dataType}
                                onValueChange={setDataType}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chart Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="price">Price</SelectItem>
                                    {ticker?.market === "stocks" && <SelectItem value="score">Sentiment score</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>

                        {dataType === "price" && (
                            <div className="grid gap-2">
                                <Label>Periods</Label>
                                <Select
                                    value={period}
                                    onValueChange={setPeriod}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Periods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pricePeriods.map((period) => (
                                            <SelectItem
                                                key={period}
                                                value={period}
                                            >
                                                {period}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Interval</Label>
                            <Select
                                onValueChange={setInterval}
                                value={interval}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Interval" />
                                </SelectTrigger>
                                <SelectContent>
                                    {dataType === "price"
                                        ? priceIntervals.map((interval) => (
                                              <SelectItem
                                                  key={interval}
                                                  value={interval}
                                              >
                                                  {interval}
                                              </SelectItem>
                                          ))
                                        : scoreIntervals.map((interval) => (
                                              <SelectItem
                                                  key={interval}
                                                  value={interval}
                                              >
                                                  {interval}
                                              </SelectItem>
                                          ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {hasData ? (
                        <ApexChart
                            options={chartOptions}
                            series={chartData}
                            type="area"
                            height={350}
                        />
                    ) : isLoading ? (
                        <p className="p-4">Loading...</p>
                    ) : (
                        <p className="p-4">No data points available for this configuration.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Charting;
