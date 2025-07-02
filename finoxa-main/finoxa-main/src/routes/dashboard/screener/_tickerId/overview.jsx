import { useOutletContext, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import ApexChart from "react-apexcharts";
import moment from "moment";
import { axiosInstance } from "@/utils/axios-instance";

const Overview = () => {
    const { tickerId } = useParams();

    const { positive } = useOutletContext();

    const color = positive ? "#22c55e" : "#ef4444";

    const { data, isLoading, error } = useQuery({
        queryKey: ["overview", tickerId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/quotes/${tickerId}`, {
                params: {
                    period: "1d",
                    interval: "1m",
                },
            });

            const result = response.data;

            if (!result?.data || !Array.isArray(result.data)) {
                throw new Error("Unexpected data format");
            }

            return result.data.map((point) => ({
                ...point,
                x: new Date(point.t),
                y: point?.c,
            }));
        },
        refetchInterval: 10_000,
        staleTime: 10_000,
    });

    if (isLoading) return <p className="p-4">Loading...</p>;
    if (error) return <p className="p-4 text-red-500">Failed to load chart data.</p>;

    const lastPoint = data[data.length - 1];

    const chartOptions = {
        chart: {
            type: "area",
            zoom: { enabled: false },
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
                formatter: (value) => moment(value).format("h:mm A"),
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
                const point = data[dataPointIndex];
                return `<div class="text-xs">
                            <span class="bg-neutral-200/50 w-full block px-2 p-1 font-medium border-b">${moment(point.t).format("M/D h:mm A")}</span>
                            <div class="grid grid-cols-2 gap-1 p-2">
                                <span>Open:</span>
                                <span class="justify-self-end">${point.o}</span>
                                <span>High:</span>
                                <span class="justify-self-end">${point.h}</span>
                                <span>Low:</span>
                                <span class="justify-self-end">${point.l}</span>
                                <span>Close:</span>
                                <span class="justify-self-end">${point?.c}</span>
                                <span>Volume:</span>
                                <span class="justify-self-end">${point.v.toLocaleString()}</span>
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
            yaxis: [
                {
                    y: lastPoint?.c,
                    borderColor: color,
                    label: {
                        borderColor: color,
                        style: {
                            color: "#fff",
                            background: color,
                        },
                        text: lastPoint?.c,
                    },
                },
            ],
        },
    };

    const chartSeries = [
        {
            name: "Close Price",
            data: data.map((point) => ({
                x: point.x,
                y: point?.c,
            })),
        },
    ];

    return (
        <div className="p-4">
            <ApexChart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={350}
            />
        </div>
    );
};

export default Overview;
