import { create } from 'zustand';
import { Session, loadSessions, saveSessions } from '../utils/storage';

interface SessionState {
    sessions: Session[];
    isLoaded: boolean;
    loadInitialData: () => Promise<void>;
    addSession: (session: Session) => void;
    getTodayTotalSeconds: () => number;
    getTodaySessionsCount: () => number;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    sessions: [],
    isLoaded: false,

    loadInitialData: async () => {
        const data = await loadSessions();
        set({ sessions: data, isLoaded: true });
    },

    addSession: (session) => {
        const currentSessions = get().sessions;
        const newSessions = [session, ...currentSessions];
        set({ sessions: newSessions });
        saveSessions(newSessions);
    },

    getTodayTotalSeconds: () => {
        const { sessions } = get();
        const today = new Date().toISOString().split('T')[0];
        return sessions
            .filter((s) => s.startTime.startsWith(today))
            .reduce((acc, curr) => acc + curr.duration, 0);
    },

    getTodaySessionsCount: () => {
        const { sessions } = get();
        const today = new Date().toISOString().split('T')[0];
        return sessions.filter((s) => s.startTime.startsWith(today)).length;
    },
}));
