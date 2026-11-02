import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../src/constants/theme";
import type { HistoryEntry } from "../src/types/detection";

const HISTORY_KEY = "@detection_history";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      if (data) {
        setHistory(JSON.parse(data));
      }
    } catch (e) {
      console.warn("Failed to load history:", e);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
      setHistory([]);
    } catch (e) {
      console.warn("Failed to clear history:", e);
    }
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const hour = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month} ${hour}:${min}`;
  };

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons
          name={item.found ? "check-circle" : "close-circle"}
          size={20}
          color={item.found ? COLORS.success : COLORS.error}
        />
        <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
      </View>
      {item.found ? (
        <View style={styles.detectionsList}>
          {item.detections.map((det, i) => (
            <View key={`${det.class}-${i}`} style={styles.detRow}>
              <Text style={styles.detName}>{det.classTranslated}</Text>
              <Text style={styles.detScore}>
                {Math.round(det.score * 100)}%
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.notFoundText}>Nenhum objeto detectado</Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.white}
          />
        </Pressable>
        <Text style={styles.title}>Histórico</Text>
        {history.length > 0 && (
          <Pressable
            onPress={clearHistory}
            style={({ pressed }) => [
              styles.clearBtn,
              pressed && { opacity: 0.6 },
            ]}
            accessibilityLabel="Limpar histórico"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="delete-outline"
              size={22}
              color={COLORS.error}
            />
          </Pressable>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="history"
            size={64}
            color={COLORS.textSecondary}
          />
          <Text style={styles.emptyText}>
            Nenhuma detecção registrada ainda
          </Text>
          <Text style={styles.emptySubtext}>
            Use o botão Detectar na câmera para começar
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 16 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
  },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(239,68,68,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardDate: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  detectionsList: {
    gap: 6,
  },
  detRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  detScore: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  notFoundText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
