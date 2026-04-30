import { Settings } from './storage';

/**
 * Calculates new streak based on the new session.
 * Requirements:
 * - 10 minutes minimum for a session to count towards streak.
 * - If last study date is yesterday, streak increases.
 * - If last study date is before yesterday, streak resets to 1 (if >= 10 mins).
 * - If last study date is today, streak unaffected.
 * 
 * Returns updated partial settings object.
 */
export function calculateStreak(
    currentSettings: Settings,
    durationSeconds: number,
    sessionStartTimeISO: string
): Partial<Settings> {
    // If session is less than 10 minutes, do not count towards streak.
    if (durationSeconds < 600) {
        return {};
    }

    const sessionDateStr = sessionStartTimeISO.split('T')[0];
    const lastStudyDateStr = currentSettings.lastStudyDate;

    // First valid session ever
    if (!lastStudyDateStr) {
        return {
            lastStudyDate: sessionDateStr,
            currentStreak: 1,
            longestStreak: Math.max(1, currentSettings.longestStreak)
        };
    }

    // Same day -> No streak change, but lastStudyDate should already be the same 
    if (lastStudyDateStr === sessionDateStr) {
        return {};
    }

    // Different day, check if yesterday
    const sessionDate = new Date(sessionDateStr);
    const lastStudyDate = new Date(lastStudyDateStr);

    const diffTime = sessionDate.getTime() - lastStudyDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
        // Valid next-day streak
        const newStreak = currentSettings.currentStreak + 1;
        return {
            lastStudyDate: sessionDateStr,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, currentSettings.longestStreak)
        };
    } else if (diffDays > 1) {
        // Streak broken, reset to 1
        return {
            lastStudyDate: sessionDateStr,
            currentStreak: 1,
            longestStreak: currentSettings.longestStreak
        };
    }

    return {};
}

/**
 * Checks if the streak is broken for TODAY.
 * Specifically, if lastStudyDate is older than yesterday, the streak is broken.
 */
export function isStreakBroken(currentSettings: Settings): boolean {
    const lastStudyDateStr = currentSettings.lastStudyDate;
    if (!lastStudyDateStr || currentSettings.currentStreak === 0) return false;

    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);
    const lastStudyDate = new Date(lastStudyDateStr);

    const diffTime = today.getTime() - lastStudyDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    return diffDays > 1; // It was broken if the gap is more than 1 day 
}
