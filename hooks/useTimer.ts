import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { useEffect, useRef, useState } from 'react';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';

const ACTIVE_SESSION_KEY = 'odak_active_session_start';

const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function useTimer() {
    const [isActive, setIsActive] = useState(false);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [startTime, setStartTime] = useState<string | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const progress = useSharedValue(0);

    const updateNotification = async (seconds: number) => {
        try {
            await notifee.requestPermission();
            const channelId = await notifee.createChannel({
                id: 'odak_timer',
                name: 'Odak Zamanlayıcısı',
                importance: AndroidImportance.LOW,
            });

            await notifee.displayNotification({
                id: 'timer',
                title: 'Odak Süresi Devam Ediyor',
                body: formatTime(seconds),
                android: {
                    channelId,
                    asForegroundService: true,
                    ongoing: true,
                    onlyAlertOnce: true,
                },
            });
        } catch (e) {
            console.log('Notifee hatası (muhtemelen Expo Go kullanılıyor):', e);
        }
    };

    // On mount, check if there's an active session
    useEffect(() => {
        const checkActiveSession = async () => {
            try {
                const savedStart = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
                if (savedStart) {
                    const startMs = new Date(savedStart).getTime();
                    const nowMs = Date.now();
                    
                    // If the saved session is somehow in the future, ignore it
                    if (startMs <= nowMs) {
                        setIsActive(true);
                        setStartTime(savedStart);
                        const initialSeconds = Math.floor((nowMs - startMs) / 1000);
                        setSecondsElapsed(initialSeconds);
                        
                        // Restart notification
                        updateNotification(initialSeconds);

                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                        }

                        intervalRef.current = setInterval(() => {
                            const newSeconds = Math.floor((Date.now() - startMs) / 1000);
                            setSecondsElapsed(newSeconds);
                            updateNotification(newSeconds);
                        }, 1000);
                    } else {
                        await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
                    }
                }
            } catch (e) {
                console.error('Failed to load active session', e);
            }
        };
        
        checkActiveSession();
    }, []);

    const startTimer = async () => {
        setIsActive(true);
        setSecondsElapsed(0);
        const now = new Date();
        const startMs = now.getTime();
        const isoString = now.toISOString();
        setStartTime(isoString);
        progress.value = 0;

        try {
            await AsyncStorage.setItem(ACTIVE_SESSION_KEY, isoString);
        } catch (e) {
            console.error('Failed to save active session', e);
        }

        updateNotification(0);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            const newSeconds = Math.floor((Date.now() - startMs) / 1000);
            setSecondsElapsed(newSeconds);
            updateNotification(newSeconds);
        }, 1000);
    };

    useEffect(() => {
        if (isActive && secondsElapsed > 0) {
            // Progress loops every 3600 seconds (1 hour) linearly to feel alive but slower
            progress.value = withTiming((secondsElapsed % 3600) / 3600, { duration: 1000, easing: Easing.linear });
        }
    }, [secondsElapsed, isActive, progress]);

    const stopTimer = () => {
        setIsActive(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        progress.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
        const duration = secondsElapsed;
        
        // Remove active session from storage
        AsyncStorage.removeItem(ACTIVE_SESSION_KEY).catch(e => console.error(e));
        
        try {
            notifee.stopForegroundService();
            notifee.cancelNotification('timer');
        } catch(e) {
            console.log('Notifee durdurma hatası:', e);
        }

        return duration; // returns total seconds studied
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

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
