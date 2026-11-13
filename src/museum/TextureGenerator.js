import * as THREE from 'three';

/**
 * TextureGenerator: Generates procedural canvas-based textures
 * for floors, walls, frames, and initial museum exhibition artworks.
 * 100% self-contained, no external asset dependencies.
 */
export class TextureGenerator {
  /**
   * Generates herringbone / chevron wooden parquet floor texture
   */
  static createParquetTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base warm wood tone
    ctx.fillStyle = '#6b4226';
    ctx.fillRect(0, 0, 1024, 1024);

    const plankWidth = 128;
    const plankHeight = 64;
    const woodColors = ['#7c4a2d', '#6d3f23', '#8b5433', '#5e351c', '#965e3b'];

    for (let y = 0; y < 1024; y += plankHeight) {
      for (let x = 0; x < 1024; x += plankWidth) {
        const offset = (Math.floor(y / plankHeight) % 2) * (plankWidth / 2);
        const px = (x + offset) % 1024;
        const color = woodColors[Math.floor(Math.random() * woodColors.length)];

        ctx.fillStyle = color;
        ctx.fillRect(px, y, plankWidth - 2, plankHeight - 2);

        // Wood grain lines
        ctx.strokeStyle = 'rgba(40, 20, 10, 0.25)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          const gy = y + Math.random() * plankHeight;
          ctx.beginPath();
          ctx.moveTo(px, gy);
          ctx.bezierCurveTo(
            px + plankWidth * 0.3, gy + (Math.random() - 0.5) * 6,
            px + plankWidth * 0.7, gy + (Math.random() - 0.5) * 6,
            px + plankWidth - 2, gy
          );
          ctx.stroke();
        }

        // Highlight bevel
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(px, y);
        ctx.lineTo(px + plankWidth - 2, y);
        ctx.stroke();

        // Shadow bevel
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.moveTo(px, y + plankHeight - 2);
        ctx.lineTo(px + plankWidth - 2, y + plankHeight - 2);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    return texture;
  }

  /**
   * Generates Carrara White Marble floor texture with subtle veining
   */
  static createMarbleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base marble tone
    ctx.fillStyle = '#f5f4f0';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle clouds / noise
    for (let i = 0; i < 30; i++) {
      const grad = ctx.createRadialGradient(
        Math.random() * 1024, Math.random() * 1024, 10,
        Math.random() * 1024, Math.random() * 1024, 250
      );
      grad.addColorStop(0, 'rgba(220, 220, 225, 0.25)');
      grad.addColorStop(1, 'rgba(245, 244, 240, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);
    }

    // Elegant marble veins
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 18; i++) {
      ctx.strokeStyle = (i % 3 === 0) ? 'rgba(180, 150, 110, 0.25)' : 'rgba(140, 145, 155, 0.3)';
      ctx.beginPath();
      let vx = Math.random() * 1024;
      let vy = 0;
      ctx.moveTo(vx, vy);

      while (vy < 1024) {
        vx += (Math.random() - 0.48) * 45;
        vy += Math.random() * 60 + 20;
        ctx.lineTo(vx, vy);
      }
      ctx.stroke();
    }

    // Tile seams (grid of large slabs 512x512)
    ctx.strokeStyle = 'rgba(160, 160, 160, 0.4)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 1024; x += 256) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y <= 1024; y += 256) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);
    return texture;
  }

  /**
   * Generates gold foil / metallic texture for frames
   */
  static createGoldTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#f9e8a2');
    grad.addColorStop(0.3, '#d4af37');
    grad.addColorStop(0.6, '#aa7c11');
    grad.addColorStop(0.8, '#f5d77f');
    grad.addColorStop(1, '#8c6206');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Subtle scratches / brush strokes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      const y = Math.random() * 256;
      ctx.moveTo(0, y);
      ctx.lineTo(256, y + (Math.random() - 0.5) * 10);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Creates a textured bronze / brass plaque texture with title and artist
   */
  static createPlaqueTexture(title, artist = '', year = '') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Brass gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 512, 128);
    bgGrad.addColorStop(0, '#d1a850');
    bgGrad.addColorStop(0.5, '#edd48a');
    bgGrad.addColorStop(1, '#a67c2e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 512, 128);

    // Inner bevel border
    ctx.strokeStyle = '#614310';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.strokeStyle = '#fff5cc';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 492, 108);

    // Text rendering
    ctx.textAlign = 'center';
    ctx.fillStyle = '#261704';

    // Title
    ctx.font = 'bold 26px "Playfair Display", Georgia, serif';
    const displayTitle = title.length > 28 ? title.slice(0, 26) + '...' : title;
    ctx.fillText(displayTitle, 256, 52);

    // Subtitle / Artist / Year
    ctx.font = 'italic 18px "Cinzel", "Times New Roman", serif';
    const subText = artist ? (year ? `${artist} (${year})` : artist) : (year ? `${year}` : "Noma'lum muallif");
    const displaySub = subText.length > 36 ? subText.slice(0, 34) + '...' : subText;
    ctx.fillStyle = '#452a06';
    ctx.fillText(displaySub, 256, 88);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates a sample artwork canvas with rich artistic visuals
   */
  static generateArtCanvas(type, title) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    if (type === 'samarkand') {
      // Registan Sunset Painting
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 400);
      skyGrad.addColorStop(0, '#1a103c');
      skyGrad.addColorStop(0.4, '#80265b');
      skyGrad.addColorStop(0.7, '#e65c00');
      skyGrad.addColorStop(1, '#f9d423');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 800, 600);

      // Sun
      ctx.fillStyle = '#fff4cc';
      ctx.shadowColor = '#ffaa33';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(400, 340, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Mosque & Madrasah Silhouettes
      ctx.fillStyle = '#1c1328';
      // Center Grand Dome
      ctx.beginPath();
      ctx.arc(400, 320, 90, Math.PI, 0);
      ctx.lineTo(490, 480);
      ctx.lineTo(310, 480);
      ctx.fill();
      // Grand Portal (Pishtaq)
      ctx.fillRect(340, 240, 120, 240);
      // Minarets
      ctx.fillRect(210, 210, 24, 270);
      ctx.fillRect(566, 210, 24, 270);
      // Minaret caps
      ctx.beginPath();
      ctx.arc(222, 210, 18, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(578, 210, 18, Math.PI, 0);
      ctx.fill();

      // Plaza ground reflection
      const groundGrad = ctx.createLinearGradient(0, 480, 0, 600);
      groundGrad.addColorStop(0, '#2d1830');
      groundGrad.addColorStop(1, '#110b14');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 480, 800, 120);

      // Warm glow reflections
      ctx.fillStyle = 'rgba(255, 180, 50, 0.2)';
      ctx.fillRect(320, 480, 160, 120);

    } else if (type === 'starry') {
      // Starry Night Homage
      const sky = ctx.createLinearGradient(0, 0, 800, 600);
      sky.addColorStop(0, '#0a192f');
      sky.addColorStop(0.5, '#172a45');
      sky.addColorStop(1, '#020c1b');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 800, 600);

      // Swirling sky brush strokes
      for (let i = 0; i < 200; i++) {
        ctx.strokeStyle = `rgba(100, 217, 255, ${Math.random() * 0.4})`;
        ctx.lineWidth = Math.random() * 4 + 1;
        ctx.beginPath();
        const x = Math.random() * 800;
        const y = Math.random() * 400;
        ctx.arc(x, y, Math.random() * 60 + 20, 0, Math.PI * (Math.random() + 0.5));
        ctx.stroke();
      }

      // Crescent Moon
      ctx.fillStyle = '#ffdf78';
      ctx.shadowColor = '#ffeaa7';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(680, 130, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#172a45';
      ctx.beginPath();
      ctx.arc(660, 120, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cypress tree silhouette
      ctx.fillStyle = '#05111b';
      ctx.beginPath();
      ctx.moveTo(140, 600);
      ctx.bezierCurveTo(110, 450, 120, 280, 160, 150);
      ctx.bezierCurveTo(180, 260, 210, 450, 200, 600);
      ctx.fill();

    } else if (type === 'mountains') {
      // Serene Mountain Lake
      const sky = ctx.createLinearGradient(0, 0, 0, 360);
      sky.addColorStop(0, '#64b5f6');
      sky.addColorStop(0.7, '#ffcc80');
      sky.addColorStop(1, '#ffe0b2');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, 800, 600);

      // Distant purple mountains
      ctx.fillStyle = '#5c6bc0';
      ctx.beginPath();
      ctx.moveTo(0, 360);
      ctx.lineTo(150, 220);
      ctx.lineTo(280, 310);
      ctx.lineTo(440, 180);
      ctx.lineTo(600, 300);
      ctx.lineTo(740, 200);
      ctx.lineTo(800, 360);
      ctx.fill();

      // Foreground sharp mountains with snow
      ctx.fillStyle = '#283593';
      ctx.beginPath();
      ctx.moveTo(80, 380);
      ctx.lineTo(260, 190);
      ctx.lineTo(410, 380);
      ctx.fill();
      // Snow caps
      ctx.fillStyle = '#e8eaf6';
      ctx.beginPath();
      ctx.moveTo(260, 190);
      ctx.lineTo(220, 250);
      ctx.lineTo(260, 240);
      ctx.lineTo(290, 255);
      ctx.fill();

      // Crystal Lake
      const lake = ctx.createLinearGradient(0, 380, 0, 600);
      lake.addColorStop(0, '#00838f');
      lake.addColorStop(0.5, '#006064');
      lake.addColorStop(1, '#004d40');
      ctx.fillStyle = lake;
      ctx.fillRect(0, 380, 800, 220);

      // Water reflection lines
      ctx.strokeStyle = 'rgba(255, 224, 178, 0.4)';
      ctx.lineWidth = 2;
      for (let y = 390; y < 580; y += 12) {
        ctx.beginPath();
        const rx = 260 + (Math.random() - 0.5) * 80;
        ctx.moveTo(rx - 50, y);
        ctx.lineTo(rx + 50, y);
        ctx.stroke();
      }

    } else if (type === 'autumn') {
      // Golden Autumn Forest
      const bg = ctx.createLinearGradient(0, 0, 800, 600);
      bg.addColorStop(0, '#f97316');
      bg.addColorStop(0.5, '#eab308');
      bg.addColorStop(1, '#78350f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 800, 600);

      // Birch tree trunks
      for (let i = 0; i < 12; i++) {
        const x = 50 + i * 65 + (Math.random() - 0.5) * 30;
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(x, 0, 20, 600);

        // Birch bark marks
        ctx.fillStyle = '#451a03';
        for (let j = 0; j < 15; j++) {
          ctx.fillRect(x, Math.random() * 600, Math.random() * 15 + 4, 3);
        }
      }

      // Golden foliage blotches
      for (let k = 0; k < 180; k++) {
        const rad = Math.random() * 30 + 10;
        ctx.fillStyle = ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#ef4444'][k % 5];
        ctx.beginPath();
        ctx.arc(Math.random() * 800, Math.random() * 450, rad, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (type === 'abstract') {
      // Modern Geometric Abstract
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 800, 600);

      // Vibrant geometric shapes
      const colors = ['#ec4899', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'];
      for (let i = 0; i < 25; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.save();
        ctx.translate(Math.random() * 700 + 50, Math.random() * 500 + 50);
        ctx.rotate(Math.random() * Math.PI);
        if (i % 3 === 0) {
          ctx.fillRect(-60, -60, 120, 120);
        } else if (i % 3 === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, 50, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -70);
          ctx.lineTo(60, 50);
          ctx.lineTo(-60, 50);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Elegant gold fine lines connecting
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(700, 500);
      ctx.moveTo(150, 520);
      ctx.lineTo(650, 120);
      ctx.stroke();

    } else if (type === 'portrait') {
      // Classical Elegance
      const bg = ctx.createRadialGradient(400, 280, 20, 400, 300, 450);
      bg.addColorStop(0, '#581c87');
      bg.addColorStop(0.6, '#2e1065');
      bg.addColorStop(1, '#0f051d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 800, 600);

      // Stylized renaissance profile silhouette with golden filigree
      ctx.fillStyle = '#fae8ff';
      ctx.beginPath();
      ctx.arc(400, 260, 110, 0, Math.PI * 2);
      ctx.fill();

      // Flowing hair
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(380, 250, 120, 0.4 * Math.PI, 1.4 * Math.PI);
      ctx.bezierCurveTo(300, 400, 380, 550, 460, 580);
      ctx.lineTo(340, 580);
      ctx.fill();

      // Golden floral laurel
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(400, 260, 130, 0, Math.PI * 2);
      ctx.stroke();

    } else {
      // Empty / Upload Placeholder Frame
      const bg = ctx.createLinearGradient(0, 0, 800, 600);
      bg.addColorStop(0, '#1e293b');
      bg.addColorStop(1, '#0f172a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 800, 600);

      // Dashed border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.setLineDash([16, 12]);
      ctx.strokeRect(40, 40, 720, 520);
      ctx.setLineDash([]);

      // Icon: Camera / Plus
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(400, 240, 60, 0, Math.PI * 2);
      ctx.fill();

      // Plus sign
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(388, 205, 24, 70);
      ctx.fillRect(365, 228, 70, 24);

      // Text
      ctx.textAlign = 'center';
      ctx.font = 'bold 36px "Inter", sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('Bu yerga o\'z rasmingizni joylang!', 400, 370);

      ctx.font = '22px "Inter", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Yaqinlashib [E] tugmasini bosing yoki tepadagi', 400, 415);
      ctx.fillText('"Rasm Joylash" tugmasidan foydalaning', 400, 450);
    }

    // Artist signature watermark bottom right
    ctx.textAlign = 'right';
    ctx.font = 'italic 16px "Cinzel", Georgia, serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('Muzey Kolleksiyasi', 770, 580);

    return canvas.toDataURL('image/jpeg', 0.92);
  }
}
