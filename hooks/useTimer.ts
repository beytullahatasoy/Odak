import AsyncStorage from '@react-native-async-storage/async-storage';
// Conditional import for notifee to avoid Expo Go crash
let notifee: any = null;
let AndroidImportance: any = null;
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import Constants from 'expo-constants';

if (Constants.appOwnership !== 'expo') {
    try {
        const notifeeModule = require('@notifee/react-native');
        notifee = notifeeModule.default;
        AndroidImportance = notifeeModule.AndroidImportance;
    } catch (e) {
        console.log('Notifee import error:', e);
    }
}

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
    const [isPaused, setIsPaused] = useState(false);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [startTime, setStartTime] = useState<string | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const progress = useSharedValue(0);

    const updateNotification = async (seconds: number, isPaused: boolean = false, startMs: number | null = null) => {
        if (Constants.appOwnership === 'expo' || !notifee) return;

        try {
            const channelId = await notifee.createChannel({
                id: 'odak_timer',
                name: 'Odak Zamanlayıcısı',
                importance: AndroidImportance.LOW,
            });

            await notifee.displayNotification({
                id: 'timer',
                title: isPaused ? 'Odak Süresi Duraklatıldı' : 'Odak Süresi Devam Ediyor',
                body: isPaused ? formatTime(seconds) : undefined,
                android: {
                    channelId,
                    asForegroundService: true,
                    ongoing: true,
                    onlyAlertOnce: true,
                    showTimestamp: !isPaused,
                    timestamp: startMs || undefined,
                    usesChronometer: !isPaused,
                    chronometerDirection: 'up',
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
                        
                        // Restart notification with chronometer
                        updateNotification(initialSeconds, false, startMs);

                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                        }

                        intervalRef.current = setInterval(() => {
                            const newSeconds = Math.floor((Date.now() - startMs) / 1000);
                            setSecondsElapsed(newSeconds);
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
        setIsPaused(false);
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

        if (Constants.appOwnership !== 'expo' && notifee) {
            try {
                await notifee.requestPermission();
            } catch (e) {
                console.log('Notifee permission error', e);
            }
        }

        updateNotification(0, false, startMs);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            const newSeconds = Math.floor((Date.now() - startMs) / 1000);
            setSecondsElapsed(newSeconds);
        }, 1000);
    };

    useEffect(() => {
        if (isActive && !isPaused && secondsElapsed > 0) {
            progress.value = withTiming((secondsElapsed % 3600) / 3600, { duration: 1000, easing: Easing.linear });
        }
    }, [secondsElapsed, isActive, isPaused, progress]);

    const pauseTimer = () => {
        setIsPaused(true);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        // stop animation where it is
        progress.value = progress.value;
        updateNotification(secondsElapsed, true);
    };

    const resumeTimer = () => {
        setIsPaused(false);
        const startMs = Date.now() - (secondsElapsed * 1000);
        const newStartTimeIso = new Date(startMs).toISOString();
        setStartTime(newStartTimeIso);
        AsyncStorage.setItem(ACTIVE_SESSION_KEY, newStartTimeIso).catch(e => console.error(e));
        
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        updateNotification(secondsElapsed, false, startMs);

        intervalRef.current = setInterval(() => {
            const newSeconds = Math.floor((Date.now() - startMs) / 1000);
            setSecondsElapsed(newSeconds);
        }, 1000);
    };

    const stopTimer = () => {
        setIsActive(false);
        setIsPaused(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        progress.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
        const duration = secondsElapsed;
        setSecondsElapsed(0);
        
        // Remove active session from storage
        AsyncStorage.removeItem(ACTIVE_SESSION_KEY).catch(e => console.error(e));
        
        
        if (Constants.appOwnership !== 'expo' && notifee) {
            try {
                notifee.stopForegroundService();
                notifee.cancelNotification('timer');
            } catch(e) {
                console.log('Notifee durdurma hatası:', e);
            }
        }

        return duration; // returns total seconds studied
    };

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active' && isActive && !isPaused && startTime) {
                const startMs = new Date(startTime).getTime();
                const newSeconds = Math.floor((Date.now() - startMs) / 1000);
                setSecondsElapsed(newSeconds);
            }
        });

        return () => {
            subscription.remove();
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, isPaused, startTime]);

    return {
        isActive,
        isPaused,
        secondsElapsed,
        formattedTime: formatTime(secondsElapsed),
        progress,
        startTime,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
    };
}
