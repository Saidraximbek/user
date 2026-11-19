import {
  OmrTemplateDefinition,
  QuestionRowCoordinate,
  BubbleCoordinate,
  Point2D,
} from '../types/omr';
import { QuestionDef } from '../types';

export const OMR_CANVAS_WIDTH = 1200;
export const OMR_CANVAS_HEIGHT = 1697; // A4 proporstiyasi: 1200 * 1.4142

// 4 burchak tayanch belgilari (Fiducial markers)
export const OMR_CORNER_MARKERS = {
  topLeft: { x: 80, y: 80 },
  topRight: { x: 1120, y: 80 },
  bottomRight: { x: 1120, y: 1617 },
  bottomLeft: { x: 80, y: 1617 },
  markerSize: 50,
};

// Yo'nalishni ajratish belgisi (Top-Left marker yonida maxsus qora belgi)
export const OMR_ORIENTATION_MARKER = {
  center: { x: 160, y: 80 },
  radius: 16,
};

// QR kod joyi (Yuqori o'ngda)
export const OMR_QR_BOX = {
  x: 940,
  y: 150,
  size: 150,
};

/**
 * Berilgan savollar soni va ro'yxatiga asosan yagona OMR shablon koordinatalarini hisoblash
 * 20 va 30 savollik testlar uchun optimal 2 ustunli joylashuv
 */
export function getOmrTemplate(questions: QuestionDef[]): OmrTemplateDefinition {
  const count = questions.length;
  const is20 = count <= 20;

  // Savollarni 2 ustunga taqsimlaymiz
  const half = Math.ceil(count / 2);
  const col1Questions = questions.slice(0, half);
  const col2Questions = questions.slice(half);

  const startY = 460; // Titul yuqori ko'rsatmalari va QR koddan keyingi qator
  const availableHeight = 1530 - startY;
  const rowHeight = Math.min(65, Math.floor(availableHeight / Math.max(half, 10)));

  const col1X = 130;
  const col2X = 660;
  const bubbleRadius = 14;

  const questionRows: QuestionRowCoordinate[] = [];

  const createRow = (q: QuestionDef, colX: number, rIdx: number): QuestionRowCoordinate => {
    const cy = startY + rIdx * rowHeight + Math.floor(rowHeight / 2);
    const options: BubbleCoordinate[] = [];
    const isBinary = q.type === 'binary';
    const optLabels = isBinary ? ['1', '0'] : ['A', 'B', 'C', 'D'];

    // Har bir variant uchun harf/raqam yorlig'i va yonida bo'sh doira
    const optSpacing = isBinary ? 80 : 64;
    const optStartX = colX + 110;

    optLabels.forEach((label, oIdx) => {
      const bubbleCenterX = optStartX + oIdx * optSpacing + 28;
      const center: Point2D = { x: bubbleCenterX, y: cy };

      options.push({
        questionNumber: q.number,
        questionLabel: q.label,
        optionIndex: oIdx,
        optionLabel: label,
        center,
        radius: bubbleRadius,
        type: q.type,
      });
    });

    const boundingBox = {
      x: colX - 10,
      y: cy - Math.floor(rowHeight / 2),
      width: 480,
      height: rowHeight,
    };

    return {
      questionNumber: q.number,
      questionLabel: q.label,
      type: q.type,
      options,
      boundingBox,
    };
  };

  col1Questions.forEach((q, idx) => {
    questionRows.push(createRow(q, col1X, idx));
  });

  col2Questions.forEach((q, idx) => {
    questionRows.push(createRow(q, col2X, idx));
  });

  // Savol raqami bo'yicha saralash
  questionRows.sort((a, b) => a.questionNumber - b.questionNumber);

  return {
    version: 1,
    questionCount: count,
    canvasWidth: OMR_CANVAS_WIDTH,
    canvasHeight: OMR_CANVAS_HEIGHT,
    cornerMarkers: OMR_CORNER_MARKERS,
    orientationMarker: OMR_ORIENTATION_MARKER,
    qrBox: OMR_QR_BOX,
    questionRows,
  };
}
