import confetti from 'canvas-confetti';
import { soundManager } from '../museum/SoundManager.js';

export class LockScreen {
  constructor(onUnlockCallback) {
    this.onUnlockCallback = onUnlockCallback;
    this.isUnlocked = false;

    this.createDOM();
    this.attachEvents();
  }

  createDOM() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'lock-screen-overlay';
    this.overlay.id = 'lockScreen';

    this.overlay.innerHTML = `
      <div class="lock-card">
        <div class="lock-heart-icon">💖</div>

        <h2 class="lock-title">Bizning Sevgi Muzeyimiz</h2>
        <p class="lock-subtitle">Ushbu maskan faqat senga — sevikli Zulfiyamga atalgan... 🌹</p>

        <div class="lock-prompt">
          <label for="datePasswordInput">Muzeyga kirish uchun qadrli sanamizni kiriting:</label>
          <div class="lock-input-wrapper">
            <input 
              type="text" 
              id="datePasswordInput" 
              placeholder="yozing" 
              autocomplete="off"
            />
            <button type="button" class="btn-lock-submit" id="btnUnlock">
              <span>Ochish</span> 🗝️
            </button>
          </div>
          <div class="lock-error-msg hidden" id="lockErrorMsg">
            Kechirasiz, sana noto'g'ri... Bizning qadrli kunimizni eslang 💕
          </div>
        </div>

        <div class="lock-hint-container">
          <button type="button" class="btn-hint-toggle" id="btnHintToggle">
            💡 Maslahat olish
          </button>
          <p class="lock-hint-text hidden" id="lockHintText">
            Biz uchun unutilmas kun: <strong>11-noyabr 2026-yil</strong> (11.11.2026) ❤️
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    this.input = document.getElementById('datePasswordInput');
    this.btnUnlock = document.getElementById('btnUnlock');
    this.errorMsg = document.getElementById('lockErrorMsg');
    this.card = this.overlay.querySelector('.lock-card');
    this.btnHintToggle = document.getElementById('btnHintToggle');
    this.hintText = document.getElementById('lockHintText');
  }

  attachEvents() {
    this.btnUnlock.addEventListener('click', () => this.validatePassword());

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.validatePassword();
      }
    });

    this.btnHintToggle.addEventListener('click', () => {
      this.hintText.classList.toggle('hidden');
    });

    // Autofocus input
    setTimeout(() => {
      if (this.input) this.input.focus();
    }, 400);
  }

  validatePassword() {
    const val = this.input.value.trim().toLowerCase();

    // Normalize input: remove extra spaces, hyphens, dots, "yil"
    // Valid target: 11-noyabr 2026yil
    const normalized = val
      .replace(/[\s\-\.\/\_]/g, '')
      .replace(/yil/g, '');

    // Acceptable normalized variants:
    // "11noyabr2026", "11112026", "20261111"
    const isValid = 
      normalized === '11noyabr2026' ||
      normalized === '11112026' ||
      normalized === '20261111' ||
      val.includes('11') && val.includes('noyabr') && val.includes('2026');

    if (isValid) {
      this.handleSuccess();
    } else {
      this.handleError();
    }
  }

  handleSuccess() {
    this.isUnlocked = true;
    soundManager.init();
    soundManager.playSuccessChime();

    // Heart explosion confetti
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#ec4899', '#fda4af', '#fbbf24', '#ffffff']
    });

    this.card.innerHTML = `
      <div class="lock-heart-icon unlocked-anim">🌹</div>
      <h2 class="lock-title">Xush kelibsiz, Zulfiyam! 💖</h2>
      <p class="lock-subtitle">To'g'ri topdingiz! Ushbu muzeydagi har bir surat va lahza faqat siz uchun...</p>
      <div class="lock-welcome-badge">Muzey eshiklari ochilmoqda... ✨</div>
    `;

    setTimeout(() => {
      this.overlay.classList.add('lock-fade-out');
      // Auto-start romantic ambient music upon unlocking
      soundManager.startAmbientMusic();

      setTimeout(() => {
        this.overlay.remove();
        if (this.onUnlockCallback) {
          this.onUnlockCallback();
        }
      }, 700);
    }, 1500);
  }

  handleError() {
    soundManager.init();
    this.errorMsg.classList.remove('hidden');
    this.card.classList.add('shake-card');

    setTimeout(() => {
      this.card.classList.remove('shake-card');
    }, 500);

    this.input.select();
  }
}
