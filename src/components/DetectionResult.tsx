import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import type { Detection } from '../types/detection';

interface DetectionResultProps {
  detections: Detection[];
}

export default function DetectionResult({ detections }: DetectionResultProps) {
  if ((detections?.length ?? 0) === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
        <Text style={styles.headerText}>
          {detections.length} {detections.length === 1 ? 'objeto encontrado' : 'objetos encontrados'}
        </Text>
      </View>
      {detections.map((det) => (
        <View key={det.id} style={styles.row}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{det.classTranslated}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreBar, { width: `${Math.round(det.score * 100)}%` }]} />
            <Text style={styles.score}>{Math.round(det.score * 100)}%</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  scoreContainer: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreBar: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  score: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    width: 36,
    textAlign: 'right',
  },
});
