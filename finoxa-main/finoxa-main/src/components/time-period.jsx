import { useState } from "react";
import { cn } from "@/lib/utils";

export const TimePeriodSelector = ({ onPeriodChange, className, periods = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y", "ALL"] }) => {
    const [selectedPeriod, setSelectedPeriod] = useState("1D");

    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
        if (onPeriodChange) {
            onPeriodChange(period);
        }
    };

    return (
        <div className={cn("flex items-center rounded-full bg-gray-100 p-1", className)}>
            {periods.map((period) => (
                <button
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    className={cn(
                        "rounded px-3 py-1 text-sm font-medium transition-colors",
                        selectedPeriod === period ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900",
                    )}
                >
                    {period}
                </button>
            ))}
        </div>
    );
};
