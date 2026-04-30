import AsyncStorage from '@react-native-async-storage/async-storage';

export const SESSION_KEY = 'odak_sessions';
export const SETTINGS_KEY = 'odak_settings';

export interface Session {
    id: string;
    startTime: string; // ISO date string
    endTime: string;   // ISO date string
    duration: number;  // seconds
}

export interface Settings {
    dailyGoalMinutes: number;
    currentStreak: number;
    lastStudyDate: string;
    longestStreak: number;
}

export const loadSessions = async (): Promise<Session[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(SESSION_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Failed to load sessions", e);
        return [];
    }
};

export const saveSessions = async (sessions: Session[]) => {
    try {
        const jsonValue = JSON.stringify(sessions);
        await AsyncStorage.setItem(SESSION_KEY, jsonValue);
    } catch (e) {
        console.error("Failed to save sessions", e);
    }
};

export const loadSettings = async (): Promise<Settings> => {
    const defaultSettings: Settings = {
        dailyGoalMinutes: 180,
        currentStreak: 0,
        lastStudyDate: '',
        longestStreak: 0,
    };
    try {
        const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
        return jsonValue != null ? { ...defaultSettings, ...JSON.parse(jsonValue) } : defaultSettings;
    } catch (e) {
        console.error("Failed to load settings", e);
        return defaultSettings;
    }
};

export const saveSettings = async (settings: Settings) => {
    try {
        const jsonValue = JSON.stringify(settings);
        await AsyncStorage.setItem(SETTINGS_KEY, jsonValue);
    } catch (e) {
        console.error("Failed to save settings", e);
    }
};
