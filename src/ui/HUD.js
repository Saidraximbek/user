import { soundManager } from '../museum/SoundManager.js';

export class HUD {
  constructor(characterController, artworkManager, sceneManager, callbacks) {
    this.characterController = characterController;
    this.artworkManager = artworkManager;
    this.sceneManager = sceneManager;
    this.callbacks = callbacks;
    this.isMenuOpen = false;
    this.isMinimapOpen = false;

    this.createDOM();
    this.setupMinimap();
    this.attachEvents();
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.className = 'hud-container';
    this.container.id = 'hud';

    this.container.innerHTML = `
      <!-- Sleek Compact Top Bar -->
      <header class="hud-top-bar">
        <!-- Brand Title Pill -->
        <div class="hud-brand-compact">
          <span class="hud-logo">💖</span>
          <span class="hud-title-text">Zulfiya & Men</span>
        </div>

        <!-- Single Dropdown Menu Button -->
        <div class="hud-menu-container">
          <button class="btn-menu-trigger" id="btnMenuTrigger" aria-label="Menyu">
            <span class="menu-icon">☰</span>
            <span class="menu-label">Menyu</span>
          </button>

          <!-- Floating Dropdown Glass Menu -->
          <div class="menu-dropdown hidden" id="menuDropdown">
            <div class="dropdown-header">
              <span>🌸 Sozlamalar & Bo'limlar</span>
            </div>

            <div class="dropdown-items">
              <button class="dropdown-item" id="menuItemUpload">
                <span class="item-icon">📸</span>
                <div class="item-text">
                  <strong>Rasm Joylash</strong>
                  <small>Yangi fotosurat yuklash</small>
                </div>
              </button>

              <button class="dropdown-item" id="menuItemGallery">
                <span class="item-icon">📖</span>
                <div class="item-text">
                  <strong>Xotiralar Albomi</strong>
                  <small>Barcha 22 ta suratlar</small>
                </div>
              </button>

              <button class="dropdown-item" id="menuItemMinimap">
                <span class="item-icon">🗺️</span>
                <div class="item-text">
                  <strong>Xona Xaritasi</strong>
                  <small>Qayerdaligingizni ko'rish</small>
                </div>
              </button>

              <button class="dropdown-item" id="menuItemMusic">
                <span class="item-icon" id="menuMusicIcon">🎵</span>
                <div class="item-text">
                  <strong id="menuMusicText">Romantik Musiqa</strong>
                  <small id="menuMusicSub">Yoqish / O'chirish</small>
                </div>
              </button>

              <button class="dropdown-item" id="menuItemLighting">
                <span class="item-icon" id="menuLightingIcon">☀️</span>
                <div class="item-text">
                  <strong>Yoritish Rejimi</strong>
                  <small id="menuLightingText">Kunduzgi quyosh</small>
                </div>
              </button>

              <button class="dropdown-item" id="menuItemCamera">
                <span class="item-icon">📷</span>
                <div class="item-text">
                  <strong>Kamera Ko'rinishi</strong>
                  <small>3-shaxs / Qizcha nigohi</small>
                </div>
              </button>

              <button class="dropdown-item" id="menuItemHelp">
                <span class="item-icon">❓</span>
                <div class="item-text">
                  <strong>Qo'llanma</strong>
                  <small>Qanday boshqariladi?</small>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Minimap Popup Dialog (Opens only when chosen in dropdown) -->
      <div class="minimap-modal-overlay hidden" id="minimapModal">
        <div class="minimap-popup">
          <div class="minimap-popup-header">
            <span>🗺️ Xona Xaritasi</span>
            <button class="modal-close" id="closeMinimapModal">&times;</button>
          </div>
          <div class="minimap-popup-body">
            <canvas id="minimapCanvas" width="220" height="190"></canvas>
            <div class="minimap-fast-travel">
              <button class="travel-btn" data-target="center">❤️ Markaz</button>
              <button class="travel-btn" data-target="north">Shimoliy Devor</button>
              <button class="travel-btn" data-target="south">Janubiy Devor</button>
              <button class="travel-btn" data-target="west">G'arbiy Devor</button>
              <button class="travel-btn" data-target="east">Sharqiy Devor</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Proximity Action Pill (Bottom Center) -->
      <div class="proximity-pill hidden" id="proximityPill">
        <div class="proximity-content">
          <span class="proximity-icon">💖</span>
          <div class="proximity-text">
            <strong id="proximityTitle">Bizning Xotiramiz</strong>
            <small>Yaqindan ko'rish yoki rasm qo'yish uchun [E] bosing</small>
          </div>
          <button class="btn btn-sm btn-primary" id="btnProximityInspect">
            Ko'rish
          </button>
        </div>
      </div>

      <!-- Controls Guide Modal -->
      <div class="modal-overlay hidden" id="helpModal">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">
              <span class="modal-icon">🌹</span>
              <div>
                <h3>Zulfiya bilan Sevgi Muzeyi</h3>
                <p>Sevganingizga bag'ishlangan eng samimiy sovg'a</p>
              </div>
            </div>
            <button class="modal-close" id="closeHelpModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="controls-list">
              <div class="control-row">
                <div class="keys-badge">
                  <span class="key">📱 Telefon</span>
                </div>
                <div class="control-desc">Chapdagi aylanani barmog'ingiz bilan suring — Zulfiya yuradi!</div>
              </div>

              <div class="control-row">
                <div class="keys-badge">
                  <span class="key">❤️ Tugma</span>
                </div>
                <div class="control-desc">Zulfiya yurakcha ko'rsatib, mehr ulashadi</div>
              </div>

              <div class="control-row">
                <div class="keys-badge">
                  <span class="key">👁️ Tugma</span>
                </div>
                <div class="control-desc">Rasm yonida turib bossangiz, rasmni to'liq ochadi</div>
              </div>

              <div class="control-row">
                <div class="keys-badge">
                  <span class="key">W A S D</span>
                </div>
                <div class="control-desc">Kompyuterda qizchani harakatlantirish</div>
              </div>

              <div class="control-row">
                <div class="keys-badge">
                  <span class="key">H yoki G</span>
                </div>
                <div class="control-desc">Klaviaturada yurakcha ko'rsatish</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="btnUnderstandHelp">Tushunarli</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.btnMenuTrigger = document.getElementById('btnMenuTrigger');
    this.menuDropdown = document.getElementById('menuDropdown');
    this.proximityPill = document.getElementById('proximityPill');
    this.proximityTitle = document.getElementById('proximityTitle');
    this.btnProximityInspect = document.getElementById('btnProximityInspect');
    this.helpModal = document.getElementById('helpModal');
    this.minimapModal = document.getElementById('minimapModal');
    this.minimapCanvas = document.getElementById('minimapCanvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');
    this.menuMusicIcon = document.getElementById('menuMusicIcon');
    this.menuMusicText = document.getElementById('menuMusicText');
    this.menuLightingIcon = document.getElementById('menuLightingIcon');
    this.menuLightingText = document.getElementById('menuLightingText');
  }

  setupMinimap() {
    this.mapW = 220;
    this.mapH = 190;
    this.worldMinX = -15;
    this.worldMaxX = 15;
    this.worldMinZ = -13;
    this.worldMaxZ = 13;
  }

  attachEvents() {
    // Dropdown toggle
    this.btnMenuTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      soundManager.playClick();
      this.toggleMenu();
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!this.menuDropdown.contains(e.target) && e.target !== this.btnMenuTrigger) {
        this.closeMenu();
      }
    });

    // Menu Item: Upload
    document.getElementById('menuItemUpload').addEventListener('click', () => {
      this.closeMenu();
      if (this.callbacks.onOpenUpload) this.callbacks.onOpenUpload();
    });

    // Menu Item: Gallery
    document.getElementById('menuItemGallery').addEventListener('click', () => {
      this.closeMenu();
      if (this.callbacks.onOpenGallery) this.callbacks.onOpenGallery();
    });

    // Menu Item: Minimap Modal
    document.getElementById('menuItemMinimap').addEventListener('click', () => {
      this.closeMenu();
      this.openMinimap();
    });

    document.getElementById('closeMinimapModal').addEventListener('click', () => {
      this.closeMinimap();
    });

    this.minimapModal.addEventListener('click', (e) => {
      if (e.target === this.minimapModal) this.closeMinimap();
    });

    // Menu Item: Music
    document.getElementById('menuItemMusic').addEventListener('click', () => {
      const isPlaying = soundManager.toggleMusic();
      this.menuMusicIcon.textContent = isPlaying ? '🔊' : '🔇';
      this.menuMusicText.textContent = isPlaying ? 'Musiqa: Yangramoqda' : 'Musiqa: O\'chirilgan';
    });

    // Menu Item: Lighting
    document.getElementById('menuItemLighting').addEventListener('click', () => {
      soundManager.playClick();
      const moods = ['day', 'sunset', 'night'];
      const nextIdx = (moods.indexOf(this.sceneManager.currentMood) + 1) % moods.length;
      const nextMood = moods[nextIdx];
      this.sceneManager.setLightingMood(nextMood);

      const labels = {
        day: { icon: '☀️', text: 'Kunduzgi quyosh' },
        sunset: { icon: '🌅', text: 'Shom (Oltin soat)' },
        night: { icon: '🌙', text: 'Romantik Tun' }
      };
      this.menuLightingIcon.textContent = labels[nextMood].icon;
      this.menuLightingText.textContent = labels[nextMood].text;
    });

    // Menu Item: Camera
    document.getElementById('menuItemCamera').addEventListener('click', () => {
      soundManager.playClick();
      this.characterController.toggleCameraMode();
      this.closeMenu();
    });

    // Menu Item: Help
    document.getElementById('menuItemHelp').addEventListener('click', () => {
      soundManager.playClick();
      this.closeMenu();
      this.helpModal.classList.remove('hidden');
    });

    document.getElementById('closeHelpModal').addEventListener('click', () => {
      this.helpModal.classList.add('hidden');
    });

    document.getElementById('btnUnderstandHelp').addEventListener('click', () => {
      this.helpModal.classList.add('hidden');
    });

    this.helpModal.addEventListener('click', (e) => {
      if (e.target === this.helpModal) this.helpModal.classList.add('hidden');
    });

    // Proximity inspect button
    this.btnProximityInspect.addEventListener('click', () => {
      if (this.nearestArtwork && this.callbacks.onInspect) {
        this.callbacks.onInspect(this.nearestArtwork);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (this.nearestArtwork && this.callbacks.onInspect) {
          this.callbacks.onInspect(this.nearestArtwork);
        }
      }
    });

    // Minimap fast travel
    const travelBtns = this.minimapModal.querySelectorAll('.travel-btn');
    travelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        soundManager.playClick();
        const target = btn.dataset.target;
        if (target === 'center') {
          this.characterController.teleportTo(0, -4, 0);
        } else if (target === 'north') {
          this.characterController.teleportTo(0, -9, 0);
        } else if (target === 'south') {
          this.characterController.teleportTo(0, 9, Math.PI);
        } else if (target === 'west') {
          this.characterController.teleportTo(-11, 0, Math.PI / 2);
        } else if (target === 'east') {
          this.characterController.teleportTo(11, 0, -Math.PI / 2);
        }
        this.closeMinimap();
      });
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.menuDropdown.classList.toggle('hidden', !this.isMenuOpen);
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.menuDropdown.classList.add('hidden');
  }

  openMinimap() {
    this.isMinimapOpen = true;
    this.minimapModal.classList.remove('hidden');
  }

  closeMinimap() {
    this.isMinimapOpen = false;
    this.minimapModal.classList.add('hidden');
  }

  update(characterPos, nearestArtwork, facingAngle) {
    this.nearestArtwork = nearestArtwork;

    if (nearestArtwork) {
      this.proximityTitle.textContent = nearestArtwork.title;
      this.proximityPill.classList.remove('hidden');
    } else {
      this.proximityPill.classList.add('hidden');
    }

    if (this.isMinimapOpen) {
      this.drawMinimap(characterPos, facingAngle);
    }
  }

  worldToMap(x, z) {
    const pad = 14;
    const drawW = this.mapW - pad * 2;
    const drawH = this.mapH - pad * 2;

    const normX = (x - this.worldMinX) / (this.worldMaxX - this.worldMinX);
    const normZ = (z - this.worldMinZ) / (this.worldMaxZ - this.worldMinZ);

    return {
      x: pad + normX * drawW,
      y: pad + normZ * drawH
    };
  }

  drawMinimap(playerPos, facingAngle) {
    const ctx = this.minimapCtx;
    ctx.clearRect(0, 0, this.mapW, this.mapH);

    ctx.fillStyle = '#170918';
    ctx.fillRect(0, 0, this.mapW, this.mapH);

    const pTopLeft = this.worldToMap(-14, -12);
    const pBottomRight = this.worldToMap(14, 12);
    const roomW = pBottomRight.x - pTopLeft.x;
    const roomH = pBottomRight.y - pTopLeft.y;

    ctx.fillStyle = '#261327';
    ctx.fillRect(pTopLeft.x, pTopLeft.y, roomW, roomH);

    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.strokeRect(pTopLeft.x, pTopLeft.y, roomW, roomH);

    // Center Twin Hearts
    const pCenter = this.worldToMap(0, 0);
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❤️', pCenter.x, pCenter.y);

    // Artwork markers
    this.artworkManager.artworks.forEach(art => {
      const pos = this.worldToMap(art.mesh.position.x, art.mesh.position.z);
      ctx.fillStyle = art.data.isUserUploaded ? '#f43f5e' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Player (Zulfiya)
    const p = this.worldToMap(playerPos.x, playerPos.z);

    // View cone
    ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    const angle = facingAngle + Math.PI / 2;
    ctx.arc(p.x, p.y, 20, angle - 0.45, angle + 0.45);
    ctx.closePath();
    ctx.fill();

    // Player marker
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
