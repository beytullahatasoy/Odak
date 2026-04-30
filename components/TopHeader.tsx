import { theme } from '@/constants/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TopHeaderProps {
    showStreak?: boolean;
    currentStreak?: number;
}

export default function TopHeader({ showStreak = false, currentStreak = 0 }: TopHeaderProps) {
    return (
        <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
                <View style={styles.logoSquare}>
                    <Text style={styles.logoSquareText}>ODAK</Text>
                </View>
                <Text style={styles.logoText}>ODAK</Text>
            </View>

            {showStreak && currentStreak > 0 && (
                <View style={styles.fireBadge}>
                    <Text style={styles.fireIcon}>🔥</Text>
                    <Text style={styles.fireText}>{currentStreak}</Text>
                </View>
            )}

            <View style={styles.profileCircle}>
                <FontAwesome name="user" size={16} color={theme.colors.accent} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
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
        borderRadius: 8,
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
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 2,
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
        fontSize: 12,
        fontWeight: 'bold',
    },
    profileCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFE4E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
