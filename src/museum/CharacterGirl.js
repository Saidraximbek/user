import * as THREE from 'three';

/**
 * CharacterGirl: Modest, elegant Hijabi 3D avatar named "Zulfiya"
 * with gracefully draped hijab (ro'mol), modest dress, animated blinking eyes,
 * floating "🌸 Zulfiya 💖" name tag, and responsive walk/run/jump/heart animations.
 */
export class CharacterGirl {
  constructor() {
    this.mesh = new THREE.Group();
    this.mesh.name = 'ZulfiyaCharacter';

    // Animation timers
    this.walkCycle = 0;
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.heartTimer = 0;

    // Materials
    this.materials = this.createMaterials();

    // Build Zulfiya
    this.buildBody();

    // Floating 3D Name Tag: "🌸 Zulfiya 💖"
    this.buildNameTag();

    // Drop shadow
    this.createDropShadow();

    // Heart particles
    this.createHeartParticles();
  }

  createMaterials() {
    return {
      skin: new THREE.MeshStandardMaterial({
        color: 0xffdfd3,
        roughness: 0.55,
        metalness: 0.05
      }),
      blush: new THREE.MeshBasicMaterial({
        color: 0xfb7185,
        transparent: true,
        opacity: 0.65
      }),
      // Elegant Hijab materials (Soft romantic rose-pearl)
      hijabMain: new THREE.MeshStandardMaterial({
        color: 0xf472b6, // Soft pastel rose hijab
        roughness: 0.75,
        metalness: 0.05
      }),
      hijabInner: new THREE.MeshStandardMaterial({
        color: 0xffffff, // White under-cap/bonnet framing forehead
        roughness: 0.8
      }),
      hijabTrim: new THREE.MeshStandardMaterial({
        color: 0xfbcfe8, // Delicate lighter trim
        roughness: 0.6
      }),
      // Modest long dress / Abaya
      dress: new THREE.MeshStandardMaterial({
        color: 0x831843, // Elegant deep rose / berry maxi dress
        roughness: 0.75
      }),
      dressTrim: new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        roughness: 0.5
      }),
      beltGold: new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        metalness: 0.8,
        roughness: 0.2
      }),
      eyes: new THREE.MeshBasicMaterial({
        color: 0x0284c7 // Sparkly ocean blue
      }),
      eyeWhite: new THREE.MeshBasicMaterial({
        color: 0xffffff
      }),
      pupil: new THREE.MeshBasicMaterial({
        color: 0x0f172a
      }),
      eyeHighlight: new THREE.MeshBasicMaterial({
        color: 0xffffff
      }),
      mouth: new THREE.MeshBasicMaterial({
        color: 0xe11d48
      }),
      shoes: new THREE.MeshStandardMaterial({
        color: 0x1e1b4b,
        roughness: 0.3,
        metalness: 0.2
      }),
      bagLeather: new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.5
      }),
      bagStrap: new THREE.MeshStandardMaterial({
        color: 0x542307,
        roughness: 0.6
      })
    };
  }

  buildBody() {
    const m = this.materials;

    // Hips / Pelvis root
    this.hips = new THREE.Group();
    this.hips.position.y = 0.72;
    this.mesh.add(this.hips);

    // Torso group
    this.torso = new THREE.Group();
    this.hips.add(this.torso);

    // Upper Torso (Modest dress top)
    const torsoGeo = new THREE.CylinderGeometry(0.18, 0.17, 0.42, 16);
    this.torsoMesh = new THREE.Mesh(torsoGeo, m.dress);
    this.torsoMesh.position.y = 0.21;
    this.torsoMesh.castShadow = true;
    this.torso.add(this.torsoMesh);

    // Gold waist belt
    const beltGeo = new THREE.CylinderGeometry(0.182, 0.182, 0.04, 16);
    const belt = new THREE.Mesh(beltGeo, m.beltGold);
    belt.position.y = 0.08;
    this.torso.add(belt);

    // Modest Full-Length Maxi Skirt (Reaches down near ankles)
    const skirtGeo = new THREE.CylinderGeometry(0.18, 0.36, 0.68, 18);
    this.skirt = new THREE.Mesh(skirtGeo, m.dress);
    this.skirt.position.y = -0.28;
    this.skirt.castShadow = true;
    this.torso.add(this.skirt);

    // Lower skirt elegant trim
    const skirtTrimGeo = new THREE.TorusGeometry(0.35, 0.015, 8, 24);
    const skirtTrim = new THREE.Mesh(skirtTrimGeo, m.dressTrim);
    skirtTrim.rotation.x = Math.PI / 2;
    skirtTrim.position.y = -0.32;
    this.skirt.add(skirtTrim);

    // Cross-body satchel / camera bag
    const bagGeo = new THREE.BoxGeometry(0.14, 0.11, 0.06);
    const bag = new THREE.Mesh(bagGeo, m.bagLeather);
    bag.position.set(-0.2, 0.12, 0.09);
    bag.rotation.z = 0.2;
    bag.rotation.y = 0.3;
    bag.castShadow = true;
    this.torso.add(bag);

    const strapGeo = new THREE.TorusGeometry(0.24, 0.012, 6, 24);
    const strap = new THREE.Mesh(strapGeo, m.bagStrap);
    strap.rotation.y = Math.PI / 4;
    strap.rotation.x = 0.4;
    strap.position.set(0, 0.22, 0);
    this.torso.add(strap);

    // HEAD & HIJOB GROUP
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.46;
    this.torso.add(this.headGroup);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.1, 12);
    const neck = new THREE.Mesh(neckGeo, m.hijabMain);
    neck.position.y = 0.02;
    this.headGroup.add(neck);

    // Face mesh (framed modestly inside hijab)
    const faceGeo = new THREE.SphereGeometry(0.22, 24, 20);
    faceGeo.scale(1.0, 1.05, 0.95);
    this.faceMesh = new THREE.Mesh(faceGeo, m.skin);
    this.faceMesh.position.y = 0.22;
    this.faceMesh.castShadow = true;
    this.headGroup.add(this.faceMesh);

    // Face features (Eyes, blush, nose, smiling mouth)
    this.buildFace();

    // ELEGANT HIJAB (RO'MOL)
    this.buildHijab();

    // ARMS with full-length sleeves
    this.buildArms();

    // LEGS under maxi dress
    this.buildLegs();
  }

  buildFace() {
    const m = this.materials;

    // Blush cheeks
    const blushGeo = new THREE.CircleGeometry(0.038, 16);
    const leftBlush = new THREE.Mesh(blushGeo, m.blush);
    leftBlush.position.set(-0.095, 0.19, 0.215);
    leftBlush.rotation.y = -0.22;
    this.headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, m.blush);
    rightBlush.position.set(0.095, 0.19, 0.215);
    rightBlush.rotation.y = 0.22;
    this.headGroup.add(rightBlush);

    // Eyes Group
    this.eyesGroup = new THREE.Group();
    this.headGroup.add(this.eyesGroup);

    const buildEye = (isLeft) => {
      const eyeGroup = new THREE.Group();
      const sign = isLeft ? -1 : 1;

      // Sclera
      const whiteGeo = new THREE.PlaneGeometry(0.065, 0.072);
      const white = new THREE.Mesh(whiteGeo, m.eyeWhite);
      eyeGroup.add(white);

      // Iris (bright ocean blue)
      const irisGeo = new THREE.CircleGeometry(0.028, 16);
      const iris = new THREE.Mesh(irisGeo, m.eyes);
      iris.position.z = 0.001;
      eyeGroup.add(iris);

      // Pupil
      const pupilGeo = new THREE.CircleGeometry(0.016, 14);
      const pupil = new THREE.Mesh(pupilGeo, m.pupil);
      pupil.position.z = 0.002;
      eyeGroup.add(pupil);

      // Specular highlights
      const hlGeo1 = new THREE.CircleGeometry(0.009, 10);
      const hl1 = new THREE.Mesh(hlGeo1, m.eyeHighlight);
      hl1.position.set(0.008, 0.01, 0.003);
      eyeGroup.add(hl1);

      const hlGeo2 = new THREE.CircleGeometry(0.005, 8);
      const hl2 = new THREE.Mesh(hlGeo2, m.eyeHighlight);
      hl2.position.set(-0.008, -0.008, 0.003);
      eyeGroup.add(hl2);

      // Upper eyelash
      const lashGeo = new THREE.BoxGeometry(0.07, 0.012, 0.01);
      const lash = new THREE.Mesh(lashGeo, m.pupil);
      lash.position.set(0, 0.038, 0.004);
      eyeGroup.add(lash);

      eyeGroup.position.set(sign * 0.078, 0.23, 0.218);
      eyeGroup.rotation.y = sign * 0.2;
      return eyeGroup;
    };

    this.leftEye = buildEye(true);
    this.rightEye = buildEye(false);
    this.eyesGroup.add(this.leftEye);
    this.eyesGroup.add(this.rightEye);

    // Cute nose
    const noseGeo = new THREE.SphereGeometry(0.013, 8, 8);
    const nose = new THREE.Mesh(noseGeo, m.skin);
    nose.position.set(0, 0.19, 0.228);
    this.headGroup.add(nose);

    // Friendly, polite smiling mouth
    const mouthGeo = new THREE.TorusGeometry(0.02, 0.005, 8, 12, Math.PI);
    const mouth = new THREE.Mesh(mouthGeo, m.mouth);
    mouth.position.set(0, 0.15, 0.222);
    mouth.rotation.x = Math.PI;
    mouth.rotation.z = Math.PI;
    this.headGroup.add(mouth);
  }

  buildHijab() {
    const m = this.materials;

    // 1. Inner Bonnet / Under-cap (White band gracefully framing forehead)
    const bonnetGeo = new THREE.CylinderGeometry(0.225, 0.225, 0.05, 24, 1, true, 0, Math.PI);
    const bonnet = new THREE.Mesh(bonnetGeo, m.hijabInner);
    bonnet.position.set(0, 0.31, 0.02);
    bonnet.rotation.y = -Math.PI / 2;
    bonnet.rotation.x = 0.15;
    this.headGroup.add(bonnet);

    // 2. Main Hijab Head Wrap (Covers top, sides, back of head)
    const hijabHeadGeo = new THREE.SphereGeometry(0.255, 24, 20);
    hijabHeadGeo.scale(1.02, 1.05, 1.05);
    const hijabHead = new THREE.Mesh(hijabHeadGeo, m.hijabMain);
    hijabHead.position.set(0, 0.23, -0.02);
    hijabHead.castShadow = true;
    this.headGroup.add(hijabHead);

    // 3. Hijab Face Opening Trim (Rose trim framing forehead and cheeks)
    const trimGeo = new THREE.TorusGeometry(0.19, 0.022, 10, 24);
    const trim = new THREE.Mesh(trimGeo, m.hijabTrim);
    trim.position.set(0, 0.22, 0.13);
    trim.rotation.x = 0.1;
    this.headGroup.add(trim);

    // 4. Hijab Chin / Throat Wrap (Under chin)
    const chinWrapGeo = new THREE.CylinderGeometry(0.14, 0.17, 0.12, 18);
    const chinWrap = new THREE.Mesh(chinWrapGeo, m.hijabMain);
    chinWrap.position.set(0, 0.09, 0.06);
    chinWrap.rotation.x = 0.2;
    this.headGroup.add(chinWrap);

    // 5. Hijab Shoulder Shawl / Drapery (Drapes gracefully over chest and shoulders)
    const drapeGeo = new THREE.ConeGeometry(0.36, 0.26, 20, 1, true);
    const drape = new THREE.Mesh(drapeGeo, m.hijabMain);
    drape.position.set(0, 0.01, 0.01);
    drape.rotation.x = 0.05;
    drape.castShadow = true;
    this.headGroup.add(drape);

    // Subtle brooch / pearl pin on hijab side
    const pinGeo = new THREE.SphereGeometry(0.022, 10, 10);
    const pin = new THREE.Mesh(pinGeo, m.beltGold);
    pin.position.set(0.18, 0.16, 0.1);
    this.headGroup.add(pin);
  }

  buildArms() {
    const m = this.materials;

    const buildArm = (isLeft) => {
      const sign = isLeft ? -1 : 1;
      const armGroup = new THREE.Group();
      armGroup.position.set(sign * 0.22, 0.33, 0);

      // Upper arm (Full-length dress sleeve)
      const upperGeo = new THREE.CylinderGeometry(0.052, 0.048, 0.22, 10);
      upperGeo.translate(0, -0.1, 0);
      const upperArm = new THREE.Mesh(upperGeo, m.dress);
      upperArm.castShadow = true;
      armGroup.add(upperArm);

      // Forearm (Modest sleeve down to wrist)
      const forearmGroup = new THREE.Group();
      forearmGroup.position.y = -0.2;
      armGroup.add(forearmGroup);

      const foreGeo = new THREE.CylinderGeometry(0.046, 0.042, 0.19, 10);
      foreGeo.translate(0, -0.08, 0);
      const forearm = new THREE.Mesh(foreGeo, m.dress);
      forearmGroup.add(forearm);

      // Delicate hand
      const handGeo = new THREE.SphereGeometry(0.038, 10, 10);
      handGeo.scale(1, 1.2, 0.8);
      const hand = new THREE.Mesh(handGeo, m.skin);
      hand.position.y = -0.18;
      forearmGroup.add(hand);

      return { armGroup, forearmGroup, hand };
    };

    const left = buildArm(true);
    this.leftArm = left.armGroup;
    this.leftForearm = left.forearmGroup;
    this.torso.add(this.leftArm);

    const right = buildArm(false);
    this.rightArm = right.armGroup;
    this.rightForearm = right.forearmGroup;
    this.rightHand = right.hand;
    this.torso.add(this.rightArm);
  }

  buildLegs() {
    const m = this.materials;

    const buildLeg = (isLeft) => {
      const sign = isLeft ? -1 : 1;
      const legGroup = new THREE.Group();
      legGroup.position.set(sign * 0.09, 0, 0);

      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.34, 10);
      thighGeo.translate(0, -0.16, 0);
      const thigh = new THREE.Mesh(thighGeo, m.dress);
      legGroup.add(thigh);

      // Lower leg
      const lowerLeg = new THREE.Group();
      lowerLeg.position.y = -0.34;
      legGroup.add(lowerLeg);

      const calfGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.32, 10);
      calfGeo.translate(0, -0.15, 0);
      const calf = new THREE.Mesh(calfGeo, m.dress);
      lowerLeg.add(calf);

      // Shoe
      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, -0.32, 0.03);
      lowerLeg.add(shoeGroup);

      const footGeo = new THREE.BoxGeometry(0.085, 0.06, 0.16);
      footGeo.translate(0, 0.02, 0.03);
      const shoe = new THREE.Mesh(footGeo, m.shoes);
      shoeGroup.add(shoe);

      return { legGroup, lowerLeg };
    };

    const left = buildLeg(true);
    this.leftLeg = left.legGroup;
    this.leftLowerLeg = left.lowerLeg;
    this.hips.add(this.leftLeg);

    const right = buildLeg(false);
    this.rightLeg = right.legGroup;
    this.rightLowerLeg = right.lowerLeg;
    this.hips.add(this.rightLeg);
  }

  /**
   * Floating 3D Name Tag above Zulfiya's head: "🌸 Zulfiya 💖"
   */
  buildNameTag() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Rounded badge background
    ctx.fillStyle = 'rgba(24, 8, 26, 0.88)';
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 6;

    // Draw rounded pill
    const rx = 10, ry = 10, rw = 492, rh = 108, rad = 50;
    ctx.beginPath();
    ctx.moveTo(rx + rad, ry);
    ctx.lineTo(rx + rw - rad, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad);
    ctx.lineTo(rx + rw, ry + rh - rad);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh);
    ctx.lineTo(rx + rad, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad);
    ctx.lineTo(rx, ry + rad);
    ctx.quadraticCurveTo(rx, ry, rx + rad, ry);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Text: 🌸 Zulfiya 💖
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Playfair Display", Georgia, serif';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 15;
    ctx.fillText('🌸 Zulfiya 💖', 256, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });

    this.nameTagSprite = new THREE.Sprite(spriteMat);
    this.nameTagSprite.scale.set(1.4, 0.35, 1);
    this.nameTagSprite.position.set(0, 1.85, 0); // Floats above hijab
    this.mesh.add(this.nameTagSprite);
  }

  createDropShadow() {
    const shadowGeo = new THREE.PlaneGeometry(0.7, 0.7);
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    });

    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.02;
    this.mesh.add(this.shadowMesh);
  }

  createHeartParticles() {
    this.heartParticles = [];
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f43f5e';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❤️', 32, 34);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });

    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), mat.clone());
      p.visible = false;
      this.mesh.add(p);
      this.heartParticles.push({
        mesh: p,
        life: 0,
        maxLife: 1.2,
        velY: 0.85
      });
    }
  }

  triggerHeartParticles() {
    const p = this.heartParticles.find(hp => !hp.mesh.visible);
    if (p) {
      p.mesh.visible = true;
      p.mesh.position.set(
        (Math.random() - 0.5) * 0.3,
        1.3,
        0.2 + Math.random() * 0.1
      );
      p.life = p.maxLife;
      p.mesh.material.opacity = 0.95;
      p.mesh.scale.set(0.6, 0.6, 0.6);
    }
  }

  update(delta, state, soundManager = null) {
    const { isMoving, isRunning, isJumping, jumpHeight, facingAngle, isMakingHeart } = state;

    if (facingAngle !== undefined) {
      this.mesh.rotation.y = facingAngle;
    }

    // Name tag subtle gentle float
    if (this.nameTagSprite) {
      this.nameTagSprite.position.y = 1.85 + Math.sin(Date.now() * 0.003) * 0.03;
    }

    // Blinking
    this.blinkTimer += delta;
    if (this.blinkTimer > 3.5 + Math.random() * 2) {
      this.isBlinking = true;
      this.blinkTimer = 0;
    }
    if (this.isBlinking) {
      this.eyesGroup.scale.y = 0.1;
      if (this.blinkTimer > 0.12) {
        this.eyesGroup.scale.y = 1.0;
        this.isBlinking = false;
      }
    }

    // Jumping
    if (isJumping) {
      this.hips.position.y = 0.72 + jumpHeight;
      this.shadowMesh.scale.setScalar(Math.max(0.4, 1.0 - jumpHeight * 0.4));
      this.shadowMesh.material.opacity = Math.max(0.15, 0.45 - jumpHeight * 0.25);

      this.leftLeg.rotation.x = -0.3;
      this.rightLeg.rotation.x = -0.2;
      this.leftLowerLeg.rotation.x = 0.5;
      this.rightLowerLeg.rotation.x = 0.4;
      this.leftArm.rotation.x = -0.6;
      this.rightArm.rotation.x = -0.6;
      return;
    }

    this.shadowMesh.scale.setScalar(1.0);
    this.shadowMesh.material.opacity = 0.45;

    // Heart particles animation
    this.heartParticles.forEach(hp => {
      if (hp.mesh.visible) {
        hp.life -= delta;
        hp.mesh.position.y += hp.velY * delta;
        hp.mesh.position.x += Math.sin(hp.life * 6) * 0.005;
        hp.mesh.material.opacity = Math.max(0, hp.life / hp.maxLife);
        const sc = 0.6 + (1 - hp.life / hp.maxLife) * 0.6;
        hp.mesh.scale.set(sc, sc, sc);
        if (hp.life <= 0) {
          hp.mesh.visible = false;
        }
      }
    });

    if (isMoving) {
      const speedMult = isRunning ? 16 : 10;
      this.walkCycle += delta * speedMult;

      const legAngle = Math.sin(this.walkCycle) * (isRunning ? 0.7 : 0.45);
      const armAngle = -legAngle * (isRunning ? 0.75 : 0.5);

      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      this.leftLowerLeg.rotation.x = legAngle < 0 ? -legAngle * 0.8 : 0.05;
      this.rightLowerLeg.rotation.x = -legAngle < 0 ? legAngle * 0.8 : 0.05;

      this.leftArm.rotation.x = armAngle;
      this.leftArm.rotation.z = 0.08;
      this.rightArm.rotation.x = -armAngle;
      this.rightArm.rotation.z = -0.08;

      const bob = Math.abs(Math.sin(this.walkCycle)) * 0.04;
      this.hips.position.y = 0.72 + bob;
      this.torso.rotation.y = Math.sin(this.walkCycle) * 0.06;

      const stepTrigger = Math.sin(this.walkCycle);
      if (Math.abs(stepTrigger) > 0.95 && soundManager) {
        if (!this.lastStepPlayed) {
          soundManager.playFootstep();
          this.lastStepPlayed = true;
        }
      } else {
        this.lastStepPlayed = false;
      }

    } else {
      // IDLE
      this.walkCycle += delta * 2;
      const breathe = Math.sin(this.walkCycle) * 0.012;

      this.hips.position.y = 0.72 + breathe;
      this.torso.rotation.y = 0;
      this.headGroup.rotation.y = Math.sin(this.walkCycle * 0.5) * 0.06;

      this.leftLeg.rotation.x *= 0.85;
      this.rightLeg.rotation.x *= 0.85;
      this.leftLowerLeg.rotation.x *= 0.85;
      this.rightLowerLeg.rotation.x *= 0.85;

      if (isMakingHeart) {
        this.heartTimer += delta * 4;
        this.leftArm.rotation.x = -1.4;
        this.leftArm.rotation.z = 0.75;
        this.leftForearm.rotation.y = 0.9;

        this.rightArm.rotation.x = -1.4;
        this.rightArm.rotation.z = -0.75;
        this.rightForearm.rotation.y = -0.9;

        if (Math.sin(this.heartTimer) > 0.7) {
          this.triggerHeartParticles();
        }
      } else {
        this.leftArm.rotation.x *= 0.85;
        this.leftArm.rotation.z = 0.06;
        this.leftForearm.rotation.y *= 0.85;

        this.rightArm.rotation.x *= 0.85;
        this.rightArm.rotation.z = -0.06;
        this.rightForearm.rotation.y *= 0.85;
      }
    }
  }
}
