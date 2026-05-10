import TopHeader from '@/components/TopHeader';
import { theme } from '@/constants/theme';
import { useSessionStore } from '@/store/sessionStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getWeeklyComparison } from '@/utils/insights';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, barDataItem } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

const DAYS = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];

export default function WeeklyScreen() {
    const { sessions } = useSessionStore();
    const { settings } = useSettingsStore();

    const [viewMode, setViewMode] = useState<'Saat' | 'Seans'>('Saat');
    const insightText = getWeeklyComparison(sessions);

    const weeklyData = useMemo(() => {
        const data: { [key: string]: { duration: number; count: number } } = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const isoDate = d.toISOString().split('T')[0];
            data[isoDate] = { duration: 0, count: 0 };
        }

        sessions.forEach(session => {
            const sessionDate = session.startTime.split('T')[0];
            if (data[sessionDate] !== undefined) {
                data[sessionDate].duration += session.duration;
                data[sessionDate].count += 1;
            }
        });
        return data;
    }, [sessions]);

    let totalSeconds = 0;
    let totalSessions = 0;
    let maxVal = 0;
    let minVal = Infinity;
    let bestDayIndex = -1;
    let worstDayIndex = -1;

    const entries = Object.entries(weeklyData);

    // find max/min
    entries.forEach(([dateStr, stats], index) => {
        totalSeconds += stats.duration;
        totalSessions += stats.count;

        // Using duration for best/worst calculation
        if (stats.duration > maxVal) { maxVal = stats.duration; bestDayIndex = index; }
        if (stats.duration < minVal) { minVal = stats.duration; worstDayIndex = index; }
    });

    const chartData: barDataItem[] = entries.map(([dateStr, stats], index) => {
        const dObj = new Date(dateStr);
        const value = viewMode === 'Saat' ? (stats.duration / 3600) : stats.count;
        const isMax = index === bestDayIndex && value > 0;

        return {
            value,
            label: DAYS[dObj.getDay() === 0 ? 6 : dObj.getDay() - 1],
            spacing: 16,
            labelWidth: 30,
            labelTextStyle: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: 'bold' },
            frontColor: isMax ? theme.colors.accentLight : '#1C1C28',
            topLabelComponent: () => {
                if (value <= 0) return null;
                return (
                    <View style={{ alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ color: isMax ? theme.colors.accentLight : theme.colors.textSecondary, fontSize: 11, fontWeight: 'bold' }}>
                            {viewMode === 'Saat' ? `${value.toFixed(1)}s` : `${value}`}
                        </Text>
                    </View>
                );
            },
        };
    });

    const bestDayName = bestDayIndex >= 0 && maxVal > 0 ? chartData[bestDayIndex].label : '—';
    const worstDayName = worstDayIndex >= 0 && maxVal > 0 ? chartData[worstDayIndex].label : '—';

    const totalHrs = Math.floor(totalSeconds / 3600);
    const totalMins = Math.floor((totalSeconds % 3600) / 60);
    const avgSeconds = totalSeconds / 7;
    const avgHrs = Math.floor(avgSeconds / 3600);
    const avgMins = Math.floor((avgSeconds % 3600) / 60);

    const formatTime = (h: number, m: number) => {
        if (h > 0 && m > 0) return `${h} sa ${m} dk`;
        if (h > 0) return `${h} saat`;
        return `${m} dk`;
    };

    const totalTimeText = formatTime(totalHrs, totalMins);
    const avgTimeText = formatTime(avgHrs, avgMins);

    const weeklyGoalSeconds = settings.dailyGoalMinutes * 60 * 7;
    const efficiency = weeklyGoalSeconds > 0 ? Math.min(100, Math.round((totalSeconds / weeklyGoalSeconds) * 100)) : 0;

    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.container}>
                <TopHeader />

                <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                    <Text style={styles.headerLabel}>PERFORMANS ANALİZİ</Text>
                    <Text style={styles.mainTitle}>Haftalık Özet</Text>

                    {/* Big Insight Card */}
                    <View style={styles.insightCard}>
                        <View style={styles.insightHeaderRow}>
                            <View style={styles.insightIconCircle}>
                                <FontAwesome name="line-chart" size={14} color={theme.colors.accentLight} />
                            </View>
                            <Text style={styles.insightLabel}>ZEKİCE ANALİZ</Text>
                        </View>
                        <Text style={styles.insightMainText}>{insightText}</Text>

                        <View style={styles.buttonWrapper}>
                            <Pressable style={styles.detailButton} onPress={() => router.push('/daily')}>
                                <Text style={styles.detailButtonText}>Detayları Gör</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Stats List */}
                    <View style={styles.statsCardContainer}>
                        <View style={styles.statRowBlock}>
                            <Text style={styles.statLabelLeft}>TOPLAM</Text>
                            <Text style={styles.statValueRow}>{totalTimeText}</Text>
                        </View>
                        <View style={styles.statRowBlock}>
                            <Text style={styles.statLabelLeft}>ORTALAMA</Text>
                            <Text style={styles.statValueRow}>
                                {avgTimeText} <Text style={styles.statSubValueRow}>/gün</Text>
                            </Text>
                        </View>
                        <View style={styles.statRowBlock}>
                            <Text style={styles.statLabelLeft}>VERİM</Text>
                            <Text style={styles.statValueRow}>%{efficiency}</Text>
                        </View>
                    </View>

                    {/* Graph Section */}
                    <View style={styles.graphContainer}>
                        <View style={styles.graphHeader}>
                            <View>
                                <Text style={styles.graphTitle}>Odak Dağılımı</Text>
                                <Text style={styles.graphSub}>Son 7 günlük aktivite grafiği</Text>
                            </View>
                            <View style={styles.toggleRow}>
                                <Pressable
                                    style={[styles.toggleBtn, viewMode === 'Saat' && styles.toggleActive]}
                                    onPress={() => setViewMode('Saat')}
                                >
                                    <Text style={[styles.toggleText, viewMode === 'Saat' && styles.toggleTextActive]}>Saat</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.toggleBtn, viewMode === 'Seans' && styles.toggleActive]}
                                    onPress={() => setViewMode('Seans')}
                                >
                                    <Text style={[styles.toggleText, viewMode === 'Seans' && styles.toggleTextActive]}>Seans</Text>
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.chartWrapper}>
                            <BarChart
                                data={chartData}
                                barWidth={24}
                                spacing={20}
                                roundedTop
                                roundedBottom
                                hideRules
                                hideYAxisText
                                xAxisThickness={0}
                                yAxisThickness={0}
                                maxValue={Math.max(1, ...chartData.map(d => d.value ?? 0))}
                                height={150}
                            />
                        </View>

                        {bestDayName !== '—' && (
                            <View style={styles.graphBottomRow}>
                                <View style={styles.dotPurple} />
                                <Text style={styles.graphBottomText}>Bu hafta en aktif günün {bestDayName}</Text>
                            </View>
                        )}
                    </View>

                    {/* Best / Worst Cards Vertically Stacked */}
                    <View style={[styles.dayCard, styles.bestDayCard]}>
                        <View style={styles.dayCardContent}>
                            <View style={styles.dayCardHeaderRow}>
                                <Text style={styles.bestLabel}>🔥 EN İYİ GÜN</Text>
                            </View>
                            <Text style={styles.dayCardTitle}>{bestDayName}</Text>
                            <Text style={styles.dayCardSub}>Haftalık hedefin %{efficiency === 0 ? '0' : '130'}'u tamamlandı.</Text>
                        </View>
                        <View style={styles.bestIconBg}>
                            <FontAwesome name="magic" size={24} color={theme.colors.accentLight} />
                        </View>
                    </View>

                    <View style={[styles.dayCard, styles.worstDayCard]}>
                        <View style={styles.dayCardContent}>
                            <View style={styles.dayCardHeaderRow}>
                                <Text style={styles.worstLabel}>⚠️ EN ZAYIF GÜN</Text>
                            </View>
                            <Text style={styles.dayCardTitle}>{worstDayName}</Text>
                            <Text style={styles.dayCardSub}>Küçük bir mola, büyük bir geri dönüş demektir.</Text>
                        </View>
                        <View style={styles.worstIconBg}>
                            <FontAwesome name="battery-0" size={24} color={theme.colors.danger} />
                        </View>
                    </View>

                </ScrollView>
            </View>
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
        color: theme.colors.accentLight,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    mainTitle: {
        color: theme.colors.textPrimary,
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 32,
    },
    insightCard: {
        backgroundColor: '#161622',
        borderRadius: 32,
        padding: 24,
        marginBottom: 16,
    },
    insightHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    insightIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#26263B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    insightLabel: {
        color: theme.colors.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    insightMainText: {
        color: theme.colors.textPrimary,
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 28,
        marginBottom: 20,
    },
    buttonWrapper: {
        alignItems: 'flex-start',
    },
    detailButton: {
        backgroundColor: theme.colors.accentLight,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
    },
    detailButtonText: {
        color: '#000000',
        fontSize: 12,
        fontWeight: 'bold',
    },
    statsCardContainer: {
        gap: 8,
        marginBottom: 24,
    },
    statRowBlock: {
        backgroundColor: '#121215',
        padding: 20,
        borderRadius: 24,
    },
    statLabelLeft: {
        color: '#666',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 8,
    },
    statValueRow: {
        color: theme.colors.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    statSubValueRow: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontWeight: 'normal',
    },
    graphContainer: {
        backgroundColor: '#121215',
        borderRadius: 32,
        padding: 24,
        marginBottom: 32,
    },
    graphHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
    },
    graphTitle: {
        color: theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    graphSub: {
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
    toggleRow: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1F',
        borderRadius: 16,
        padding: 4,
    },
    toggleBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
    },
    toggleActive: {
        backgroundColor: '#26262B',
    },
    toggleText: {
        color: theme.colors.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
    },
    toggleTextActive: {
        color: theme.colors.textPrimary,
    },
    chartWrapper: {
        alignItems: 'center',
        marginBottom: 20,
    },
    graphBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    dotPurple: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.accentLight,
    },
    graphBottomText: {
        color: theme.colors.accentLight,
        fontSize: 12,
        fontWeight: '600',
    },
    dayCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 24,
        borderRadius: 32,
        marginBottom: 16,
        borderWidth: 1,
    },
    bestDayCard: {
        backgroundColor: '#161622',
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.accentLight,
        borderColor: '#1A1A2A',
    },
    worstDayCard: {
        backgroundColor: '#1A141A',
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.danger,
        borderColor: '#2A181C',
    },
    dayCardContent: {
        flex: 1,
        paddingRight: 16,
    },
    dayCardHeaderRow: {
        marginBottom: 8,
    },
    bestLabel: {
        color: theme.colors.accentLight,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    worstLabel: {
        color: theme.colors.danger,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    dayCardTitle: {
        color: theme.colors.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    dayCardSub: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        lineHeight: 18,
    },
    bestIconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#26263B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    worstIconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#301A20',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
