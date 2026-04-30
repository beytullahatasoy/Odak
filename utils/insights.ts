import { Session } from './storage';

export function getWeeklyComparison(sessions: Session[]): string {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const fourteenDaysAgo = new Date(sevenDaysAgo);
    fourteenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let thisWeekSeconds = 0;
    let lastWeekSeconds = 0;

    sessions.forEach(s => {
        const d = new Date(s.startTime);
        if (d >= sevenDaysAgo && d <= today) {
            thisWeekSeconds += s.duration;
        } else if (d >= fourteenDaysAgo && d < sevenDaysAgo) {
            lastWeekSeconds += s.duration;
        }
    });

    if (lastWeekSeconds === 0) {
        if (thisWeekSeconds > 0) return "Harika bir başlangıç! Bu hafta aktif olarak çalıştın.";
        return "Analiz için henüz yeterli veri birikmedi.";
    }

    const diffPercent = Math.round(((thisWeekSeconds - lastWeekSeconds) / lastWeekSeconds) * 100);

    if (diffPercent > 0) {
        return `Bu hafta geçen haftaya göre +%${diffPercent} daha fazla çalıştın. Harika gidiyorsun!`;
    } else if (diffPercent < 0) {
        return `Bu hafta geçen haftaya göre %${Math.abs(diffPercent)} daha az çalıştın. Toparlayabilirsin!`;
    } else {
        return `Geçen haftayla tamamen aynı sürede çalıştın, istikrar harika.`;
    }
}
