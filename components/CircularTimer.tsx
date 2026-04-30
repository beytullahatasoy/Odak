import { theme } from '@/constants/theme';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, { SharedValue, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width } = Dimensions.get('window');
const size = width * 0.7; // 70% of screen width
const strokeWidth = 16;
const radius = (size - strokeWidth) / 2;
const circumference = radius * 2 * Math.PI;

interface CircularTimerProps {
    progress: SharedValue<number>;
    timeText: string;
    isActive: boolean;
    topLabel?: string;
    bottomLabel?: string;
}

export default function CircularTimer({ progress, timeText, isActive, topLabel, bottomLabel }: CircularTimerProps) {
    const animatedProps = useAnimatedProps(() => {
        // Determine offset based on progress (0 to 1)
        const offset = circumference - (circumference * progress.value);
        return {
            strokeDashoffset: offset,
        };
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                {/* Background track - Much thinner in design */}
                <Circle
                    stroke={'#1A1A1F'}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={4}
                />
                {/* Animated Progress - Thicker */}
                <AnimatedCircle
                    stroke={theme.colors.accentLight}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={12}
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    originX={size / 2}
                    originY={size / 2}
                    rotation="-90"
                />
            </Svg>
            <View style={styles.absoluteCenter}>
                {!!topLabel && <Text style={styles.topText}>{topLabel}</Text>}
                <Text style={styles.timeText}>{timeText}</Text>
                {!!bottomLabel && <Text style={styles.focusText}>{bottomLabel}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    absoluteCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topText: {
        color: theme.colors.textSecondary,
        fontSize: 10,
        letterSpacing: 2,
        marginBottom: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    timeText: {
        color: theme.colors.textPrimary,
        fontSize: 56,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
    },
    focusText: {
        color: '#6C6C80',
        fontSize: 10,
        letterSpacing: 2,
        marginTop: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});
