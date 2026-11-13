import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

export class MuseumArchitecture {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.parquetTexture = TextureGenerator.createParquetTexture();
    this.goldTexture = TextureGenerator.createGoldTexture();
    this.materials = this.createMaterials();

    this.buildRomanticHall();
  }

  createMaterials() {
    return {
      floor: new THREE.MeshStandardMaterial({
        map: this.parquetTexture,
        roughness: 0.32,
        metalness: 0.08
      }),
      wall: new THREE.MeshStandardMaterial({
        color: 0x22131e, // Deep warm romantic plum / wine
        roughness: 0.75
      }),
      wallTrim: new THREE.MeshStandardMaterial({
        map: this.goldTexture,
        roughness: 0.25,
        metalness: 0.9
      }),
      ceiling: new THREE.MeshStandardMaterial({
        color: 0x120714,
        roughness: 0.9
      }),
      marblePedestal: new THREE.MeshStandardMaterial({
        color: 0xfff1f2, // Rose quartz / soft marble
        roughness: 0.2,
        metalness: 0.1
      }),
      goldHeart: new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        roughness: 0.15,
        metalness: 0.85,
        emissive: 0xbe185d,
        emissiveIntensity: 0.35
      }),
      benchVelvet: new THREE.MeshStandardMaterial({
        color: 0x9f1239, // Deep romantic ruby velvet
        roughness: 0.65
      }),
      benchGold: new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.2,
        metalness: 0.8
      }),
      flowerPetal: new THREE.MeshStandardMaterial({
        color: 0xfb7185,
        roughness: 0.5
      }),
      plantLeaf: new THREE.MeshStandardMaterial({
        color: 0x166534,
        roughness: 0.5
      }),
      potCeramic: new THREE.MeshStandardMaterial({
        color: 0xffedd5,
        roughness: 0.3
      })
    };
  }

  addColliderBox(minX, minY, minZ, maxX, maxY, maxZ) {
    const box = new THREE.Box3(
      new THREE.Vector3(minX, minY, minZ),
      new THREE.Vector3(maxX, maxY, maxZ)
    );
    this.colliders.push(box);
  }

  buildRomanticHall() {
    const m = this.materials;
    const width = 28;  // X: -14 to 14
    const length = 24; // Z: -12 to 12
    const height = 5.6;

    // 1. Polished Parquet Floor
    const floorGeo = new THREE.PlaneGeometry(width, length);
    const floor = new THREE.Mesh(floorGeo, m.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(width, length);
    const ceiling = new THREE.Mesh(ceilingGeo, m.ceiling);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = height;
    this.scene.add(ceiling);

    // Skylight Glass Dome with warm soft light
    const domeGeo = new THREE.CylinderGeometry(4.2, 4.5, 0.2, 24);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xfbcfe8,
      roughness: 0.1,
      metalness: 0.7,
      transparent: true,
      opacity: 0.35
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0, height - 0.1, 0);
    this.scene.add(dome);

    // 3. Four Perimeter Walls
    // North Wall (Z = -12)
    this.buildWall(0, height / 2, -12, width, height, 0.8, m.wall);
    // South Wall (Z = 12)
    this.buildWall(0, height / 2, 12, width, height, 0.8, m.wall);
    // West Wall (X = -14)
    this.buildWall(-14, height / 2, 0, 0.8, height, length, m.wall);
    // East Wall (X = 14)
    this.buildWall(14, height / 2, 0, 0.8, height, length, m.wall);

    // Gold Moldings along top and base of all walls
    this.buildGoldMoldings(width, length, height);

    // Romantic Banners
    this.buildBanners(height);

    // Centerpiece: Glowing Twin Hearts Sculpture
    this.buildRomanticCenterpiece();

    // Cozy Velvet Benches & Flowers
    this.buildDecorations();
  }

  buildWall(x, y, z, w, h, d, material) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const wall = new THREE.Mesh(geo, material);
    wall.position.set(x, y, z);
    wall.receiveShadow = true;
    this.scene.add(wall);

    // Add collider
    const hw = w / 2;
    const hd = d / 2;
    this.addColliderBox(x - hw, 0, z - hd, x + hw, h, z + hd);
    return wall;
  }

  buildGoldMoldings(w, l, h) {
    const m = this.materials.wallTrim;
    // Top moldings
    const topN = new THREE.Mesh(new THREE.BoxGeometry(w, 0.15, 0.25), m);
    topN.position.set(0, h - 0.1, -11.6);
    this.scene.add(topN);

    const topS = new THREE.Mesh(new THREE.BoxGeometry(w, 0.15, 0.25), m);
    topS.position.set(0, h - 0.1, 11.6);
    this.scene.add(topS);

    const topW = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, l), m);
    topW.position.set(-13.6, h - 0.1, 0);
    this.scene.add(topW);

    const topE = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, l), m);
    topE.position.set(13.6, h - 0.1, 0);
    this.scene.add(topE);

    // Baseboard moldings
    const baseN = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, 0.2), m);
    baseN.position.set(0, 0.1, -11.6);
    this.scene.add(baseN);

    const baseS = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, 0.2), m);
    baseS.position.set(0, 0.1, 11.6);
    this.scene.add(baseS);
  }

  buildBanners(h) {
    // North Banner
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 1024;
    bannerCanvas.height = 140;
    const ctx = bannerCanvas.getContext('2d');

    ctx.fillStyle = '#1c0b1a';
    ctx.fillRect(0, 0, 1024, 140);

    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 1012, 128);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('💖 SEVGILIMGA BAG\'ISHLANGAN XOTIRALAR MUZEYI 💖', 512, 58);

    ctx.font = 'italic 22px "Inter", sans-serif';
    ctx.fillStyle = '#fbcfe8';
    ctx.fillText('Har bir surat — bizning sevgi qissamizning shirin bir sahifasidir', 512, 105);

    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(9.0, 1.2, 0.1),
      new THREE.MeshStandardMaterial({ map: bannerTex, roughness: 0.3 })
    );
    bannerMesh.position.set(0, h - 1.0, -11.5);
    this.scene.add(bannerMesh);

    // South Banner
    const banner2 = bannerMesh.clone();
    banner2.position.set(0, h - 1.0, 11.5);
    banner2.rotation.y = Math.PI;
    this.scene.add(banner2);
  }

  buildRomanticCenterpiece() {
    const m = this.materials;

    // Rose marble stepped circular pedestal
    const p1Geo = new THREE.CylinderGeometry(2.4, 2.6, 0.3, 32);
    const p1 = new THREE.Mesh(p1Geo, m.marblePedestal);
    p1.position.y = 0.15;
    p1.receiveShadow = true;
    this.scene.add(p1);

    const p2Geo = new THREE.CylinderGeometry(1.7, 1.9, 0.3, 32);
    const p2 = new THREE.Mesh(p2Geo, m.marblePedestal);
    p2.position.y = 0.45;
    this.scene.add(p2);

    // Center Column
    const colGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.0, 20);
    const col = new THREE.Mesh(colGeo, m.marblePedestal);
    col.position.y = 1.1;
    this.scene.add(col);

    // Animated Glowing Hearts Sculpture
    this.heartGroup = new THREE.Group();
    this.heartGroup.position.set(0, 2.3, 0);

    // Create 3D Heart geometry using shape extrusion
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.25);
    heartShape.bezierCurveTo(0, 0.55, -0.45, 0.95, -0.85, 0.95);
    heartShape.bezierCurveTo(-1.45, 0.95, -1.45, 0.25, -1.45, 0.25);
    heartShape.bezierCurveTo(-1.45, -0.35, -0.75, -0.95, 0, -1.45);
    heartShape.bezierCurveTo(0.75, -0.95, 1.45, -0.35, 1.45, 0.25);
    heartShape.bezierCurveTo(1.45, 0.25, 1.45, 0.95, 0.85, 0.95);
    heartShape.bezierCurveTo(0.45, 0.95, 0, 0.55, 0, 0.25);

    const extrudeSettings = {
      depth: 0.22,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.08,
      bevelThickness: 0.08
    };

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeo.center();
    heartGeo.scale(0.55, 0.55, 0.55);

    // Heart 1 (Ruby Rose)
    const heart1 = new THREE.Mesh(heartGeo, m.goldHeart);
    heart1.rotation.z = Math.PI;
    heart1.rotation.y = 0.3;
    this.heartGroup.add(heart1);

    // Heart 2 (Intertwined Golden Heart)
    const heart2 = new THREE.Mesh(heartGeo, new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.18,
      metalness: 0.9,
      emissive: 0xd97706,
      emissiveIntensity: 0.3
    }));
    heart2.rotation.z = Math.PI;
    heart2.rotation.y = -0.5;
    heart2.position.set(0.25, 0.15, 0.1);
    heart2.scale.set(0.85, 0.85, 0.85);
    this.heartGroup.add(heart2);

    this.scene.add(this.heartGroup);

    // Warm pink point light glowing from the heart
    this.heartGlow = new THREE.PointLight(0xf43f5e, 3.2, 14, 1.2);
    this.heartGlow.position.set(0, 2.5, 0);
    this.scene.add(this.heartGlow);

    // Floating Rose Petals / Sparkles around the pedestal
    this.createRosePetals();

    // Collider for pedestal (radius ~ 2.2m)
    this.addColliderBox(-2.0, 0, -2.0, 2.0, 1.8, 2.0);
  }

  createRosePetals() {
    const petalGeo = new THREE.CircleGeometry(0.06, 6);
    for (let i = 0; i < 40; i++) {
      const petal = new THREE.Mesh(petalGeo, this.materials.flowerPetal);
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.0 + Math.random() * 2.5;
      petal.position.set(
        Math.cos(angle) * radius,
        0.02 + Math.random() * 0.01,
        Math.sin(angle) * radius
      );
      petal.rotation.x = -Math.PI / 2;
      petal.rotation.z = Math.random() * Math.PI;
      this.scene.add(petal);
    }
  }

  buildDecorations() {
    const m = this.materials;

    // Cozy Velvet Love-seat Benches in the room
    const benchPositions = [
      { x: -6, z: -5, rot: 0.3 },
      { x: 6, z: -5, rot: -0.3 },
      { x: -6, z: 5, rot: Math.PI - 0.3 },
      { x: 6, z: 5, rot: Math.PI + 0.3 }
    ];

    benchPositions.forEach(b => {
      this.buildLoveSeat(b.x, b.z, b.rot);
    });

    // Elegant Rose Plant Pots in the corners
    const plantPositions = [
      [-12.5, -10.5],
      [12.5, -10.5],
      [-12.5, 10.5],
      [12.5, 10.5]
    ];

    plantPositions.forEach(([px, pz]) => {
      this.buildRosePot(px, pz);
    });
  }

  buildLoveSeat(x, z, rot) {
    const m = this.materials;
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rot;

    // Cushion seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.24, 0.75),
      m.benchVelvet
    );
    seat.position.y = 0.45;
    seat.castShadow = true;
    group.add(seat);

    // Backrest
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.55, 0.16),
      m.benchVelvet
    );
    back.position.set(0, 0.78, -0.3);
    group.add(back);

    // Gold legs
    const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.45, 8);
    [
      [-0.85, -0.28], [0.85, -0.28],
      [-0.85, 0.28], [0.85, 0.28]
    ].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, m.benchGold);
      leg.position.set(lx, 0.225, lz);
      group.add(leg);
    });

    this.scene.add(group);
    this.addColliderBox(x - 1.1, 0, z - 0.5, x + 1.1, 1.1, z + 0.5);
  }

  buildRosePot(x, z) {
    const m = this.materials;
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Ceramic pot
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.28, 0.7, 16),
      m.potCeramic
    );
    pot.position.y = 0.35;
    pot.castShadow = true;
    group.add(pot);

    // Rose Bush
    for (let i = 0; i < 9; i++) {
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        m.plantLeaf
      );
      leaf.position.set(
        (Math.random() - 0.5) * 0.4,
        0.8 + Math.random() * 0.45,
        (Math.random() - 0.5) * 0.4
      );
      group.add(leaf);
    }

    // Blooming red/pink roses
    for (let j = 0; j < 5; j++) {
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        m.flowerPetal
      );
      flower.position.set(
        (Math.random() - 0.5) * 0.5,
        1.0 + Math.random() * 0.4,
        (Math.random() - 0.5) * 0.5
      );
      group.add(flower);
    }

    this.scene.add(group);
    this.addColliderBox(x - 0.45, 0, z - 0.45, x + 0.45, 1.4, z + 0.45);
  }

  update(delta) {
    // Gentle floating and rotation of the centerpiece Twin Hearts
    if (this.heartGroup) {
      this.heartGroup.rotation.y += delta * 0.5;
      const hover = Math.sin(Date.now() * 0.002) * 0.08;
      this.heartGroup.position.y = 2.3 + hover;
    }
  }
}
