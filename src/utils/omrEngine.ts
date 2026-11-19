import jsQR from 'jsqr';
import {
  OmrScanResult,
  QuestionDetectionResult,
  BubbleAnalysisResult,
  Point2D,
  OmrQrPayload,
} from '../types/omr';
import { QuestionDef } from '../types';
import {
  getOmrTemplate,
  OMR_CANVAS_WIDTH,
  OMR_CANVAS_HEIGHT,
} from './omrTemplate';

/**
 * 4 nuqta bo'yicha perspektiv transformatsiya matritsasini hisoblash
 * Source (4 nuqta) -> Destination (4 nuqta)
 */
function getPerspectiveTransform(src: Point2D[], dst: Point2D[]): number[] {
  // 8 noma'lumli chiziqli tenglamalar sistemasi (Gaussian elimination)
  const A: number[][] = [];
  const B: number[] = [];

  for (let i = 0; i < 4; i++) {
    const sx = src[i].x;
    const sy = src[i].y;
    const dx = dst[i].x;
    const dy = dst[i].y;

    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    B.push(dx);
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    B.push(dy);
  }

  // Gauss elimination
  const n = 8;
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }
    const tmpA = A[i];
    A[i] = A[maxRow];
    A[maxRow] = tmpA;
    const tmpB = B[i];
    B[i] = B[maxRow];
    B[maxRow] = tmpB;

    const pivot = A[i][i];
    if (Math.abs(pivot) < 1e-10) continue;

    for (let j = i; j < n; j++) {
      A[i][j] /= pivot;
    }
    B[i] /= pivot;

    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const factor = A[k][i];
      for (let j = i; j < n; j++) {
        A[k][j] -= factor * A[i][j];
      }
      B[k] -= factor * B[i];
    }
  }

  // Matritsa [h0, h1, h2, h3, h4, h5, h6, h7, 1]
  return [B[0], B[1], B[2], B[3], B[4], B[5], B[6], B[7], 1.0];
}

/**
 * Suratni to'g'rilash (Perspective Warp)
 */
function warpPerspective(
  srcCanvas: HTMLCanvasElement,
  srcCorners: Point2D[],
  dstCorners: Point2D[],
  dstWidth: number,
  dstHeight: number
): HTMLCanvasElement {
  const dstCanvas = document.createElement('canvas');
  dstCanvas.width = dstWidth;
  dstCanvas.height = dstHeight;
  const dstCtx = dstCanvas.getContext('2d')!;

  const srcCtx = srcCanvas.getContext('2d')!;
  const srcWidth = srcCanvas.width;
  const srcHeight = srcCanvas.height;

  // Teskari matritsa (Dst -> Src) har bir manzil pikselini manbadan olish uchun
  const invH = getPerspectiveTransform(dstCorners, srcCorners);

  const srcImgData = srcCtx.getImageData(0, 0, srcWidth, srcHeight);
  const srcData = srcImgData.data;

  const dstImgData = dstCtx.createImageData(dstWidth, dstHeight);
  const dstData = dstImgData.data;

  for (let dy = 0; dy < dstHeight; dy++) {
    for (let dx = 0; dx < dstWidth; dx++) {
      const denom = invH[6] * dx + invH[7] * dy + invH[8];
      const sx = (invH[0] * dx + invH[1] * dy + invH[2]) / denom;
      const sy = (invH[3] * dx + invH[4] * dy + invH[5]) / denom;

      const ix = Math.floor(sx);
      const iy = Math.floor(sy);

      const dstIdx = (dy * dstWidth + dx) * 4;

      if (ix >= 0 && ix < srcWidth && iy >= 0 && iy < srcHeight) {
        const srcIdx = (iy * srcWidth + ix) * 4;
        dstData[dstIdx] = srcData[srcIdx];
        dstData[dstIdx + 1] = srcData[srcIdx + 1];
        dstData[dstIdx + 2] = srcData[srcIdx + 2];
        dstData[dstIdx + 3] = 255;
      } else {
        dstData[dstIdx] = 255;
        dstData[dstIdx + 1] = 255;
        dstData[dstIdx + 2] = 255;
        dstData[dstIdx + 3] = 255;
      }
    }
  }

  dstCtx.putImageData(dstImgData, 0, 0);
  return dstCanvas;
}

/**
 * Tasvirdan 4 ta burchak tayanch belgilarini avtomatik qidirish
 */
function findCornerMarkers(canvas: HTMLCanvasElement): Point2D[] | null {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Burchak hududlari: qog'ozning 4 chetidagi burchak zonalari (125px)
  const searchW = Math.min(125, Math.floor(w * 0.15));
  const searchH = Math.min(125, Math.floor(h * 0.15));

  const getLuminance = (x: number, y: number): number => {
    if (x < 0 || x >= w || y < 0 || y >= h) return 255;
    const idx = (y * w + x) * 4;
    return (data[idx] * 299 + data[idx + 1] * 587 + data[idx + 2] * 114) / 1000;
  };

  // Qora kvadrat klasterini topish
  const findMarkerInRegion = (
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    cornerTarget: Point2D
  ): Point2D | null => {
    let bestDist = Infinity;
    let seedX = -1;
    let seedY = -1;

    // Eng yaqin qora nuqtani topish (burchakka eng yaqin va qorong'i)
    for (let y = minY; y < maxY; y += 4) {
      for (let x = minX; x < maxX; x += 4) {
        const lum = getLuminance(x, y);
        if (lum < 90) {
          const dx = x - cornerTarget.x;
          const dy = y - cornerTarget.y;
          const dist = dx * dx + dy * dy;
          if (dist < bestDist) {
            bestDist = dist;
            seedX = x;
            seedY = y;
          }
        }
      }
    }

    if (seedX === -1) {
      return null;
    }

    // Seed atrofidagi 38px radiusdagi markerni aniqlash (50px marker uchun)
    const radius = 38;
    const boxMinX = Math.max(0, seedX - radius);
    const boxMaxX = Math.min(w, seedX + radius);
    const boxMinY = Math.max(0, seedY - radius);
    const boxMaxY = Math.min(h, seedY + radius);

    let darkXSum = 0;
    let darkYSum = 0;
    let darkCount = 0;

    for (let y = boxMinY; y < boxMaxY; y += 2) {
      for (let x = boxMinX; x < boxMaxX; x += 2) {
        if (getLuminance(x, y) < 140) {
          darkXSum += x;
          darkYSum += y;
          darkCount++;
        }
      }
    }

    if (darkCount < 15) return null;

    return {
      x: Math.round(darkXSum / darkCount),
      y: Math.round(darkYSum / darkCount),
    };
  };

  const tl = findMarkerInRegion(0, searchW, 0, searchH, { x: 0, y: 0 });
  const tr = findMarkerInRegion(w - searchW, w, 0, searchH, { x: w, y: 0 });
  const br = findMarkerInRegion(w - searchW, w, h - searchH, h, { x: w, y: h });
  const bl = findMarkerInRegion(0, searchW, h - searchH, h, { x: 0, y: h });

  if (!tl || !tr || !br || !bl) {
    return null;
  }

  return [tl, tr, br, bl];
}

/**
 * Doiraning ichki qorayishini mahalliy fon bilan solishtirish
 */
function analyzeBubble(
  canvas: HTMLCanvasElement,
  center: Point2D,
  radius: number
): number {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  const rInt = Math.ceil(radius * 2.2);
  const startX = Math.max(0, Math.floor(center.x - rInt));
  const startY = Math.max(0, Math.floor(center.y - rInt));
  const boxW = Math.min(w - startX, rInt * 2);
  const boxH = Math.min(h - startY, rInt * 2);

  if (boxW <= 0 || boxH <= 0) return 0;

  const imgData = ctx.getImageData(startX, startY, boxW, boxH);
  const data = imgData.data;

  let innerLumSum = 0;
  let innerCount = 0;

  let bgLumSum = 0;
  let bgCount = 0;

  const innerR = radius * 0.72; // Faqat doira ichi
  const bgMinR = radius * 1.35; // Fon halqasi
  const bgMaxR = radius * 2.1;

  for (let py = 0; py < boxH; py++) {
    for (let px = 0; px < boxW; px++) {
      const realX = startX + px;
      const realY = startY + py;
      const dx = realX - center.x;
      const dy = realY - center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const idx = (py * boxW + px) * 4;
      const lum = (data[idx] * 299 + data[idx + 1] * 587 + data[idx + 2] * 114) / 1000;

      if (dist <= innerR) {
        innerLumSum += lum;
        innerCount++;
      } else if (dist >= bgMinR && dist <= bgMaxR) {
        bgLumSum += lum;
        bgCount++;
      }
    }
  }

  if (innerCount === 0 || bgCount === 0) return 0;

  const avgInner = innerLumSum / innerCount;
  const avgBg = bgLumSum / bgCount;

  // Darkness nisbati: (avgBg - avgInner) / avgBg
  const diff = Math.max(0, avgBg - avgInner);
  const darkness = Math.min(1.0, diff / Math.max(1, avgBg));

  return darkness;
}

/**
 * Asl to'g'rilangan suratdan qator kesmasini (crop data URL) ajratib olish
 */
function extractRowCrop(
  canvas: HTMLCanvasElement,
  box: { x: number; y: number; width: number; height: number }
): string {
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = box.width;
  cropCanvas.height = box.height;
  const ctx = cropCanvas.getContext('2d')!;

  ctx.drawImage(
    canvas,
    box.x,
    box.y,
    box.width,
    box.height,
    0,
    0,
    box.width,
    box.height
  );

  return cropCanvas.toDataURL('image/jpeg', 0.85);
}

/**
 * QR kodni o'qish (jsQR)
 */
function decodeQrCode(canvas: HTMLCanvasElement): OmrQrPayload | null {
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const qr = jsQR(imgData.data, imgData.width, imgData.height);
  if (!qr) return null;

  try {
    const payload = JSON.parse(qr.data);
    if (payload && payload.app === 'zehnora_omr' && payload.sid) {
      return payload as OmrQrPayload;
    }
  } catch {
    // Agar to'g'ridan to'g'ri JSON bo'lmasa
  }
  return null;
}

/**
 * ASOSIY OMR SKANER FUNKSIYASI
 * Suratni oladi, tekshiradi, to'g'rilaydi va har bir savol javobini aniqlaydi
 */
export async function processOmrImage(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  expectedQuestions: QuestionDef[],
  targetSessionId?: string
): Promise<OmrScanResult> {
  // 1. Ishchi Canvas yaratish
  const canvas = document.createElement('canvas');
  canvas.width = imageSource.width || 1200;
  canvas.height = imageSource.height || 1697;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imageSource, 0, 0, canvas.width, canvas.height);

  // 2. Tayanch burchak belgilarini topish
  const detectedCorners = findCornerMarkers(canvas);

  if (!detectedCorners) {
    return {
      success: false,
      errorMessage:
        'Tayanch burchak belgilari to‘liq ko‘rinmadi yoki kesilib qolgan. Iltimos, varaqning 4 ta burchagi to‘liq kadrga tushadigan qilib qayta suratga oling.',
      templateVersion: 1,
      questionCount: expectedQuestions.length,
      detections: [],
      reviewNeededCount: 0,
    };
  }

  // Burchaklar topildi -> Perspektivani aniq to'g'rilash (Deskew & Warp)
  const dstCorners = [
    { x: 80, y: 80 },
    { x: 1120, y: 80 },
    { x: 1120, y: 1617 },
    { x: 80, y: 1617 },
  ];
  const alignedCanvas = warpPerspective(
    canvas,
    detectedCorners,
    dstCorners,
    OMR_CANVAS_WIDTH,
    OMR_CANVAS_HEIGHT
  );

  // 3. QR Kodni o'qish
  const qrPayload = decodeQrCode(alignedCanvas) || decodeQrCode(canvas);

  if (qrPayload && targetSessionId && qrPayload.sid !== targetSessionId) {
    return {
      success: false,
      errorMessage: `Boshqa sinovning tituli skanerlandi! Titul sinov ID: "${qrPayload.sid}", joriy sinov ID: "${targetSessionId}".`,
      templateVersion: qrPayload.v,
      questionCount: qrPayload.qc,
      detections: [],
      reviewNeededCount: 0,
      alignedImageCanvas: alignedCanvas,
    };
  }

  // 4. Shablon koordinatalari bo'yicha doiralarni o'qish
  const template = getOmrTemplate(expectedQuestions);
  const detections: QuestionDetectionResult[] = [];
  let reviewNeededCount = 0;

  for (const row of template.questionRows) {
    const bubbleResults: BubbleAnalysisResult[] = [];

    row.options.forEach((opt) => {
      const darkness = analyzeBubble(alignedCanvas, opt.center, opt.radius);
      bubbleResults.push({
        optionLabel: opt.optionLabel,
        darkness: Math.round(darkness * 100) / 100,
        isMarked: darkness >= 0.28,
      });
    });

    // Eng yuqori qorayish bo'yicha tartiblash
    const sorted = [...bubbleResults].sort((a, b) => b.darkness - a.darkness);
    const top1 = sorted[0];
    const top2 = sorted[1];

    let detectedAnswer = '-';
    let isAmbiguous = false;
    let isUncertain = false;
    let isOmitted = false;
    let needsReview = false;
    let reviewReason: string | undefined = undefined;

    if (top1.darkness < 0.22) {
      // Hech qaysi bo'yalmagan
      isOmitted = true;
      detectedAnswer = '-';
    } else if (top1.darkness >= 0.35 && top2.darkness < 0.20 && (top1.darkness - top2.darkness) >= 0.18) {
      // Bitta aniq belgi tanlandi
      detectedAnswer = top1.optionLabel;
    } else if (top1.darkness >= 0.25 && top2.darkness >= 0.20) {
      // Ikkita belgi yoki o'chirilgan iz bor
      isAmbiguous = true;
      needsReview = true;
      reviewReason = `Ikkita belgi yoki noaniq iz (${top1.optionLabel}: ${(top1.darkness * 100).toFixed(0)}%, ${top2.optionLabel}: ${(top2.darkness * 100).toFixed(0)}%)`;
      detectedAnswer = top1.optionLabel; // Tavsiya etilgan eng to'q belgi
    } else if (top1.darkness >= 0.20 && top1.darkness < 0.35) {
      // Juda xira belgi
      isUncertain = true;
      needsReview = true;
      reviewReason = `Belgi juda xira (${top1.optionLabel}: ${(top1.darkness * 100).toFixed(0)}%)`;
      detectedAnswer = top1.optionLabel;
    } else {
      detectedAnswer = top1.optionLabel;
    }

    if (needsReview) {
      reviewNeededCount++;
    }

    // Shubhali savollar yoki barcha savollar uchun asl suratdan kesma (crop)
    const cropDataUrl = extractRowCrop(alignedCanvas, row.boundingBox);

    detections.push({
      questionNumber: row.questionNumber,
      questionLabel: row.questionLabel,
      type: row.type,
      detectedAnswer,
      isAmbiguous,
      isUncertain,
      isOmitted,
      needsReview,
      reviewReason,
      bubbles: bubbleResults,
      cropDataUrl,
    });
  }

  return {
    success: true,
    sessionId: qrPayload?.sid,
    studentId: qrPayload?.stId,
    studentName: qrPayload?.stName,
    templateVersion: template.version,
    questionCount: template.questionCount,
    detections,
    reviewNeededCount,
    alignedImageCanvas: alignedCanvas,
  };
}
