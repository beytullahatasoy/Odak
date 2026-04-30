import { create } from 'zustand';
import { Settings, loadSettings, saveSettings } from '../utils/storage';

interface SettingsState {
    settings: Settings;
    isLoaded: boolean;
    loadInitialData: () => Promise<void>;
    updateSettings: (newSettings: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: {
        dailyGoalMinutes: 180,
        currentStreak: 0,
        lastStudyDate: '',
        longestStreak: 0,
    },
    isLoaded: false,

    loadInitialData: async () => {
        const data = await loadSettings();
        set({ settings: data, isLoaded: true });
    },

    updateSettings: (newSettings) => {
        const current = get().settings;
        const updated = { ...current, ...newSettings };
        set({ settings: updated });
        saveSettings(updated);
    },
}));
