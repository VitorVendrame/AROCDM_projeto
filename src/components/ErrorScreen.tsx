import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../constants/theme';

interface ErrorScreenProps {
  type: 'camera' | 'model';
  onRetry: () => void;
  onOpenSettings?: () => void;
}

export default function ErrorScreen({ type, onRetry, onOpenSettings }: ErrorScreenProps) {
  const isCamera = type === 'camera';

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={isCamera ? 'camera-off' : 'alert-circle-outline'}
        size={64}
        color={isCamera ? COLORS.error : COLORS.warning}
      />
      <Text style={styles.title}>
        {isCamera ? 'Acesso à Câmera Necessário' : 'Erro ao Carregar Modelo'}
      </Text>
      <Text style={styles.body}>
        {isCamera
          ? 'Para detectar objetos, precisamos de acesso à sua câmera. Por favor, habilite nas configurações do dispositivo.'
          : 'Não foi possível carregar o modelo de detecção. Verifique sua conexão e tente novamente.'}
      </Text>

      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [styles.buttonWrapper, pressed && styles.buttonPressed]}
        accessibilityLabel="Tentar novamente"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={GRADIENTS.primaryToAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Tentar Novamente</Text>
        </LinearGradient>
      </Pressable>

      {isCamera && onOpenSettings && (
        <Pressable
          onPress={onOpenSettings}
          style={({ pressed }) => [styles.outlineButton, pressed && styles.buttonPressed]}
          accessibilityLabel="Abrir configurações do dispositivo"
          accessibilityRole="button"
        >
          <Text style={styles.outlineButtonText}>Abrir Configurações</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 24,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 300,
    lineHeight: 24,
  },
  buttonWrapper: {
    marginTop: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});
