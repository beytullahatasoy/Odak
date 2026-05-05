import { theme } from '@/constants/theme';
import { useSessionStore } from '@/store/sessionStore';
import { Session } from '@/utils/storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
    session: Session;
    isLongest?: boolean;
}

export default function SessionCard({ session, isLongest }: Props) {
    const updateSessionTitle = useSessionStore(state => state.updateSessionTitle);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(session.title || '1. Oturum');

    const hrs = Math.floor(session.duration / 3600);
    const mins = Math.floor((session.duration % 3600) / 60);
    const durationStr = hrs > 0 ? `${hrs}s ${mins}dk` : `${mins} dk`;

    const handleSave = () => {
        setIsEditing(false);
        if (title.trim() !== '') {
            updateSessionTitle(session.id, title);
        } else {
            setTitle(session.title || '1. Oturum');
        }
    };

    return (
        <View style={[styles.card, isLongest && styles.cardActive]}>
            <View style={styles.iconCircle}>
                <FontAwesome name="book" size={14} color={isLongest ? theme.colors.accentLight : theme.colors.textSecondary} />
            </View>
            <View style={styles.content}>
                {isEditing ? (
                    <TextInput
                        style={styles.titleInput}
                        value={title}
                        onChangeText={setTitle}
                        onBlur={handleSave}
                        onSubmitEditing={handleSave}
                        autoFocus
                    />
                ) : (
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{session.title || '1. Oturum'}</Text>
                        <Pressable onPress={() => setIsEditing(true)} style={styles.editIcon}>
                            <FontAwesome name="pencil" size={12} color={theme.colors.textSecondary} />
                        </Pressable>
                    </View>
                )}
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
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    title: {
        color: theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    editIcon: {
        padding: 4,
    },
    titleInput: {
        color: theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.accentLight,
        padding: 0,
        minWidth: 100,
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
