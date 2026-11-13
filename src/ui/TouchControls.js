export class TouchControls {
  constructor(characterController, onInteractCallback) {
    this.characterController = characterController;
    this.onInteractCallback = onInteractCallback;

    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024;
    this.scrollActive = false;
    this.scrollOrigin = { x: 0, y: 0 };
    this.touchIdentifier = null;

    this.createDOM();
    this.attachEvents();
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.className = 'touch-controls-container';
    this.container.id = 'touchControls';

    this.container.innerHTML = `
      <!-- Left: Touch Scroll / Movement Pad -->
      <div class="touch-scroll-area" id="touchScrollArea">
        <div class="scroll-pad-base" id="scrollPadBase">
          <div class="scroll-pad-knob" id="scrollPadKnob"></div>
          <div class="scroll-hint-label">Surish (Yurish)</div>
        </div>
      </div>

      <!-- Right: Action Buttons -->
      <div class="touch-actions">
        <button class="touch-btn touch-btn-heart" id="touchBtnHeart" title="Zulfiya yurakcha ko'rsatishi">
          <span>❤️</span>
          <small>Yurakcha</small>
        </button>
        <button class="touch-btn touch-btn-jump" id="touchBtnJump" title="Sakrash">
          <span>🦘</span>
          <small>Sakrash</small>
        </button>
        <button class="touch-btn touch-btn-interact" id="touchBtnInteract" title="Rasmni ko'rish">
          <span>👁️</span>
          <small>Ko'rish</small>
        </button>
      </div>
    `;

    document.body.appendChild(this.container);

    this.touchScrollArea = document.getElementById('touchScrollArea');
    this.scrollPadBase = document.getElementById('scrollPadBase');
    this.scrollPadKnob = document.getElementById('scrollPadKnob');
    this.btnHeart = document.getElementById('touchBtnHeart');
    this.btnJump = document.getElementById('touchBtnJump');
    this.btnInteract = document.getElementById('touchBtnInteract');
  }

  attachEvents() {
    // Touch Scroll Movement
    const onStart = (clientX, clientY, id = null) => {
      this.scrollActive = true;
      this.touchIdentifier = id;
      const rect = this.scrollPadBase.getBoundingClientRect();
      this.scrollOrigin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      this.updateMovement(clientX, clientY);
    };

    const onMove = (clientX, clientY) => {
      if (!this.scrollActive) return;
      this.updateMovement(clientX, clientY);
    };

    const onEnd = () => {
      this.scrollActive = false;
      this.touchIdentifier = null;
      this.scrollPadKnob.style.transform = 'translate(0px, 0px)';
      this.characterController.setTouchInput(0, 0);
    };

    // Touch events for mobile
    this.touchScrollArea.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      onStart(touch.clientX, touch.clientY, touch.identifier);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.scrollActive) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.touchIdentifier) {
          onMove(touch.clientX, touch.clientY);
        }
      }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      if (!this.scrollActive) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.touchIdentifier) {
          onEnd();
        }
      }
    });

    window.addEventListener('touchcancel', () => onEnd());

    // Action buttons
    this.btnHeart.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.characterController.triggerHeartEmote();
    }, { passive: false });
    this.btnHeart.addEventListener('click', (e) => {
      e.stopPropagation();
      this.characterController.triggerHeartEmote();
    });

    this.btnJump.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.characterController.touchJump();
    }, { passive: false });
    this.btnJump.addEventListener('click', (e) => {
      e.stopPropagation();
      this.characterController.touchJump();
    });

    this.btnInteract.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.onInteractCallback) {
        this.onInteractCallback();
      }
    }, { passive: false });
    this.btnInteract.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.onInteractCallback) {
        this.onInteractCallback();
      }
    });
  }

  updateMovement(clientX, clientY) {
    const dx = clientX - this.scrollOrigin.x;
    const dy = clientY - this.scrollOrigin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 55;

    let clampedX = dx;
    let clampedY = dy;

    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius;
      clampedY = (dy / dist) * maxRadius;
    }

    this.scrollPadKnob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;

    // Normalized input vector
    const normX = clampedX / maxRadius;
    const normY = clampedY / maxRadius;
    this.characterController.setTouchInput(normX, normY);
  }
}
