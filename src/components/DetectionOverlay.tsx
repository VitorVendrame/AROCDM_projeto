import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';
import type { Detection } from '../types/detection';

interface DetectionOverlayProps {
  detections: Detection[];
  cameraWidth: number;
  cameraHeight: number;
}

export default function DetectionOverlay({
  detections,
  cameraWidth,
  cameraHeight,
}: DetectionOverlayProps) {
  if ((detections?.length ?? 0) === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {(detections ?? []).map((det) => {
        const [x, y, w, h] = det?.bbox ?? [0, 0, 0, 0];
        // bbox is relative to image dims, scale to camera view
        const scaleX = cameraWidth > 0 ? cameraWidth / 640 : 1;
        const scaleY = cameraHeight > 0 ? cameraHeight / 480 : 1;

        const left = x * scaleX;
        const top = y * scaleY;
        const boxW = w * scaleX;
        const boxH = h * scaleY;

        return (
          <View key={det?.id ?? Math.random().toString()}>
            {/* Bounding box */}
            <View
              style={[
                styles.boundingBox,
                {
                  left,
                  top,
                  width: boxW,
                  height: boxH,
                },
              ]}
            />
            {/* Label badge */}
            <View
              style={[
                styles.badge,
                {
                  left: left + boxW / 2 - 60,
                  top: Math.max(top - 28, 4),
                },
              ]}
            >
              <Text style={styles.badgeText} numberOfLines={1}>
                {det?.classTranslated ?? 'Objeto'}
                {'  '}
                <Text style={styles.badgeScore}>
                  {Math.round((det?.score ?? 0) * 100)}%
                </Text>
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  boundingBox: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.5)',
    borderRadius: 8,
  },
  badge: {
    position: 'absolute',
    backgroundColor: COLORS.badgeBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  badgeScore: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '400',
  },
});
