import confetti from 'canvas-confetti';
import { soundManager } from '../museum/SoundManager.js';

export class UploadModal {
  constructor(storage, artworkManager, characterController, onUpdateCallback) {
    this.storage = storage;
    this.artworkManager = artworkManager;
    this.characterController = characterController;
    this.onUpdateCallback = onUpdateCallback;
    this.selectedImageData = null;
    this.targetSlotIndex = null;
    this.targetArtworkId = null;

    this.createDOM();
    this.attachEvents();
  }

  createDOM() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay hidden';
    this.overlay.id = 'uploadModal';

    this.overlay.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title">
            <span class="modal-icon">💖</span>
            <div>
              <h3>Bizning Xotiramizni Devorga Joylash</h3>
              <p>Sevganingiz bilan tushgan fotosuratingizni tanlang va qadrdon xotirangizni saqlang</p>
            </div>
          </div>
          <button class="modal-close" id="closeUploadModal">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Drop Area -->
          <div class="upload-dropzone" id="dropzone">
            <input type="file" id="fileInput" accept="image/*" multiple style="display:none;" />
            <div id="dropzoneContent">
              <div class="drop-icon">📸</div>
              <h4>Rasmlarni bu yerga tashlang yoki bosing</h4>
              <p>Bir yoki bir nechta rasmni tanlashingiz mumkin (JPG, PNG, WEBP)</p>
              <div class="bulk-tip">💡 Bir vaqtning o'zida bir nechta rasm tanlasangiz, xonadagi ramkalarga ketma-ket joylanadi!</div>
            </div>
            <div id="previewContainer" class="preview-container hidden">
              <img id="imagePreview" alt="Oldindan ko'rish" />
              <button type="button" class="btn-change-image" id="btnChangeImage">Boshqa rasm tanlash</button>
            </div>
          </div>

          <!-- Form Details -->
          <form id="uploadForm" class="upload-form">
            <div class="form-group">
              <label for="artTitle">Surat Nomi yoki Sevgi So'zlari *</label>
              <input type="text" id="artTitle" placeholder="Masalan: Ilk uchrashuvimiz, Shirin lahzamiz, Doimo birgamiz..." required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="artArtist">Kimga / Kimdan</label>
                <input type="text" id="artArtist" placeholder="Masalan: Jonimga, Biz Ikkovimiz" />
              </div>
              <div class="form-group">
                <label for="artYear">Sana / Yil</label>
                <input type="text" id="artYear" placeholder="2026" />
              </div>
            </div>

            <div class="form-group">
              <label for="artDesc">Shirin Xotira yoki Dildagi So'zlar</label>
              <textarea id="artDesc" rows="2" placeholder="Ushbu lahza qanday xotira qoldirgan? Sevganingizga aytmoqchi bo'lgan so'zlaringiz..."></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="artSlotSelect">Devordagi Ramka O'rni</label>
                <select id="artSlotSelect">
                  <!-- Populated dynamically: 1 to 22 -->
                </select>
              </div>

              <div class="form-group">
                <label for="artFrameStyle">Ramka Uslubi</label>
                <select id="artFrameStyle">
                  <option value="classic-gold" selected>👑 Oltin Naqshli Ramka</option>
                  <option value="neon-glow">💖 Yorqin Atirgul Neon Ramka</option>
                  <option value="vintage-wood">🪵 Qadimiy Yong'oq Yog'ochi</option>
                  <option value="modern-black">🖤 Nafis Qora Ramka</option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="cancelUpload">Bekor qilish</button>
              <button type="submit" class="btn btn-primary" id="submitUpload">
                <span>🌹</span> Devorga Joylash
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    this.dropzone = document.getElementById('dropzone');
    this.fileInput = document.getElementById('fileInput');
    this.dropzoneContent = document.getElementById('dropzoneContent');
    this.previewContainer = document.getElementById('previewContainer');
    this.imagePreview = document.getElementById('imagePreview');
    this.btnChangeImage = document.getElementById('btnChangeImage');
    this.uploadForm = document.getElementById('uploadForm');
    this.artTitle = document.getElementById('artTitle');
    this.artArtist = document.getElementById('artArtist');
    this.artYear = document.getElementById('artYear');
    this.artDesc = document.getElementById('artDesc');
    this.artSlotSelect = document.getElementById('artSlotSelect');
    this.artFrameStyle = document.getElementById('artFrameStyle');

    this.populateSlotOptions();
  }

  populateSlotOptions() {
    this.artSlotSelect.innerHTML = '';
    const slots = this.artworkManager.slots;
    slots.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.index;
      opt.textContent = `Ramka #${s.index + 1} (${s.wall})`;
      this.artSlotSelect.appendChild(opt);
    });
  }

  attachEvents() {
    document.getElementById('closeUploadModal').addEventListener('click', () => this.close());
    document.getElementById('cancelUpload').addEventListener('click', () => this.close());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.dropzoneContent.addEventListener('click', () => this.fileInput.click());
    this.btnChangeImage.addEventListener('click', (e) => {
      e.stopPropagation();
      this.fileInput.click();
    });

    this.fileInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        if (e.target.files.length > 1) {
          // Bulk upload multiple photos!
          await this.handleBulkFiles(Array.from(e.target.files));
        } else {
          this.handleSingleFile(e.target.files[0]);
        }
      }
    });

    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('drag-active');
    });

    this.dropzone.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('drag-active');
    });

    this.dropzone.addEventListener('drop', async (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('drag-active');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        if (e.dataTransfer.files.length > 1) {
          await this.handleBulkFiles(Array.from(e.dataTransfer.files));
        } else {
          this.handleSingleFile(e.dataTransfer.files[0]);
        }
      }
    });

    this.uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveSingleArtwork();
    });
  }

  handleSingleFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Iltimos, rasm faylini tanlang (JPG, PNG, WEBP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImageData = e.target.result;
      this.imagePreview.src = this.selectedImageData;
      this.dropzoneContent.classList.add('hidden');
      this.previewContainer.classList.remove('hidden');

      if (!this.artTitle.value) {
        const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        this.artTitle.value = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      }
      if (!this.artArtist.value) {
        this.artArtist.value = 'Bizning Sevgi Qissamiz';
      }
      if (!this.artYear.value) {
        this.artYear.value = new Date().getFullYear().toString();
      }
    };
    reader.readAsDataURL(file);
  }

  async handleBulkFiles(files) {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const count = imageFiles.length;
    if (!confirm(`Siz ${count} ta rasm tanladingiz!\nUlarni xonadagi ramkalarga ketma-ket joylashtiraylikmi?`)) {
      return;
    }

    const allArt = await this.storage.getAll();
    let startSlot = parseInt(this.artSlotSelect.value) || 0;

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const slotIndex = (startSlot + i) % 22;
      const dataUrl = await this.readFileAsDataURL(file);

      const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      const artData = {
        id: `art-user-slot-${slotIndex}`,
        slotIndex,
        title: title || `Shirin Lahzamiz #${slotIndex + 1}`,
        artist: 'Biz Ikkovimiz 💕',
        year: new Date().getFullYear().toString(),
        description: 'Mening eng sevimli insonim bilan o‘tgan betakror va quvonchli lahzalar.',
        frameStyle: (slotIndex % 2 === 0) ? 'classic-gold' : 'neon-glow',
        imageUrl: dataUrl,
        isUserUploaded: true,
        isPlaceholder: false,
        createdAt: Date.now() + i
      };

      await this.storage.save(artData);
    }

    soundManager.playSuccessChime();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });

    this.close();

    if (this.onUpdateCallback) {
      await this.onUpdateCallback();
    }

    alert(`🎉 Ajoyib! ${count} ta suratingiz xona devorlariga joylashtirildi!`);
  }

  readFileAsDataURL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  open(preselectedArtwork = null) {
    soundManager.playClick();
    this.populateSlotOptions();

    if (preselectedArtwork) {
      this.targetArtworkId = preselectedArtwork.id;
      this.artTitle.value = preselectedArtwork.title || '';
      this.artArtist.value = preselectedArtwork.artist || 'Biz Ikkovimiz';
      this.artYear.value = preselectedArtwork.year || '2026';
      this.artDesc.value = preselectedArtwork.description || '';
      this.artSlotSelect.value = preselectedArtwork.slotIndex !== undefined ? preselectedArtwork.slotIndex : 0;
      this.artFrameStyle.value = preselectedArtwork.frameStyle || 'classic-gold';

      if (preselectedArtwork.imageUrl && !preselectedArtwork.isPlaceholder) {
        this.selectedImageData = preselectedArtwork.imageUrl;
        this.imagePreview.src = this.selectedImageData;
        this.dropzoneContent.classList.add('hidden');
        this.previewContainer.classList.remove('hidden');
      } else {
        this.resetFilePreview();
      }
    } else {
      this.resetForm();
    }

    this.overlay.classList.remove('hidden');
  }

  resetFilePreview() {
    this.selectedImageData = null;
    this.imagePreview.src = '';
    this.dropzoneContent.classList.remove('hidden');
    this.previewContainer.classList.add('hidden');
    this.fileInput.value = '';
  }

  resetForm() {
    this.uploadForm.reset();
    this.resetFilePreview();
    this.targetArtworkId = null;
    this.artArtist.value = 'Biz Ikkovimiz 💕';
    this.artYear.value = new Date().getFullYear().toString();
    this.artFrameStyle.value = 'classic-gold';
  }

  close() {
    this.overlay.classList.add('hidden');
  }

  async saveSingleArtwork() {
    if (!this.selectedImageData) {
      alert('Iltimos, avval rasm tanlang!');
      return;
    }

    const slotIndex = parseInt(this.artSlotSelect.value) || 0;
    const id = this.targetArtworkId || `art-user-slot-${slotIndex}`;

    const artworkData = {
      id,
      slotIndex,
      title: this.artTitle.value.trim() || 'Bizning Shirin Lahzamiz 💖',
      artist: this.artArtist.value.trim() || 'Biz Ikkovimiz 💕',
      year: this.artYear.value.trim() || '2026',
      description: this.artDesc.value.trim() || 'Har bir lahzamiz sen bilan qadrli va takrorlanmas.',
      frameStyle: this.artFrameStyle.value,
      imageUrl: this.selectedImageData,
      isUserUploaded: true,
      isPlaceholder: false,
      createdAt: Date.now()
    };

    await this.storage.save(artworkData);

    soundManager.playSuccessChime();
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 }
    });

    this.close();

    if (this.onUpdateCallback) {
      await this.onUpdateCallback();
    }

    // Teleport prompt
    const slot = this.artworkManager.getSlot(slotIndex);
    if (slot && this.characterController) {
      let targetX = slot.position.x;
      let targetZ = slot.position.z;
      let lookAngle = slot.rotationY + Math.PI;

      if (slot.rotationY === 0) targetZ += 2.2;
      else if (slot.rotationY === Math.PI) targetZ -= 2.2;
      else if (slot.rotationY === Math.PI / 2) targetX += 2.2;
      else if (slot.rotationY === -Math.PI / 2) targetX -= 2.2;

      setTimeout(() => {
        if (confirm(`💖 "${artworkData.title}" surati ${slot.wall}ga joylashtirildi!\n\nQizcha bilan yangi rasm yoniga borishni xohlaysizmi?`)) {
          this.characterController.teleportTo(targetX, targetZ, lookAngle);
        }
      }, 300);
    }
  }
}
