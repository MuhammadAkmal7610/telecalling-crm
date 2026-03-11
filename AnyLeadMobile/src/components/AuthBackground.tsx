import React from 'react';
import { StyleSheet, View, Dimensions, useColorScheme } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle, Pattern, Rect } from 'react-native-svg';
import { colors } from '../theme/theme';

const { width, height } = Dimensions.get('window');

interface AuthBackgroundProps {
    children: React.ReactNode;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({ children }) => {
    const isDark = useColorScheme() === 'dark';

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                    {/* Light Mode Gradients */}
                    <RadialGradient id="gradTopRight" cx="100%" cy="0%" r="100%">
                        <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.08} />
                        <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
                    </RadialGradient>

                    <RadialGradient id="gradTopLeft" cx="0%" cy="0%" r="50%">
                        <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.03} />
                        <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
                    </RadialGradient>

                    <Pattern id="dotPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                        <Circle cx="1.5" cy="1.5" r="1.5" fill={colors.primary} fillOpacity={0.04} />
                    </Pattern>

                    {/* Dark Mode Gradients */}
                    <RadialGradient id="darkTopStart" cx="0%" cy="0%" r="120%">
                        <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.15} />
                        <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
                    </RadialGradient>
                    <RadialGradient id="darkBottomEnd" cx="100%" cy="100%" r="100%">
                        <Stop offset="0%" stopColor={colors.secondary} stopOpacity={0.12} />
                        <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
                    </RadialGradient>
                    <RadialGradient id="darkMiddle" cx="80%" cy="30%" r="60%">
                        <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.05} />
                        <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
                    </RadialGradient>
                </Defs>

                {isDark ? (
                    <>
                        <Circle cx="0" cy="0" r={width * 1.2} fill="url(#darkTopStart)" />
                        <Circle cx={width} cy={height} r={width * 1.0} fill="url(#darkBottomEnd)" />
                        <Circle cx={width * 0.8} cy={height * 0.3} r={width * 0.6} fill="url(#darkMiddle)" />
                    </>
                ) : (
                    <>
                        <Rect x="0" y="0" width="100%" height="100%" fill="url(#dotPattern)" />
                        <Circle cx={width} cy={0} r={width * 1.0} fill="url(#gradTopRight)" />
                        <Circle cx={0} cy={height * 0.95} r={width * 0.7} fill={colors.secondary} fillOpacity={0.05} />
                        <Circle cx={0} cy={0} r={width * 0.5} fill="url(#gradTopLeft)" />
                    </>
                )}
            </Svg>
            <View style={StyleSheet.absoluteFill}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
