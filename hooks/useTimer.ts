import { useEffect, useRef, useState } from 'react';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';

export function useTimer() {
    const [isActive, setIsActive] = useState(false);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [startTime, setStartTime] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const progress = useSharedValue(0);

    const startTimer = () => {
        setIsActive(true);
        setSecondsElapsed(0);
        setStartTime(new Date().toISOString());
        progress.value = 0;

        intervalRef.current = setInterval(() => {
            setSecondsElapsed((prev) => {
                const next = prev + 1;
                // Progress loops every 60 seconds linearly to feel alive
                progress.value = withTiming((next % 60) / 60, { duration: 1000, easing: Easing.linear });
                return next;
            });
        }, 1000);
    };

    const stopTimer = () => {
        setIsActive(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        progress.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
        const duration = secondsElapsed;
        // Here we will eventually save session to log
        return duration; // returns total seconds studied
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return {
        isActive,
        secondsElapsed,
        formattedTime: formatTime(secondsElapsed),
        progress,
        startTime,
        startTimer,
        stopTimer,
    };
}
