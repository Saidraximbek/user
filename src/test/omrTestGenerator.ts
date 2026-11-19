import { OmrTemplateDefinition } from '../types/omr';
import { OMR_CANVAS_WIDTH, OMR_CANVAS_HEIGHT } from '../utils/omrTemplate';

export interface SyntheticSheetOptions {
  rotateAngleDeg?: number;
  cutCorner?: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft';
  doubleMarkQuestions?: number[]; // Ikkita belgi qo'yiladigan savollar
  faintMarkQuestions?: number[];  // Xira belgi qo'yiladigan savollar
}

/**
 * Testlar uchun sintetik OMR varaqasi tasvirini Canvas-da yaratish
 * Vitest/JSDOM muhitida haqiqiy piksel buferini hosil qiladi
 */
export function createSyntheticOmrSheet(
  template: OmrTemplateDefinition,
  knownAnswers: Record<number, string>, // { 1: 'A', 2: 'B', ... }
  options: SyntheticSheetOptions = {}
): HTMLCanvasElement {
  const w = OMR_CANVAS_WIDTH;
  const h = OMR_CANVAS_HEIGHT;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  // Piksel buferi: RGBA
  const buffer = new Uint8ClampedArray(w * h * 4);
  (canvas as any)._pixelBuffer = buffer;

  // 1. Dastlab barcha piksellar oq fon: (255, 255, 255, 255)
  buffer.fill(255);

  const setPixel = (x: number, y: number, r: number, g: number, b: number) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = (y * w + x) * 4;
    buffer[idx] = r;
    buffer[idx + 1] = g;
    buffer[idx + 2] = b;
    buffer[idx + 3] = 255;
  };

  const fillDisk = (cx: number, cy: number, radius: number, r: number, g: number, b: number) => {
    const minX = Math.max(0, Math.floor(cx - radius));
    const maxX = Math.min(w - 1, Math.ceil(cx + radius));
    const minY = Math.max(0, Math.floor(cy - radius));
    const maxY = Math.min(h - 1, Math.ceil(cy + radius));
    const rSq = radius * radius;

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= rSq) {
          setPixel(x, y, r, g, b);
        }
      }
    }
  };

  const drawRect = (cx: number, cy: number, size: number, r: number, g: number, b: number) => {
    const half = Math.floor(size / 2);
    for (let y = cy - half; y <= cy + half; y++) {
      for (let x = cx - half; x <= cx + half; x++) {
        setPixel(x, y, r, g, b);
      }
    }
  };

  // 2. To'rtta burchak markeri
  const drawCornerMarker = (cx: number, cy: number, isCut: boolean) => {
    if (isCut) return;
    drawRect(cx, cy, 50, 0, 0, 0);       // Tashqi qora kvadrat
    drawRect(cx, cy, 24, 255, 255, 255); // O'rta oq kvadrat
    drawRect(cx, cy, 12, 0, 0, 0);       // Ichki qora kvadrat
  };

  const cut = options.cutCorner;
  drawCornerMarker(template.cornerMarkers.topLeft.x, template.cornerMarkers.topLeft.y, cut === 'topLeft');
  drawCornerMarker(template.cornerMarkers.topRight.x, template.cornerMarkers.topRight.y, cut === 'topRight');
  drawCornerMarker(template.cornerMarkers.bottomRight.x, template.cornerMarkers.bottomRight.y, cut === 'bottomRight');
  drawCornerMarker(template.cornerMarkers.bottomLeft.x, template.cornerMarkers.bottomLeft.y, cut === 'bottomLeft');

  // 3. Orientation marker
  fillDisk(template.orientationMarker.center.x, template.orientationMarker.center.y, template.orientationMarker.radius, 0, 0, 0);

  // 4. Savollar va doiralar
  template.questionRows.forEach((row) => {
    const qNum = row.questionNumber;
    const targetAns = knownAnswers[qNum] || '-';
    const isDouble = options.doubleMarkQuestions?.includes(qNum);
    const isFaint = options.faintMarkQuestions?.includes(qNum);

    row.options.forEach((opt) => {
      // Bo'sh doira hoshiyasi (qora aylanma)
      const r = opt.radius;
      for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
        const x = Math.round(opt.center.x + r * Math.cos(angle));
        const y = Math.round(opt.center.y + r * Math.sin(angle));
        setPixel(x, y, 0, 0, 0);
      }

      // Agar variant to'ldirilgan bo'lsa
      const shouldFill =
        opt.optionLabel === targetAns ||
        (isDouble && (opt.optionLabel === 'A' || opt.optionLabel === 'B'));

      if (shouldFill) {
        // Qora ruchka bilan bo'yalgan (agar xira bo'lsa yarim qora)
        const lum = isFaint ? 190 : 20;
        fillDisk(opt.center.x, opt.center.y, opt.radius * 0.75, lum, lum, lum);
      }
    });
  });

  // Canvas context mock-iga piksel buferini ulash
  const ctx = canvas.getContext('2d')!;

  // vitest-canvas-mock da getImageData chaqirilganda bizning to'ldirilgan buferimizni qaytaradigan qilish
  ctx.getImageData = (sx: number, sy: number, sw: number, sh: number) => {
    const croppedBuffer = new Uint8ClampedArray(sw * sh * 4);
    for (let dy = 0; dy < sh; dy++) {
      for (let dx = 0; dx < sw; dx++) {
        const realX = sx + dx;
        const realY = sy + dy;
        const targetIdx = (dy * sw + dx) * 4;

        if (realX >= 0 && realX < w && realY >= 0 && realY < h) {
          const srcIdx = (realY * w + realX) * 4;
          croppedBuffer[targetIdx] = buffer[srcIdx];
          croppedBuffer[targetIdx + 1] = buffer[srcIdx + 1];
          croppedBuffer[targetIdx + 2] = buffer[srcIdx + 2];
          croppedBuffer[targetIdx + 3] = buffer[srcIdx + 3];
        } else {
          croppedBuffer[targetIdx] = 255;
          croppedBuffer[targetIdx + 1] = 255;
          croppedBuffer[targetIdx + 2] = 255;
          croppedBuffer[targetIdx + 3] = 255;
        }
      }
    }
    return {
      width: sw,
      height: sh,
      data: croppedBuffer,
      colorSpace: 'srgb',
    } as ImageData;
  };

  return canvas;
}
