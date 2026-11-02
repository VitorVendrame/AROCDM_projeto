import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  PressableStateCallbackType,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/theme';
import { COCO_TRANSLATIONS } from '../src/constants/cocoTranslations';

interface ObjectItem {
  key: string;
  english: string;
  portuguese: string;
}

const OBJECTS_LIST: ObjectItem[] = Object.entries(COCO_TRANSLATIONS)
  .map(([eng, pt]) => ({
    key: eng,
    english: eng,
    portuguese: pt,
  }))
  .sort((a, b) => a.portuguese.localeCompare(b.portuguese, 'pt-BR'));

export default function ObjectsListScreen() {
  const insets = useSafeAreaInsets();

  const renderItem = ({ item, index }: { item: ObjectItem; index: number }) => (
    <View style={styles.row}>
      <Text style={styles.number}>{index + 1}</Text>
      <View style={styles.nameCol}>
        <Text style={styles.ptName}>{item.portuguese}</Text>
        <Text style={styles.enName}>{item.english}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }: PressableStateCallbackType) => [
            styles.backBtn,
            pressed && { opacity: 0.6 },
          ]}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <View style={styles.headerTextCol}>
          <Text style={styles.title}>Objetos Reconhecíveis</Text>
          <Text style={styles.subtitle}>{OBJECTS_LIST.length} objetos no modelo COCO-SSD</Text>
        </View>
      </View>

      <FlatList
        data={OBJECTS_LIST}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: COLORS.white,
    fontSize: 32,
    lineHeight: 32,
    marginTop: -2,
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 16,
  },
  number: {
    width: 28,
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  nameCol: {
    flex: 1,
  },
  ptName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  enName: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
