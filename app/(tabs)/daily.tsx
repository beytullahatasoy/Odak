import GoalSheet from '@/components/GoalSheet';
import SessionCard from '@/components/SessionCard';
import TopHeader from '@/components/TopHeader';
import { theme } from '@/constants/theme';
import { useSessionStore } from '@/store/sessionStore';
import { useSettingsStore } from '@/store/settingsStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DailyScreen() {
    const { sessions, getTodayTotalSeconds } = useSessionStore();
    const { settings } = useSettingsStore();
    const [isGoalSheetVisible, setGoalSheetVisible] = useState(false);

    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => s.startTime.startsWith(today));

    const todayTotalSeconds = getTodayTotalSeconds();
    const dailyGoalSeconds = settings.dailyGoalMinutes * 60;
    const progressPercent = Math.min(100, Math.round((todayTotalSeconds / dailyGoalSeconds) * 100));

    const totalHrs = Math.floor(todayTotalSeconds / 3600);
    const totalMins = Math.floor((todayTotalSeconds % 3600) / 60);

    let longestSessionIndex = -1;
    let maxDuration = 0;
    let totalDuration = 0;

    todaySessions.forEach((s, i) => {
        totalDuration += s.duration;
        if (s.duration > maxDuration) {
            maxDuration = s.duration;
            longestSessionIndex = i;
        }
    });

    const avgDuration = todaySessions.length > 0 ? Math.floor(totalDuration / todaySessions.length) : 0;
    const avgMins = Math.floor(avgDuration / 60);
    const longestHrs = Math.floor(maxDuration / 3600);
    const longestMins = Math.floor((maxDuration % 3600) / 60);
    const remainingSeconds = Math.max(0, dailyGoalSeconds - todayTotalSeconds);
    const remainingMins = Math.floor(remainingSeconds / 60);

    const diffMins = Math.floor(todayTotalSeconds / 60) - 25;
    const diffDisplay = diffMins >= 0 ? `+${diffMins}` : diffMins.toString();

    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.container}>
                <TopHeader />

                <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                    <Text style={styles.headerLabel}>GÜNLÜK ÖZET</Text>
                    <View style={styles.titleRow}>
                        <Text style={styles.mainTitle}>{totalHrs > 0 ? `${totalHrs}s ` : ''}{totalMins}dk</Text>
                        <View style={styles.trendBadge}>
                            <Text style={styles.trendText}>BUGÜN {diffDisplay} DK</Text>
                        </View>
                    </View>

                    {/* Goal Card */}
                    <View style={styles.goalCard}>
                        <View style={styles.goalRow}>
                            <View>
                                <Text style={styles.goalLabel}>HEDEF İLERLEMESİ</Text>
                                <Text style={styles.goalSub}>Günlük hedef: {settings.dailyGoalMinutes / 60} saat</Text>
                            </View>
                            <View style={styles.goalRight}>
                                <Text style={styles.goalPercent}>{progressPercent}%</Text>
                                <Pressable style={styles.editBtn} onPress={() => setGoalSheetVisible(true)}>
                                    <FontAwesome name="pencil" size={12} color="#AAA" />
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.progressRow}>
                            <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                            </View>
                        </View>
                        <Text style={styles.goalFooter}>
                            {progressPercent >= 100 ? 'Hedefe ulaştın!' : `Hedefe ulaşmana ${remainingMins} dk kaldı`}
                        </Text>
                    </View>

                    {/* Half Cards */}
                    <View style={styles.row}>
                        <View style={styles.halfCard}>
                            <View style={styles.halfCardIconRow}>
                                <View style={styles.iconWrapperBlue}>
                                    <FontAwesome name="shield" size={14} color={theme.colors.accentLight} />
                                </View>
                            </View>
                            <Text style={styles.halfCardLabel}>EN UZUN{"\n"}OTURUM</Text>
                            <Text style={styles.halfCardValue}>{longestHrs > 0 ? `${longestHrs}s ` : ''}{longestMins}dk</Text>
                        </View>

                        <View style={styles.halfCard}>
                            <View style={styles.halfCardIconRow}>
                                <View style={styles.iconWrapperGray}>
                                    <FontAwesome name="tachometer" size={14} color={theme.colors.textSecondary} />
                                </View>
                            </View>
                            <Text style={styles.halfCardLabel}>ORTALAMA</Text>
                            <Text style={styles.halfCardValue}>{avgMins} dk</Text>
                        </View>
                    </View>

                    {/* Oturum Geçmişi List */}
                    <View style={styles.historySection}>
                        <View style={styles.historyHeader}>
                            <Text style={styles.sectionTitle}>Oturum Geçmişi</Text>
                            <Text style={styles.viewAllText}>Tümünü Gör</Text>
                        </View>
                        {todaySessions.length === 0 ? (
                            <Text style={styles.emptyText}>Bugün henüz oturum kaydedilmedi.</Text>
                        ) : (
                            todaySessions.map((s, idx) => (
                                <SessionCard
                                    key={s.id}
                                    session={s}
                                    isLongest={idx === longestSessionIndex && s.duration > 0}
                                />
                            ))
                        )}
                    </View>

                    {/* Streak Bottom Banner */}
                    <View style={styles.streakBanner}>
                        <View style={styles.streakIconCircle}>
                            <FontAwesome name="fire" size={14} color={theme.colors.accentLight} />
                        </View>
                        <Text style={styles.streakBannerText}>
                            <Text style={{ fontWeight: 'bold', color: theme.colors.textPrimary }}>Seri: {settings.currentStreak} gün</Text> — Bugün 10 dk çalışman yeterli
                        </Text>
                    </View>

                </ScrollView>
            </View>
            <GoalSheet visible={isGoalSheetVisible} onClose={() => setGoalSheetVisible(false)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingTop: 8,
        paddingBottom: 40,
    },
    headerLabel: {
        color: theme.colors.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 32,
        gap: 12,
    },
    mainTitle: {
        color: theme.colors.textPrimary,
        fontSize: 48,
        fontWeight: 'bold',
        letterSpacing: -1,
    },
    trendBadge: {
        backgroundColor: '#1C1C28',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    trendText: {
        color: theme.colors.accentLight,
        fontSize: 10,
        fontWeight: 'bold',
    },
    goalCard: {
        backgroundColor: '#121215',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
    },
    goalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    goalLabel: {
        color: theme.colors.textSecondary,
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    goalSub: {
        color: theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    goalRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    goalPercent: {
        color: theme.colors.accentLight,
        fontSize: 24,
        fontWeight: 'bold',
    },
    editBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#26262B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressTrack: {
        flex: 1,
        height: 12,
        backgroundColor: '#26262B',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.accentLight,
        borderRadius: 6,
    },
    goalFooter: {
        color: theme.colors.textSecondary,
        fontSize: 10,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    halfCard: {
        flex: 1,
        backgroundColor: '#121215',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#1D1D24', // subtle border per design
    },
    halfCardIconRow: {
        marginBottom: 16,
    },
    iconWrapperBlue: {
        width: 24,
        height: 24,
        borderRadius: 12, // small icon circle
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapperGray: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    halfCardLabel: {
        color: theme.colors.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 16,
    },
    halfCardValue: {
        color: theme.colors.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    historySection: {
        marginBottom: 40,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        color: theme.colors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewAllText: {
        color: theme.colors.accentLight,
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginVertical: 20,
    },
    streakBanner: {
        backgroundColor: '#16161A',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 60,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    streakIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2D1820', // subtle purple/red inner tint
        alignItems: 'center',
        justifyContent: 'center',
    },
    streakBannerText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        flex: 1,
    },
});
