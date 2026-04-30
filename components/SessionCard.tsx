import { theme } from '@/constants/theme';
import { Session } from '@/utils/storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
    session: Session;
    isLongest?: boolean;
}

const SUBJECTS = ["Matematik", "Fizik", "Biyoloji", "Tarih", "Edebiyat"];
const ICONS = ["calculator", "flask", "leaf", "book", "pencil"];

export default function SessionCard({ session, isLongest }: Props) {
    // Use session ID to rudimentarily pick a deterministic random subject
    const idHash = session.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const subjectName = SUBJECTS[idHash % SUBJECTS.length];
    const iconName = ICONS[idHash % ICONS.length] as any;

    const hrs = Math.floor(session.duration / 3600);
    const mins = Math.floor((session.duration % 3600) / 60);
    const durationStr = hrs > 0 ? `${hrs}s ${mins}dk` : `${mins} dk`;

    return (
        <View style={[styles.card, isLongest && styles.cardActive]}>
            <View style={styles.iconCircle}>
                <FontAwesome name={iconName} size={14} color={isLongest ? theme.colors.accentLight : theme.colors.textSecondary} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{subjectName}</Text>
                {isLongest && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>EN UZUN</Text>
                    </View>
                )}
            </View>
            <View style={styles.rightContent}>
                <Text style={[styles.durationTitle, isLongest && styles.durationTitleActive]}>{durationStr}</Text>
                <Text style={styles.durationSub}>TAMAMLANDI</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121215',
        padding: 16,
        borderRadius: 32, // More pill-like
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    cardActive: {
        borderColor: '#3F3B7D', // slight purple border
        backgroundColor: '#161622',
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#26262B',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    title: {
        color: theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    badge: {
        backgroundColor: '#26263B',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    badgeText: {
        color: theme.colors.accentLight,
        fontSize: 9,
        fontWeight: 'bold',
    },
    rightContent: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    durationTitle: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    durationTitleActive: {
        color: theme.colors.accentLight,
    },
    durationSub: {
        color: '#666',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginTop: 4,
    },
});
