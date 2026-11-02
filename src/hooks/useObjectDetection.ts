import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { CameraView } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Detection, DetectionState, HistoryEntry } from '../types/detection';
import { translateClass } from '../constants/cocoTranslations';

const MIN_CONFIDENCE = 0.4;
const MAX_DETECTIONS = 5;
const HISTORY_KEY = '@detection_history';
const MAX_HISTORY = 50;

// Lazy-load TF.js modules only on native to avoid bundling react-native-fs on web
let tf: any = null;
let tfRN: any = null;
let cocoSsd: any = null;

async function loadTfModules() {
  if (Platform.OS === 'web') return false;
  try {
    tf = require('@tensorflow/tfjs');
    tfRN = require('@tensorflow/tfjs-react-native');
    cocoSsd = require('@tensorflow-models/coco-ssd');
    return true;
  } catch (e) {
    console.error('Failed to load TF modules:', e);
    return false;
  }
}

export function useObjectDetection() {
  const cameraRef = useRef<CameraView>(null);
  const isDetectingRef = useRef(false);
  const modelRef = useRef<any>(null);

  const [state, setState] = useState<DetectionState>({
    detections: [],
    status: 'loading',
    statusText: 'Inicializando TensorFlow...',
    inferenceTime: 0,
    error: null,
  });

  const initModel = useCallback(async () => {
    if (Platform.OS === 'web') {
      setState(prev => ({
        ...prev,
        status: 'ready',
        statusText: 'Detecção disponível apenas no dispositivo',
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, statusText: 'Inicializando TensorFlow...' }));

      const loaded = await loadTfModules();
      if (!loaded || !tf || !cocoSsd) {
        throw new Error('Módulos TensorFlow não disponíveis');
      }

      await tf.ready();

      setState(prev => ({ ...prev, statusText: 'Baixando modelo COCO-SSD...' }));

      const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      modelRef.current = model;

      setState(prev => ({ ...prev, statusText: 'Preparando detecção...' }));

      await new Promise(r => setTimeout(r, 500));

      setState(prev => ({
        ...prev,
        status: 'ready',
        statusText: 'Aponte a câmera e toque em Detectar',
      }));
    } catch (err: any) {
      console.error('Model init error:', err);
      setState(prev => ({
        ...prev,
        status: 'error',
        statusText: 'Erro ao carregar modelo',
        error: err?.message ?? 'Erro desconhecido',
      }));
    }
  }, []);

  /** Chamado manualmente pelo usuário ao tocar no botão */
  const detectOnce = useCallback(async () => {
    if (
      isDetectingRef.current ||
      !cameraRef.current ||
      !modelRef.current ||
      Platform.OS === 'web' ||
      !tf ||
      !tfRN
    ) {
      return;
    }

    isDetectingRef.current = true;
    const startTime = Date.now();

    try {
      setState(prev => ({ ...prev, status: 'detecting' }));

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.4,
        skipProcessing: true,
        shutterSound: false,
      });

      if (!photo?.base64) {
        isDetectingRef.current = false;
        setState(prev => ({ ...prev, status: 'ready' }));
        return;
      }

      const rawBytes = tf.util.encodeString(photo.base64, 'base64');
      const rawArray = new Uint8Array(rawBytes as ArrayBuffer);
      const imageTensor = tfRN.decodeJpeg(rawArray);

      const predictions = await modelRef.current.detect(imageTensor);
      imageTensor.dispose();

      const elapsed = Date.now() - startTime;

      const filtered: Detection[] = (predictions ?? [])
        .filter((p: any) => (p?.score ?? 0) >= MIN_CONFIDENCE)
        .sort((a: any, b: any) => (b?.score ?? 0) - (a?.score ?? 0))
        .slice(0, MAX_DETECTIONS)
        .map((p: any, i: number) => ({
          id: `${p?.class ?? 'unknown'}-${i}-${Date.now()}`,
          class: p?.class ?? 'unknown',
          classTranslated: translateClass(p?.class ?? ''),
          score: p?.score ?? 0,
          bbox: p?.bbox ?? [0, 0, 0, 0],
        }));

      // Salvar no histórico
      const entry: HistoryEntry = {
        id: `hist-${Date.now()}`,
        timestamp: Date.now(),
        photoUri: photo.uri ?? null,
        detections: filtered,
        found: filtered.length > 0,
      };
      saveToHistory(entry).catch(() => {});

      setState(prev => ({
        ...prev,
        detections: filtered,
        status: 'ready',
        inferenceTime: elapsed / 1000,
        statusText: filtered.length > 0
          ? `${filtered.length} objeto(s) encontrado(s)`
          : 'Nenhum objeto detectado',
      }));
    } catch (err: any) {
      console.warn('Detection error:', err);
      setState(prev => ({ ...prev, status: 'ready', statusText: 'Erro na detecção, tente novamente' }));
    } finally {
      isDetectingRef.current = false;
    }
  }, []);

  const saveToHistory = async (entry: HistoryEntry) => {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      const existing: HistoryEntry[] = data ? JSON.parse(data) : [];
      const updated = [entry, ...existing].slice(0, MAX_HISTORY);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save history:', e);
    }
  };

  return {
    cameraRef,
    state,
    initModel,
    detectOnce,
  };
}
