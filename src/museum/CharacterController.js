import * as THREE from 'three';
import { soundManager } from './SoundManager.js';

export class CharacterController {
  constructor(character, camera, domElement, architecture) {
    this.character = character;
    this.camera = camera;
    this.domElement = domElement;
    this.architecture = architecture;

    // Movement state - start facing the Twin Hearts sculpture in center
    this.position = new THREE.Vector3(0, 0, -5.5);
    this.character.mesh.position.copy(this.position);

    this.velocity = new THREE.Vector3();
    this.walkSpeed = 4.0;
    this.runSpeed = 7.0;
    this.friction = 0.85;

    this.facingAngle = 0;
    this.targetFacingAngle = 0;

    // Jump physics
    this.isJumping = false;
    this.verticalVelocity = 0;
    this.jumpHeight = 0;
    this.gravity = -24;

    // Camera settings
    this.cameraMode = 'thirdPerson';
    this.camDistance = 4.2;
    this.camMinDist = 2.0;
    this.camMaxDist = 7.5;
    this.camPitch = 0.25;
    this.camYaw = 0;

    // Keys pressed
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false,
      heart: false
    };

    // Virtual touch input
    this.touchInput = { x: 0, y: 0 };

    this.isMouseDown = false;
    this.previousMousePos = { x: 0, y: 0 };

    this.initEventListeners();
  }

  initEventListeners() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    this.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0 || e.button === 2) {
        this.isMouseDown = true;
        this.previousMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isMouseDown) return;
      const dx = e.clientX - this.previousMousePos.x;
      const dy = e.clientY - this.previousMousePos.y;
      this.previousMousePos = { x: e.clientX, y: e.clientY };

      this.camYaw -= dx * 0.005;
      this.camPitch = Math.max(-0.2, Math.min(0.85, this.camPitch + dy * 0.005));
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    this.domElement.addEventListener('wheel', (e) => {
      this.camDistance = Math.max(this.camMinDist, Math.min(this.camMaxDist, this.camDistance + e.deltaY * 0.005));
    }, { passive: true });
  }

  onKeyDown(e) {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    soundManager.init();

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = true;
        break;
      case 'Space':
        if (!this.isJumping) {
          this.isJumping = true;
          this.verticalVelocity = 7.5;
        }
        e.preventDefault();
        break;
      case 'KeyC':
        this.toggleCameraMode();
        break;
      case 'KeyH':
      case 'KeyG':
        this.triggerHeartEmote();
        break;
    }
  }

  triggerHeartEmote() {
    this.keys.heart = true;
    soundManager.playSuccessChime();
    setTimeout(() => {
      this.keys.heart = false;
    }, 2800);
  }

  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = false;
        break;
    }
  }

  setTouchInput(x, y) {
    this.touchInput.x = x;
    this.touchInput.y = y;
  }

  touchJump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.verticalVelocity = 7.5;
    }
  }

  toggleCameraMode() {
    this.cameraMode = this.cameraMode === 'thirdPerson' ? 'firstPerson' : 'thirdPerson';
    this.character.mesh.visible = this.cameraMode === 'thirdPerson';
  }

  teleportTo(x, z, angle = 0) {
    this.position.set(x, 0, z);
    this.character.mesh.position.copy(this.position);
    this.facingAngle = angle;
    this.targetFacingAngle = angle;
    this.camYaw = angle;
    this.velocity.set(0, 0, 0);
  }

  update(delta) {
    const moveVector = new THREE.Vector3();

    if (this.keys.forward) moveVector.z -= 1;
    if (this.keys.backward) moveVector.z += 1;
    if (this.keys.left) moveVector.x -= 1;
    if (this.keys.right) moveVector.x += 1;

    if (Math.abs(this.touchInput.x) > 0.1 || Math.abs(this.touchInput.y) > 0.1) {
      moveVector.x += this.touchInput.x;
      moveVector.z += this.touchInput.y;
    }

    const isMoving = moveVector.lengthSq() > 0.01;
    const isRunning = this.keys.sprint && isMoving;

    if (isMoving) {
      moveVector.normalize();

      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camYaw);
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camYaw);

      const worldMove = new THREE.Vector3()
        .addScaledVector(right, moveVector.x)
        .addScaledVector(forward, -moveVector.z)
        .normalize();

      const speed = isRunning ? this.runSpeed : this.walkSpeed;
      this.velocity.x += worldMove.x * speed * delta * 8;
      this.velocity.z += worldMove.z * speed * delta * 8;

      this.targetFacingAngle = Math.atan2(worldMove.x, worldMove.z);
    }

    this.velocity.x *= Math.pow(this.friction, delta * 60);
    this.velocity.z *= Math.pow(this.friction, delta * 60);

    let angleDiff = this.targetFacingAngle - this.facingAngle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    this.facingAngle += angleDiff * 14 * delta;

    // Collision sliding
    const nextX = this.position.x + this.velocity.x * delta;
    const nextZ = this.position.z + this.velocity.z * delta;
    const radius = 0.38;

    if (!this.checkCollision(nextX, this.position.z, radius)) {
      this.position.x = nextX;
    } else {
      this.velocity.x = 0;
    }

    if (!this.checkCollision(this.position.x, nextZ, radius)) {
      this.position.z = nextZ;
    } else {
      this.velocity.z = 0;
    }

    // Jump
    if (this.isJumping) {
      this.verticalVelocity += this.gravity * delta;
      this.jumpHeight += this.verticalVelocity * delta;

      if (this.jumpHeight <= 0) {
        this.jumpHeight = 0;
        this.isJumping = false;
        this.verticalVelocity = 0;
      }
    }

    this.character.mesh.position.set(this.position.x, this.jumpHeight, this.position.z);

    this.character.update(delta, {
      isMoving,
      isRunning,
      isJumping: this.isJumping,
      jumpHeight: this.jumpHeight,
      facingAngle: this.facingAngle,
      isMakingHeart: this.keys.heart
    }, soundManager);

    this.updateCamera(delta);
  }

  checkCollision(x, z, radius) {
    const charBox = new THREE.Box3(
      new THREE.Vector3(x - radius, 0, z - radius),
      new THREE.Vector3(x + radius, 2.0, z + radius)
    );

    for (const collider of this.architecture.colliders) {
      if (collider.intersectsBox(charBox)) {
        return true;
      }
    }
    return false;
  }

  updateCamera(delta) {
    if (this.cameraMode === 'thirdPerson') {
      const targetLook = new THREE.Vector3(
        this.position.x,
        this.position.y + 1.25 + this.jumpHeight * 0.5,
        this.position.z
      );

      const offsetX = Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDistance;
      const offsetY = Math.sin(this.camPitch) * this.camDistance + 0.6;
      const offsetZ = Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDistance;

      const targetCamPos = new THREE.Vector3(
        targetLook.x + offsetX,
        targetLook.y + offsetY,
        targetLook.z + offsetZ
      );

      this.camera.position.lerp(targetCamPos, 14 * delta);
      this.camera.lookAt(targetLook);

    } else if (this.cameraMode === 'firstPerson') {
      const eyePos = new THREE.Vector3(
        this.position.x,
        this.position.y + 1.48 + this.jumpHeight,
        this.position.z
      );
      this.camera.position.copy(eyePos);

      const lookTarget = new THREE.Vector3(
        eyePos.x - Math.sin(this.camYaw) * 10,
        eyePos.y + Math.sin(-this.camPitch) * 10,
        eyePos.z - Math.cos(this.camYaw) * 10
      );
      this.camera.lookAt(lookTarget);
    }
  }
}
