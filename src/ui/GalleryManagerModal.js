import { soundManager } from '../museum/SoundManager.js';

export class GalleryManagerModal {
  constructor(storage, characterController, artworkManager, onEditCallback, onReloadCallback) {
    this.storage = storage;
    this.characterController = characterController;
    this.artworkManager = artworkManager;
    this.onEditCallback = onEditCallback;
    this.onReloadCallback = onReloadCallback;
    this.currentFilter = 'all';

    this.createDOM();
    this.attachEvents();
  }

  createDOM() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay hidden';
    this.overlay.id = 'galleryManagerModal';

    this.overlay.innerHTML = `
      <div class="modal-card wide-card">
        <div class="modal-header">
          <div class="modal-title">
            <span class="modal-icon">📖</span>
            <div>
              <h3>Bizning Sevgi Albomimiz (Barcha Rasmlar)</h3>
              <p>Xona devorlaridagi barcha xotiralarni ko'ring, tahrirlang yoki qizcha bilan yoniga boring</p>
            </div>
          </div>
          <button class="modal-close" id="closeGalleryModal">&times;</button>
        </div>

        <div class="gallery-toolbar">
          <div class="gallery-tabs">
            <button class="tab-btn active" data-filter="all">Barchasi (22)</button>
            <button class="tab-btn" data-filter="north">Shimoliy Devor</button>
            <button class="tab-btn" data-filter="south">Janubiy Devor</button>
            <button class="tab-btn" data-filter="west">G'arbiy Devor</button>
            <button class="tab-btn" data-filter="east">Sharqiy Devor</button>
          </div>

          <div class="gallery-tools">
            <button class="btn btn-sm btn-secondary" id="btnExportGallery" title="Albomni saqlab olish">
              💾 Zaxiralash (Export)
            </button>
            <label class="btn btn-sm btn-secondary" title="Fayldan yuklash">
              📥 Tiklash (Import)
              <input type="file" id="importJsonInput" accept=".json" style="display:none;" />
            </label>
          </div>
        </div>

        <div class="modal-body scrollable-body">
          <div class="gallery-grid" id="galleryGrid"></div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    this.galleryGrid = document.getElementById('galleryGrid');
    this.importJsonInput = document.getElementById('importJsonInput');
  }

  attachEvents() {
    document.getElementById('closeGalleryModal').addEventListener('click', () => this.close());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    const tabs = this.overlay.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentFilter = tab.dataset.filter;
        this.renderGrid();
      });
    });

    document.getElementById('btnExportGallery').addEventListener('click', async () => {
      await this.storage.exportGalleryJSON();
    });

    this.importJsonInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            await this.storage.importGalleryJSON(event.target.result);
            alert('Albom muvaffaqiyatli tiklandi!');
            if (this.onReloadCallback) await this.onReloadCallback();
            this.renderGrid();
          } catch (err) {
            alert('Import qilishda xatolik yuz berdi!');
          }
        };
        reader.readAsText(file);
      }
    });
  }

  async open() {
    soundManager.playClick();
    await this.renderGrid();
    this.overlay.classList.remove('hidden');
  }

  close() {
    this.overlay.classList.add('hidden');
  }

  async renderGrid() {
    const all = await this.storage.getAll();
    let filtered = all;

    if (this.currentFilter === 'north') {
      filtered = all.filter(a => a.slotIndex >= 0 && a.slotIndex <= 5);
    } else if (this.currentFilter === 'south') {
      filtered = all.filter(a => a.slotIndex >= 6 && a.slotIndex <= 11);
    } else if (this.currentFilter === 'west') {
      filtered = all.filter(a => a.slotIndex >= 12 && a.slotIndex <= 16);
    } else if (this.currentFilter === 'east') {
      filtered = all.filter(a => a.slotIndex >= 17 && a.slotIndex <= 21);
    }

    this.galleryGrid.innerHTML = '';

    filtered.forEach(art => {
      const card = document.createElement('div');
      card.className = 'gallery-card';

      const slot = this.artworkManager.getSlot(art.slotIndex);
      const wallName = slot ? slot.wall : `Ramka #${(art.slotIndex ?? 0) + 1}`;

      card.innerHTML = `
        <div class="card-thumb">
          <img src="${art.imageUrl}" alt="${art.title}" loading="lazy" />
          <span class="card-room-tag">${wallName}</span>
        </div>
        <div class="card-body">
          <h4 title="${art.title}">${art.title}</h4>
          <p class="card-sub">${art.artist || 'Biz Ikkovimiz 💕'} • ${art.year || '2026'}</p>
        </div>
        <div class="card-actions">
          <button class="btn btn-xs btn-primary btn-teleport" data-id="${art.id}">
            🚶 Yoniga borish
          </button>
          <button class="btn btn-xs btn-secondary btn-edit" data-id="${art.id}">
            ✏️
          </button>
        </div>
      `;

      card.querySelector('.btn-teleport').addEventListener('click', () => {
        this.teleportToArtwork(art);
      });

      card.querySelector('.btn-edit').addEventListener('click', () => {
        this.close();
        if (this.onEditCallback) {
          this.onEditCallback(art);
        }
      });

      this.galleryGrid.appendChild(card);
    });
  }

  teleportToArtwork(art) {
    const slot = this.artworkManager.getSlot(art.slotIndex);
    if (slot && this.characterController) {
      let targetX = slot.position.x;
      let targetZ = slot.position.z;
      let lookAngle = slot.rotationY + Math.PI;

      if (slot.rotationY === 0) targetZ += 2.2;
      else if (slot.rotationY === Math.PI) targetZ -= 2.2;
      else if (slot.rotationY === Math.PI / 2) targetX += 2.2;
      else if (slot.rotationY === -Math.PI / 2) targetX -= 2.2;

      this.characterController.teleportTo(targetX, targetZ, lookAngle);
      soundManager.playClick();
      this.close();
    }
  }
}
