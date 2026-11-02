export interface Detection {
  id: string;
  class: string;
  classTranslated: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export type DetectionStatus = 'loading' | 'ready' | 'detecting' | 'error';

export interface DetectionState {
  detections: Detection[];
  status: DetectionStatus;
  statusText: string;
  inferenceTime: number;
  error: string | null;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  photoUri: string | null;
  detections: Detection[];
  found: boolean;
}
