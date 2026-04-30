import { theme } from '@/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StreakBannerProps {
    currentStreak: number;
    isBroken: boolean;
}

export default function StreakBanner({ currentStreak, isBroken }: StreakBannerProps) {
    if (isBroken) {
        return (
            <View style={[styles.container, styles.brokenContainer]}>
                <FontAwesome name="exclamation-circle" size={16} color={theme.colors.background} />
                <Text style={styles.brokenText}>Seri Bozuldu. Yeniden başlamaya ne dersin?</Text>
            </View>
        );
    }

    if (currentStreak > 0) {
        return (
            <View style={[styles.container, styles.activeContainer]}>
                <FontAwesome name="fire" size={16} color={theme.colors.background} />
                <Text style={styles.activeText}>{currentStreak} Günlük Seri Devam Ediyor! 🔥</Text>
            </View>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.xl,
        gap: 8,
    },
    brokenContainer: {
        backgroundColor: theme.colors.danger,
    },
    brokenText: {
        color: theme.colors.background,
        fontWeight: 'bold',
    },
    activeContainer: {
        backgroundColor: theme.colors.accentLight,
    },
    activeText: {
        color: theme.colors.background,
        fontWeight: 'bold',
    },
});
