import { theme } from '@/constants/theme';
import { useSettingsStore } from '@/store/settingsStore';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

interface GoalSheetProps {
    visible: boolean;
    onClose: () => void;
}

export default function GoalSheet({ visible, onClose }: GoalSheetProps) {
    const { settings, updateSettings } = useSettingsStore();

    // Track local selection
    const [selectedHours, setSelectedHours] = useState<number | null>(() => {
        // try to match with preset
        const hrs = settings.dailyGoalMinutes / 60;
        if ([1, 2, 3, 4, 5].includes(hrs)) return hrs;
        return null;
    });

    const [customMinutes, setCustomMinutes] = useState(
        selectedHours ? '' : settings.dailyGoalMinutes.toString()
    );
    const [inputType, setInputType] = useState<'dakika' | 'saat'>('dakika');

    const presets = [1, 2, 3, 4, 5];

    const handleSelectPreset = (hrs: number) => {
        setSelectedHours(hrs);
        setCustomMinutes('');
    };

    const handleCustomChange = (val: string) => {
        setCustomMinutes(val);
        setSelectedHours(null);
    };

    const handleSave = () => {
        let finalMins = settings.dailyGoalMinutes;
        if (selectedHours !== null) {
            finalMins = selectedHours * 60;
        } else if (customMinutes) {
            const parsed = parseInt(customMinutes, 10);
            if (!isNaN(parsed) && parsed > 0) {
                finalMins = inputType === 'saat' ? parsed * 60 : parsed;
            }
        }
        updateSettings({ dailyGoalMinutes: finalMins });
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.containerPointerBox}
                pointerEvents="box-none"
            >
                <View style={styles.sheet}>
                    <View style={styles.handle} />

                    <Text style={styles.title}>Günlük hedefini belirle</Text>
                    <Text style={styles.subtitle}>Bugün ne kadar odaklanmak istiyorsun?</Text>

                    {/* Radio Group */}
                    <View style={styles.presetsContainer}>
                        {presets.map(hrs => {
                            const isSelected = selectedHours === hrs;
                            return (
                                <Pressable
                                    key={hrs}
                                    style={[styles.presetRow, isSelected && styles.presetRowActive]}
                                    onPress={() => handleSelectPreset(hrs)}
                                >
                                    <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                                        {hrs} saat
                                    </Text>
                                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>

                    <Text style={styles.sectionLabel}>VEYA ÖZEL SÜRE</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            keyboardType="number-pad"
                            value={customMinutes}
                            onChangeText={handleCustomChange}
                            placeholder="Süre girin..."
                            placeholderTextColor={theme.colors.textSecondary}
                        />
                        <Pressable onPress={() => setInputType(prev => prev === 'dakika' ? 'saat' : 'dakika')}>
                            <Text style={[styles.inputSuffix, {color: theme.colors.accentLight}]}>
                                {inputType === 'dakika' ? 'DAKİKA' : 'SAAT'} 🔁
                            </Text>
                        </Pressable>
                    </View>

                    {/* Success Pill Component Mock */}
                    <View style={styles.statusPill}>
                        <Text style={styles.statusPillText}>Günlük hedefin güncellendi 🎯</Text>
                    </View>

                    <Pressable style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Kaydet</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    containerPointerBox: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#15151A',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
    },
    handle: {
        width: 48,
        height: 4,
        backgroundColor: '#333',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    title: {
        color: theme.colors.textPrimary,
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    presetsContainer: {
        marginBottom: 24,
        gap: 8,
    },
    presetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1A1A1F',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    presetRowActive: {
        borderColor: theme.colors.accentLight,
        backgroundColor: '#26263B',
    },
    presetText: {
        color: theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    presetTextActive: {
        color: theme.colors.accentLight,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleActive: {
        borderColor: theme.colors.accentLight,
    },
    radioInner: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: theme.colors.accentLight,
    },
    sectionLabel: {
        color: theme.colors.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1F',
        borderRadius: 24,
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    input: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontSize: 16,
        paddingVertical: 18,
    },
    inputSuffix: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusPill: {
        backgroundColor: '#26263B',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignSelf: 'center',
        marginBottom: 24,
    },
    statusPillText: {
        color: theme.colors.accentLight,
        fontSize: 12,
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: theme.colors.accentLight,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
