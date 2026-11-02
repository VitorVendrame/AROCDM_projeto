// @ts-nocheck
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  Linking,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { COLORS, GRADIENTS } from "../src/constants/theme";
import { useObjectDetection } from "../src/hooks/useObjectDetection";
import LoadingScreen from "../src/components/LoadingScreen";
import ErrorScreen from "../src/components/ErrorScreen";
import DetectionOverlay from "../src/components/DetectionOverlay";
import DetectionResult from "../src/components/DetectionResult";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [cameraReady, setCameraReady] = useState(false);

  const { cameraRef, state, initModel, detectOnce } = useObjectDetection();

  // Init model on mount
  useEffect(() => {
    initModel();
  }, [initModel]);

  const handleFlipCamera = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light)?.catch?.(
        () => {},
      );
    }
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  }, []);

  const handleRetryPermission = useCallback(() => {
    requestPermission?.();
  }, [requestPermission]);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings?.()?.catch?.(() => {});
  }, []);

  const handleRetryModel = useCallback(() => {
    initModel();
  }, [initModel]);

  const handleDetect = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Medium)?.catch?.(
        () => {},
      );
    }
    detectOnce();
  }, [detectOnce]);

  const isDetecting = state?.status === "detecting";

  // Loading state
  if (state?.status === "loading") {
    return <LoadingScreen statusText={state?.statusText ?? "Carregando..."} />;
  }

  // Model error
  if (state?.status === "error" && !permission?.granted) {
    return <ErrorScreen type="model" onRetry={handleRetryModel} />;
  }

  // Permission not yet determined
  if (!permission?.granted) {
    if (permission?.canAskAgain === false) {
      return (
        <ErrorScreen
          type="camera"
          onRetry={handleRetryPermission}
          onOpenSettings={handleOpenSettings}
        />
      );
    }
    // Ask for permission
    return (
      <View style={styles.permissionContainer}>
        <MaterialCommunityIcons
          name="camera"
          size={64}
          color={COLORS.primary}
        />
        <Text style={styles.permTitle}>Detector de Objetos</Text>
        <Text style={styles.permBody}>
          Precisamos de acesso à câmera para detectar objetos em tempo real.
        </Text>
        <Pressable
          onPress={handleRetryPermission}
          style={({ pressed }) => [
            styles.permButtonWrap,
            pressed && { opacity: 0.8 },
          ]}
          accessibilityLabel="Permitir acesso à câmera"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={GRADIENTS.primaryToAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.permButton}
          >
            <Text style={styles.permButtonText}>Permitir Câmera</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  // Model error after permission granted
  if (state?.status === "error") {
    return <ErrorScreen type="model" onRetry={handleRetryModel} />;
  }

  const detections = state?.detections ?? [];
  const detCount = detections?.length ?? 0;
  const statusColor = isDetecting
    ? COLORS.warning
    : state?.status === "ready"
      ? COLORS.success
      : COLORS.error;

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        onCameraReady={() => setCameraReady(true)}
      />

      {/* Detection overlays (bounding boxes) */}
      <DetectionOverlay
        detections={detections}
        cameraWidth={SCREEN_WIDTH}
        cameraHeight={SCREEN_HEIGHT}
      />

      {/* Detection results panel — nomes grandes e visíveis */}
      <DetectionResult detections={detections} />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.topTitle}>Detector de Objetos</Text>
        <Pressable
          onPress={handleFlipCamera}
          style={({ pressed }) => [
            styles.flipButton,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel="Alternar entre câmera frontal e traseira"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="camera-flip-outline"
            size={22}
            color={COLORS.white}
          />
        </Pressable>
      </View>

      {/* Status text */}
      <View style={styles.statusBanner}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={styles.statusLabel}>{state?.statusText ?? ""}</Text>
      </View>

      {/* Bottom bar — 3 botões: Lista | Detectar | Histórico */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {/* Lista de objetos */}
        <Pressable
          onPress={() => router.push("/objects-list")}
          style={({ pressed }) => [
            styles.sideButton,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel="Ver lista de objetos reconhecíveis"
          accessibilityRole="button"
        >
          <View style={styles.sideButtonCircle}>
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={22}
              color={COLORS.white}
            />
          </View>
          <Text style={styles.sideButtonLabel}>Objetos</Text>
        </Pressable>

        {/* Detect button */}
        <Pressable
          onPress={handleDetect}
          disabled={isDetecting || !cameraReady}
          style={({ pressed }) => [
            styles.detectButtonOuter,
            pressed && { transform: [{ scale: 0.93 }] },
            (isDetecting || !cameraReady) && { opacity: 0.5 },
          ]}
          accessibilityLabel="Detectar objetos"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={GRADIENTS.primaryToAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.detectGradient}
          >
            <MaterialCommunityIcons
              name={isDetecting ? "loading" : "magnify-scan"}
              size={32}
              color={COLORS.white}
            />
          </LinearGradient>
          <Text style={styles.detectLabel}>
            {isDetecting ? "Analisando..." : "Detectar"}
          </Text>
        </Pressable>

        {/* Histórico */}
        <Pressable
          onPress={() => router.push("/history")}
          style={({ pressed }) => [
            styles.sideButton,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel="Ver histórico de detecções"
          accessibilityRole="button"
        >
          <View style={styles.sideButtonCircle}>
            <MaterialCommunityIcons
              name="history"
              size={22}
              color={COLORS.white}
            />
          </View>
          <Text style={styles.sideButtonLabel}>Histórico</Text>
        </Pressable>
      </View>

      {/* Web fallback message */}
      {Platform.OS === "web" && (
        <View style={styles.webBanner}>
          <MaterialCommunityIcons
            name="information"
            size={18}
            color={COLORS.warning}
          />
          <Text style={styles.webBannerText}>
            A detecção de objetos funciona apenas no aplicativo instalado no
            dispositivo.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: COLORS.glassBg,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBanner: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(10,10,10,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: COLORS.glassBg,
  },
  sideButton: {
    alignItems: "center",
    width: 64,
  },
  sideButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  sideButtonLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  // Detect button
  detectButtonOuter: {
    alignItems: "center",
  },
  detectGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  detectLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: "600",
  },
  // Permission screen
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  permTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  permBody: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  permButtonWrap: {
    marginTop: 32,
    borderRadius: 12,
    overflow: "hidden",
  },
  permButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  // Web banner
  webBanner: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(10,10,10,0.85)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    maxWidth: 340,
  },
  webBannerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
});
