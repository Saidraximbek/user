import { soundManager } from '../museum/SoundManager.js';

export class InspectModal {
  constructor(storage, onEditCallback, onDeleteCallback) {
    this.storage = storage;
    this.onEditCallback = onEditCallback;
    this.onDeleteCallback = onDeleteCallback;
    this.currentArtwork = null;
    this.allArtworks = [];
    this.currentIndex = 0;

    this.createDOM();
    this.attachEvents();
  }

  createDOM() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay hidden';
    this.overlay.id = 'inspectModal';

    this.overlay.innerHTML = `
      <div class="inspect-card">
        <button class="inspect-close" id="closeInspectModal">&times;</button>

        <div class="inspect-layout">
          <!-- Picture Display -->
          <div class="inspect-image-wrapper">
            <img id="inspectImage" src="" alt="Bizning Xotiramiz" />
            <div class="inspect-nav-controls">
              <button class="btn-inspect-nav" id="btnPrevArt" title="Oldingi rasm">◀</button>
              <button class="btn-inspect-nav" id="btnNextArt" title="Keyingi rasm">▶</button>
            </div>
          </div>

          <!-- Metadata & Details -->
          <div class="inspect-info">
            <div class="inspect-badges">
              <span class="badge room-badge" id="inspectRoom">💖 Sevgi Xonasi</span>
              <span class="badge frame-badge" id="inspectFrame">Oltin Ramka</span>
            </div>

            <h2 id="inspectTitle">Bizning Shirin Lahzamiz</h2>
            <div class="inspect-meta">
              <span class="meta-artist" id="inspectArtist">Biz Ikkovimiz 💕</span> •
              <span class="meta-year" id="inspectYear">2026</span>
            </div>

            <div class="inspect-divider"></div>

            <div class="love-letter-quote">
              <span class="quote-icon">“</span>
              <p class="inspect-desc" id="inspectDesc">
                Xotira tavsifi bu yerda ko'rinadi...
              </p>
            </div>

            <div class="inspect-actions">
              <button class="btn btn-secondary" id="btnDownloadArt">
                <span>💾</span> Yuklab Olish
              </button>
              <button class="btn btn-primary" id="btnEditArt">
                <span>✏️</span> Rasmni Almashtirish / Tahrirlash
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    this.inspectImage = document.getElementById('inspectImage');
    this.inspectTitle = document.getElementById('inspectTitle');
    this.inspectArtist = document.getElementById('inspectArtist');
    this.inspectYear = document.getElementById('inspectYear');
    this.inspectDesc = document.getElementById('inspectDesc');
    this.inspectRoom = document.getElementById('inspectRoom');
    this.inspectFrame = document.getElementById('inspectFrame');
    this.btnDownloadArt = document.getElementById('btnDownloadArt');
    this.btnEditArt = document.getElementById('btnEditArt');
    this.btnPrevArt = document.getElementById('btnPrevArt');
    this.btnNextArt = document.getElementById('btnNextArt');
  }

  attachEvents() {
    document.getElementById('closeInspectModal').addEventListener('click', () => this.close());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.btnPrevArt.addEventListener('click', () => this.navigate(-1));
    this.btnNextArt.addEventListener('click', () => this.navigate(1));

    this.btnEditArt.addEventListener('click', () => {
      this.close();
      if (this.onEditCallback && this.currentArtwork) {
        this.onEditCallback(this.currentArtwork);
      }
    });

    this.btnDownloadArt.addEventListener('click', () => {
      if (!this.currentArtwork || !this.currentArtwork.imageUrl) return;
      const link = document.createElement('a');
      link.href = this.currentArtwork.imageUrl;
      link.download = `${this.currentArtwork.title || 'sevgi-xotiramiz'}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    });

    window.addEventListener('keydown', (e) => {
      if (this.overlay.classList.contains('hidden')) return;
      if (e.key === 'ArrowLeft') this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
      if (e.key === 'Escape') this.close();
    });
  }

  async open(artworkData) {
    soundManager.playCameraSnap();
    this.allArtworks = await this.storage.getAll();
    this.currentArtwork = artworkData;
    this.currentIndex = this.allArtworks.findIndex(a => a.id === artworkData.id);
    if (this.currentIndex === -1) this.currentIndex = 0;

    this.renderCurrent();
    this.overlay.classList.remove('hidden');
  }

  renderCurrent() {
    const art = this.currentArtwork;
    if (!art) return;

    this.inspectImage.src = art.imageUrl;
    this.inspectTitle.textContent = art.title || 'Bizning Xotiramiz';
    this.inspectArtist.textContent = art.artist || 'Biz Ikkovimiz 💕';
    this.inspectYear.textContent = art.year || '2026';
    this.inspectDesc.textContent = art.description || 'Har bir lahzamiz sen bilan qadrli va go\'zal.';

    this.inspectRoom.textContent = `📍 Ramka #${(art.slotIndex ?? 0) + 1}`;

    const frameLabels = {
      'classic-gold': '👑 Oltin Ramka',
      'neon-glow': '💖 Atirgul Neon Ramka',
      'vintage-wood': '🪵 Qadimiy Yog\'och',
      'modern-black': '🖤 Nafis Qora Ramka'
    };
    this.inspectFrame.textContent = frameLabels[art.frameStyle] || 'Oltin Ramka';
  }

  navigate(dir) {
    if (!this.allArtworks.length) return;
    this.currentIndex = (this.currentIndex + dir + this.allArtworks.length) % this.allArtworks.length;
    this.currentArtwork = this.allArtworks[this.currentIndex];
    soundManager.playClick();
    this.renderCurrent();
  }

  close() {
    this.overlay.classList.add('hidden');
  }
}
