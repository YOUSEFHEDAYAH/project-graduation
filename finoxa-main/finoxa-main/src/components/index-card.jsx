import ApexChart from "react-apexcharts";

import { Card } from "@/components/ui/card";

export const IndexCard = ({ name, value, change, isPositive, quotes }) => {
    const color = isPositive ? "#22c55e" : "#ef4444";

    const chartOptions = {
        chart: {
            type: "area",
            zoom: { enabled: false },
            toolbar: { show: false },
            sparkline: { enabled: true }, // Good for small charts
        },
        xaxis: { show: false },
        yaxis: { show: false },
        stroke: {
            curve: "straight",
            width: 1,
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
        dataLabels: { enabled: false },
        tooltip: { enabled: false },
    };

    return (
        <Card className="gap-2 px-6 py-4 shadow-none">
            <div>
                <p className="text-sm font-medium whitespace-nowrap">{name.split(" ").slice(0, 2).join(" ")}</p>
                <div className="flex items-center justify-between">
                    <p className="text-xl font-bold">{value}</p>
                    <span
                        className={`rounded px-2 py-1 text-sm font-medium ${isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                    >
                        {change}
                    </span>
                </div>
            </div>

            <div className="h-14 w-full">
                {quotes && quotes.length > 0 && (
                    <ApexChart
                        options={chartOptions}
                        series={[{ data: quotes }]}
                        type="area"
                        height="100%"
                    />
                )}
            </div>
        </Card>
    );
};
