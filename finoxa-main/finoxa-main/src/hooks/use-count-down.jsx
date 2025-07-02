import { useState, useEffect, useRef } from "react";

/**
 * A hook that counts down from a specified number of seconds
 *
 * @param {number} initialSeconds - The initial number of seconds to count down from
 * @param {Object} options - Configuration options
 * @param {number} options.interval - Update interval in milliseconds (default: 1000)
 * @param {boolean} options.autoStart - Whether to start the countdown automatically (default: true)
 * @param {Function} options.onTick - Callback function called on each interval tick
 * @param {Function} options.onComplete - Callback function called when countdown completes
 * @returns {Object} An object containing the current count and a function to reset the countdown
 */
export const useCountdown = (initialSeconds, options = {}) => {
    const { interval = 1000, autoStart = false, onStart = () => {}, onTick = () => {}, onComplete = () => {} } = options;

    const [count, setCount] = useState(initialSeconds);

    const onCompleteRef = useRef(onComplete);
    const onTickRef = useRef(onTick);
    const intervalRef = useRef(null);

    // Update refs when callbacks change
    useEffect(() => {
        onTickRef.current = onTick;
        onCompleteRef.current = onComplete;
    }, [onTick, onComplete]);

    const start = () => {
        if (intervalRef.current) return;

        onStart();

        intervalRef.current = setInterval(() => {
            setCount((prevCount) => {
                if (prevCount <= 1) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    onCompleteRef.current(0);
                    return 0;
                }

                const newCount = prevCount - 1;
                onTickRef.current(newCount);
                return newCount;
            });
        }, interval);
    };

    useEffect(() => {
        if (autoStart) {
            start();
        }

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [interval, autoStart]);

    return { count, setCount, start };
};
