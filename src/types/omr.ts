import { QuestionType } from './index';

export interface Point2D {
  x: number;
  y: number;
}

export interface BubbleCoordinate {
  questionNumber: number;
  questionLabel: string;
  optionIndex: number;
  optionLabel: string; // 'A' | 'B' | 'C' | 'D' | '1' | '0'
  center: Point2D;
  radius: number;
  type: QuestionType;
}

export interface QuestionRowCoordinate {
  questionNumber: number;
  questionLabel: string;
  type: QuestionType;
  options: BubbleCoordinate[];
  // Qatorni qirqib olish (crop) uchun chegara to'rtburchagi
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OmrTemplateDefinition {
  version: number;
  questionCount: number; // 20 yoki 30
  canvasWidth: number;   // masalan 1200
  canvasHeight: number;  // masalan 1697 (A4 nisbati)
  cornerMarkers: {
    topLeft: Point2D;
    topRight: Point2D;
    bottomRight: Point2D;
    bottomLeft: Point2D;
    markerSize: number;
  };
  orientationMarker: {
    center: Point2D;
    radius: number;
  };
  qrBox: {
    x: number;
    y: number;
    size: number;
  };
  questionRows: QuestionRowCoordinate[];
}

export interface BubbleAnalysisResult {
  optionLabel: string;
  darkness: number; // 0.0 - 1.0
  isMarked: boolean;
}

export interface QuestionDetectionResult {
  questionNumber: number;
  questionLabel: string;
  type: QuestionType;
  detectedAnswer: string; // 'A' | 'B' | 'C' | 'D' | '1' | '0' | '-' (bo'sh) | '?' (shubhali)
  isAmbiguous: boolean;   // Ikkita belgi yoki o'chirilgan iz
  isUncertain: boolean;   // Xira belgi
  isOmitted: boolean;     // Bo'sh qoldirilgan
  needsReview: boolean;   // O'qituvchi tekshirishi kerakmi
  reviewReason?: string;
  bubbles: BubbleAnalysisResult[];
  // O'sha qatorning asl to'g'rilangan suratdan olingan kesmasi (data URL rasm)
  cropDataUrl?: string;
}

export interface OmrScanResult {
  success: boolean;
  errorMessage?: string;
  sessionId?: string;
  studentId?: string;
  studentName?: string;
  templateVersion: number;
  questionCount: number;
  detections: QuestionDetectionResult[];
  reviewNeededCount: number;
  alignedImageCanvas?: HTMLCanvasElement;
}

export interface OmrQrPayload {
  app: 'zehnora_omr';
  v: number;
  sid: string; // Session ID
  qc: number;  // Question count
  stId?: string;
  stName?: string;
  stClass?: string;
}

export interface ExportedOmrSubmission {
  sessionId: string;
  studentId: string;
  studentName: string;
  className?: string;
  scannedAt: string;
  answers: (string | null)[];
}
