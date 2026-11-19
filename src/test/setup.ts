import 'vitest-canvas-mock';

// Extend HTMLCanvasElement with an in-memory pixel buffer for realistic image processing tests in JSDOM
const originalGetContext = HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.getContext = function (contextId: string, ...args: any[]) {
  const ctx = (originalGetContext as any).call(this, contextId, ...args);
  if (contextId === '2d' && ctx) {
    const canvas = this;
    if (!(canvas as any)._pixelBuffer) {
      const w = canvas.width || 300;
      const h = canvas.height || 150;
      (canvas as any)._pixelBuffer = new Uint8ClampedArray(w * h * 4);
      (canvas as any)._pixelBuffer.fill(255);
    }

    ctx.createImageData = function (w: number, h: number) {
      return {
        width: w,
        height: h,
        data: new Uint8ClampedArray(w * h * 4),
        colorSpace: 'srgb',
      } as ImageData;
    };

    ctx.getImageData = function (sx: number, sy: number, sw: number, sh: number) {
      const buffer = (canvas as any)._pixelBuffer;
      const cw = canvas.width;
      const ch = canvas.height;
      const out = new Uint8ClampedArray(sw * sh * 4);

      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const rx = sx + x;
          const ry = sy + y;
          const outIdx = (y * sw + x) * 4;
          if (buffer && rx >= 0 && rx < cw && ry >= 0 && ry < ch) {
            const srcIdx = (ry * cw + rx) * 4;
            out[outIdx] = buffer[srcIdx];
            out[outIdx + 1] = buffer[srcIdx + 1];
            out[outIdx + 2] = buffer[srcIdx + 2];
            out[outIdx + 3] = buffer[srcIdx + 3];
          } else {
            out[outIdx] = 255;
            out[outIdx + 1] = 255;
            out[outIdx + 2] = 255;
            out[outIdx + 3] = 255;
          }
        }
      }
      return {
        width: sw,
        height: sh,
        data: out,
        colorSpace: 'srgb',
      } as ImageData;
    };

    ctx.putImageData = function (imgData: ImageData, dx: number, dy: number) {
      const cw = canvas.width;
      const ch = canvas.height;
      if (!(canvas as any)._pixelBuffer || (canvas as any)._pixelBuffer.length !== cw * ch * 4) {
        (canvas as any)._pixelBuffer = new Uint8ClampedArray(cw * ch * 4);
        (canvas as any)._pixelBuffer.fill(255);
      }
      const buffer = (canvas as any)._pixelBuffer;
      for (let y = 0; y < imgData.height; y++) {
        for (let x = 0; x < imgData.width; x++) {
          const rx = dx + x;
          const ry = dy + y;
          if (rx >= 0 && rx < cw && ry >= 0 && ry < ch) {
            const srcIdx = (y * imgData.width + x) * 4;
            const dstIdx = (ry * cw + rx) * 4;
            buffer[dstIdx] = imgData.data[srcIdx];
            buffer[dstIdx + 1] = imgData.data[srcIdx + 1];
            buffer[dstIdx + 2] = imgData.data[srcIdx + 2];
            buffer[dstIdx + 3] = imgData.data[srcIdx + 3];
          }
        }
      }
    };

    ctx.drawImage = function (image: any, ...drawArgs: any[]) {
      const cw = canvas.width;
      const ch = canvas.height;
      if (!(canvas as any)._pixelBuffer || (canvas as any)._pixelBuffer.length !== cw * ch * 4) {
        (canvas as any)._pixelBuffer = new Uint8ClampedArray(cw * ch * 4);
        (canvas as any)._pixelBuffer.fill(255);
      }
      const dstBuffer = (canvas as any)._pixelBuffer;
      const srcBuffer = (image as any)._pixelBuffer;

      if (srcBuffer) {
        const sw = image.width;
        const sh = image.height;
        let dx = 0;
        let dy = 0;
        let dw = cw;
        let dh = ch;

        if (drawArgs.length === 2) {
          dx = drawArgs[0];
          dy = drawArgs[1];
          dw = sw;
          dh = sh;
        } else if (drawArgs.length === 4) {
          dx = drawArgs[0];
          dy = drawArgs[1];
          dw = drawArgs[2];
          dh = drawArgs[3];
        } else if (drawArgs.length >= 8) {
          dx = drawArgs[4];
          dy = drawArgs[5];
          dw = drawArgs[6];
          dh = drawArgs[7];
        }

        for (let y = 0; y < dh; y++) {
          for (let x = 0; x < dw; x++) {
            const rx = dx + x;
            const ry = dy + y;
            if (rx >= 0 && rx < cw && ry >= 0 && ry < ch) {
              const sx = Math.floor((x / dw) * sw);
              const sy = Math.floor((y / dh) * sh);
              const srcIdx = (sy * sw + sx) * 4;
              const dstIdx = (ry * cw + rx) * 4;
              dstBuffer[dstIdx] = srcBuffer[srcIdx];
              dstBuffer[dstIdx + 1] = srcBuffer[srcIdx + 1];
              dstBuffer[dstIdx + 2] = srcBuffer[srcIdx + 2];
              dstBuffer[dstIdx + 3] = srcBuffer[srcIdx + 3];
            }
          }
        }
      }
    };
  }
  return ctx;
};

