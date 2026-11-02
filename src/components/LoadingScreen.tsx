import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../constants/theme';

interface LoadingScreenProps {
  statusText: string;
}

export default function LoadingScreen({ statusText }: LoadingScreenProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    );
    shimmerLoop.start();

    return () => shimmerLoop.stop();
  }, []);

  const shimmerWidth = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['20%', '80%'],
  });

  return (
    <LinearGradient
      colors={GRADIENTS.backgroundGradient}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={GRADIENTS.primaryToAccent}
            style={styles.iconBorder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconInner}>
              <View style={styles.lens} />
              <View style={styles.lensDot} />
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.title}>Detector de Objetos</Text>
        <Text style={styles.subtitle}>Carregando modelo de IA...</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <Animated.View style={{ width: shimmerWidth }}>
            <LinearGradient
              colors={GRADIENTS.primaryToAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressBar}
            />
          </Animated.View>
        </View>

        <Text style={styles.statusText}>{statusText ?? ''}</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  iconInner: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lens: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  lensDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  progressContainer: {
    width: 240,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
