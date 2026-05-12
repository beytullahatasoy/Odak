import CircularTimer from '@/components/CircularTimer';
import GoalSheet from '@/components/GoalSheet';
import TopHeader from '@/components/TopHeader';
import { theme } from '@/constants/theme';
import { useTimer } from '@/hooks/useTimer';
import { useSessionStore } from '@/store/sessionStore';
import { useSettingsStore } from '@/store/settingsStore';
import { calculateStreak, isStreakBroken } from '@/utils/streakLogic';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnaSayfa() {
  const { isActive, isPaused, formattedTime, progress, startTime, startTimer, pauseTimer, resumeTimer, stopTimer } = useTimer();

  const addSession = useSessionStore(state => state.addSession);
  const todayTotalSeconds = useSessionStore(state => state.getTodayTotalSeconds());
  const todaySessionsCount = useSessionStore(state => state.getTodaySessionsCount());

  const { settings, updateSettings } = useSettingsStore();
  const [isGoalSheetVisible, setGoalSheetVisible] = useState(false);

  const broken = isStreakBroken(settings);
  // Show broken UI if streak broken, NO timer active, and no sub-10 sessions completed today.
  const showBrokenUI = broken && !isActive && todayTotalSeconds < 600;

  const handleStop = () => {
    const duration = stopTimer();
    if (startTime && duration > 0) {
      addSession({
        id: Date.now().toString(),
        startTime,
        endTime: new Date().toISOString(),
        duration,
        title: `${todaySessionsCount + 1}. Oturum`,
      });

      const updatedStreak = calculateStreak(settings, duration, startTime);
      if (Object.keys(updatedStreak).length > 0) {
        updateSettings(updatedStreak);
      }
    }
  };

  const formatTotalTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return { hrs, mins };
  };

  const formatGoalTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} dk`;
    if (minutes % 60 === 0) return `${minutes / 60} saat`;
    return `${Math.floor(minutes / 60)}s ${minutes % 60}dk`;
  };

  const { hrs: totalHrs, mins: totalMins } = formatTotalTime(todayTotalSeconds);
  const dailyGoalSeconds = settings.dailyGoalMinutes * 60;
  const remainingSeconds = Math.max(0, dailyGoalSeconds - todayTotalSeconds);
  const remainingMins = Math.floor(remainingSeconds / 60);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>

        <TopHeader showStreak={!showBrokenUI} currentStreak={settings.currentStreak} />

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {showBrokenUI ? (
            /* BROKEN STREAK UI */
            <View style={styles.contentWrapper}>
              <View style={styles.brokenHeaderBox}>
                <View style={styles.brokenPill}>
                  <Text style={styles.brokenPillText}>😔 SERİ BOZULDU</Text>
                </View>
                <Text style={styles.mainTitle}>Yeniden başlamak{"\n"}için bugün çalış.</Text>
                <Text style={styles.subtextCenter}>Hala toparlayabilirsin! Bir sonraki adımın{"\n"}en önemlisi.</Text>
              </View>

              <View style={styles.timerWrapper}>
                <CircularTimer
                  progress={progress}
                  timeText={isActive ? formattedTime : '00:00:00'}
                  isActive={isActive}
                  topLabel="GÜNCEL SÜRE"
                />
              </View>

              <Pressable style={styles.primaryButton} onPress={startTimer}>
                <Text style={styles.primaryButtonText}>Derse Başla</Text>
              </Pressable>

              <View style={styles.cardsRow}>
                <View style={styles.halfCard}>
                  <Text style={styles.cardSmallLabelLeft}>SON SERİ</Text>
                  <Text style={styles.cardValue}>{settings.longestStreak} Gün</Text>
                </View>
                <View style={styles.halfCard}>
                  <Text style={styles.cardSmallLabelLeft}>HEDEF</Text>
                  <Text style={styles.cardValue}>30 Gün</Text>
                </View>
              </View>

              <Text style={styles.quoteText}>"Başarı, her gün tekrarlanan küçük çabaların toplamıdır."</Text>
            </View>
          ) : (
            /* NORMAL / ACTIVE UI */
            <View style={styles.contentWrapper}>
              <View style={styles.greetingBox}>
                {todayTotalSeconds === 0 && !isActive ? (
                  <>
                    <Text style={styles.mainTitle}>Bugün henüz{"\n"}başlamadın.</Text>
                    <Text style={styles.subtextCenter}>Serini korumak için bugün başla 🔥</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.greetingTitle}>Bugün iyi gidiyorsun</Text>
                    <Pressable onPress={() => setGoalSheetVisible(true)}>
                      <View style={styles.insightPill}>
                        <FontAwesome name="line-chart" size={12} color={theme.colors.accentLight} />
                        <Text style={styles.insightPillText}>+{remainingMins} dk hedefe kaldı</Text>
                      </View>
                    </Pressable>
                  </>
                )}
              </View>

              <View style={styles.timerWrapper}>
                <CircularTimer
                  progress={progress}
                  timeText={isActive ? formattedTime : (todayTotalSeconds === 0 ? '00:00:00' : formattedTime)}
                  isActive={isActive}
                  topLabel={isActive ? "GÜNCEL OTURUM" : (todayTotalSeconds === 0 ? "" : "GÜNCEL SÜRE")}
                  bottomLabel={isActive ? "DERİN ODAK MODU" : "TOPLAM ODAKLANMA"}
                />
              </View>

              {isActive ? (
                <View style={styles.actionButtonsRow}>
                  {isPaused ? (
                    <Pressable style={[styles.primaryButton, { flex: 1, marginBottom: 0, paddingHorizontal: 0 }]} onPress={resumeTimer}>
                      <Text style={styles.primaryButtonText}>Devam Et</Text>
                    </Pressable>
                  ) : (
                    <Pressable style={[styles.primaryButton, { flex: 1, marginBottom: 0, paddingHorizontal: 0 }]} onPress={pauseTimer}>
                      <Text style={styles.primaryButtonText}>Durdur</Text>
                    </Pressable>
                  )}
                  <Pressable style={[styles.secondaryButton, { flex: 1, marginBottom: 0, paddingHorizontal: 0 }]} onPress={handleStop}>
                    <Text style={styles.secondaryButtonText}>Dersi Bitir</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.primaryButton} onPress={startTimer}>
                  <Text style={styles.primaryButtonText}>Derse Başla</Text>
                </Pressable>
              )}

              {todayTotalSeconds === 0 && !isActive ? (
                <View style={styles.verticalCards}>
                  <View style={styles.fullCard}>
                    <View style={styles.fullCardLeft}>
                      <Text style={styles.cardSmallLabelLeft}>OTURUM SAYISI</Text>
                      <Text style={styles.cardValue}>0</Text>
                      <Text style={styles.cardSubValue}>Tamamlanan</Text>
                    </View>
                    <FontAwesome name="history" size={20} color={theme.colors.textSecondary} />
                  </View>
                  <View style={styles.fullCard}>
                    <View style={styles.fullCardLeft}>
                      <Text style={styles.cardSmallLabelLeft}>BUGÜNKÜ HEDEF</Text>
                      <Text style={styles.cardValue}>0<Text style={{ fontSize: 16, color: theme.colors.textSecondary }}> / {formatGoalTime(settings.dailyGoalMinutes)}</Text></Text>
                      <Text style={styles.cardSubValue}>Saat hedefin</Text>
                    </View>
                    <FontAwesome name="bullseye" size={20} color={theme.colors.textSecondary} />
                  </View>
                  <View style={styles.fullCard}>
                    <View style={styles.fullCardLeft}>
                      <Text style={styles.cardSmallLabelLeft}>DERİNLİK SKORU</Text>
                      <Text style={styles.cardValue}>—</Text>
                      <Text style={styles.cardSubValue}>Focus ölçümü</Text>
                    </View>
                    <FontAwesome name="shield" size={20} color={theme.colors.textSecondary} />
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.cardsRow}>
                    <View style={styles.halfCard}>
                      <View style={styles.cardHeaderRow}>
                        <FontAwesome name="clock-o" size={12} color={theme.colors.textSecondary} />
                        <Text style={styles.cardSmallLabelLeft}>BUGÜN TOPLAM</Text>
                      </View>
                      <Text style={styles.cardValue}>{totalHrs > 0 ? `${totalHrs}s ` : ''}{totalMins}dk</Text>
                    </View>

                    <View style={styles.halfCard}>
                      <View style={styles.cardHeaderRow}>
                        <FontAwesome name="refresh" size={12} color={theme.colors.textSecondary} />
                        <Text style={styles.cardSmallLabelLeft}>OTURUMLAR</Text>
                      </View>
                      <Text style={styles.cardValue}>
                        {todaySessionsCount}{"\n"}
                        <Text style={styles.cardSubValueInline}>tamamlandı</Text>
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.quoteText}>
                    {isActive ? '"Zihin sakinleştiğinde, asıl güç ortaya çıkar."' : '"Zorluklar, başarıya giden merdivenlerin basamaklarıdır."'}
                  </Text>
                </>
              )}
            </View>
          )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoSquare: {
    width: 28,
    height: 28,
    backgroundColor: '#FFE4E1',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSquareText: {
    color: '#8B0000',
    fontSize: 8,
    fontWeight: 'bold',
  },
  logoText: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  fireBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  fireIcon: {
    fontSize: 12,
  },
  fireText: {
    color: theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE4E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
    paddingTop: 16,
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  brokenHeaderBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brokenPill: {
    backgroundColor: '#301515',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  brokenPillText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: 'bold',
  },
  greetingBox: {
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 80,
  },
  mainTitle: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  greetingTitle: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtextCenter: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  insightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#26263B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  insightPillText: {
    color: theme.colors.accentLight,
    fontSize: 12,
    fontWeight: 'bold',
  },
  timerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: theme.colors.accentLight,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#26263B',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  secondaryButtonText: {
    color: theme.colors.accentLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 32,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    marginBottom: 32,
  },
  halfCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 16,
    justifyContent: 'space-between',
    minHeight: 110,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardSmallLabelLeft: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardValue: {
    color: theme.colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardSubValueInline: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: 'normal',
  },
  cardSubValue: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  verticalCards: {
    width: '100%',
    gap: 12,
  },
  fullCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  fullCardLeft: {
    flex: 1,
  },
  cardValueBig: {
    color: theme.colors.textPrimary,
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  quoteText: {
    color: '#6C6C80',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
