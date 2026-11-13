import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

export class ArtworkManager {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.artworks = new Map();
    this.textureLoader = new THREE.TextureLoader();
    this.nearestArtwork = null;
    this.slots = this.defineSlots();
  }

  defineSlots() {
    const slots = [];
    // Giant wall-sized frames: width ~3.4m, height ~4.0m (almost full wall height 5.5m!)
    const frameW = 3.4;
    const frameH = 4.0;
    const yPos = 2.6; // Stretches from 0.6m to 4.6m off ground

    // 1. North Wall (Z = -11.5, facing South: rotationY = 0) - 6 slots
    const northXs = [-10.5, -6.3, -2.1, 2.1, 6.3, 10.5];
    northXs.forEach((x, idx) => {
      slots.push({
        id: `slot-${idx}`,
        index: idx,
        wall: 'Shimoliy Devor (North)',
        position: new THREE.Vector3(x, yPos, -11.5),
        rotationY: 0,
        width: frameW,
        height: frameH
      });
    });

    // 2. South Wall (Z = 11.5, facing North: rotationY = Math.PI) - 6 slots
    const southXs = [10.5, 6.3, 2.1, -2.1, -6.3, -10.5];
    southXs.forEach((x, idx) => {
      const globalIdx = 6 + idx;
      slots.push({
        id: `slot-${globalIdx}`,
        index: globalIdx,
        wall: 'Janubiy Devor (South)',
        position: new THREE.Vector3(x, yPos, 11.5),
        rotationY: Math.PI,
        width: frameW,
        height: frameH
      });
    });

    // 3. West Wall (X = -13.5, facing East: rotationY = Math.PI / 2) - 5 slots
    const westZs = [-8, -4, 0, 4, 8];
    westZs.forEach((z, idx) => {
      const globalIdx = 12 + idx;
      slots.push({
        id: `slot-${globalIdx}`,
        index: globalIdx,
        wall: 'G\'arbiy Devor (West)',
        position: new THREE.Vector3(-13.5, yPos, z),
        rotationY: Math.PI / 2,
        width: frameW,
        height: frameH
      });
    });

    // 4. East Wall (X = 13.5, facing West: rotationY = -Math.PI / 2) - 5 slots
    const eastZs = [8, 4, 0, -4, -8];
    eastZs.forEach((z, idx) => {
      const globalIdx = 17 + idx;
      slots.push({
        id: `slot-${globalIdx}`,
        index: globalIdx,
        wall: 'Sharqiy Devor (East)',
        position: new THREE.Vector3(13.5, yPos, z),
        rotationY: -Math.PI / 2,
        width: frameW,
        height: frameH
      });
    });

    return slots;
  }

  getSlot(slotIndex) {
    if (slotIndex !== undefined && slotIndex >= 0 && slotIndex < this.slots.length) {
      return this.slots[slotIndex];
    }
    return this.slots[0];
  }

  async loadArtworks(artworksList) {
    this.artworks.forEach((art) => {
      this.scene.remove(art.mesh);
      if (art.spotlight) this.scene.remove(art.spotlight);
    });
    this.artworks.clear();

    for (const artData of artworksList) {
      await this.mountArtwork(artData);
    }
  }

  async mountArtwork(artData) {
    const slot = this.getSlot(artData.slotIndex);
    if (!slot) return;

    const group = new THREE.Group();
    group.position.copy(slot.position);
    group.rotation.y = slot.rotationY;

    const w = slot.width;
    const h = slot.height;
    const frameDepth = 0.14;
    const borderWidth = 0.16;

    // Frame material
    let frameMat;
    if (artData.frameStyle === 'modern-black') {
      frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.4 });
    } else if (artData.frameStyle === 'vintage-wood') {
      frameMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6, metalness: 0.1 });
    } else if (artData.frameStyle === 'neon-glow') {
      frameMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0xbe185d,
        emissiveIntensity: 0.55
      });
    } else {
      frameMat = new THREE.MeshStandardMaterial({
        map: TextureGenerator.createGoldTexture(),
        roughness: 0.25,
        metalness: 0.9
      });
    }

    // Outer 3D Gold / Decorative Frame
    const frameBorder = new THREE.Mesh(
      new THREE.BoxGeometry(w + borderWidth * 2, h + borderWidth * 2, frameDepth),
      frameMat
    );
    frameBorder.castShadow = true;
    group.add(frameBorder);

    // CRITICAL FOR QUALITY: High-Resolution Texture loading with 16x Anisotropic filtering
    const texture = await this.loadTextureAsync(artData.imageUrl);

    // MeshBasicMaterial with toneMapped: false preserves 100% of original photo colors,
    // brightness, contrast, and razor-sharp clarity without any tone-mapping degradation!
    const canvasMat = new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false
    });

    const canvasMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      canvasMat
    );
    canvasMesh.position.z = frameDepth / 2 + 0.01;
    group.add(canvasMesh);

    // Brass Plaque inside bottom frame
    const plaqueTex = TextureGenerator.createPlaqueTexture(artData.title, artData.artist, artData.year);
    const plaqueMat = new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.3, metalness: 0.7 });
    const plaqueMesh = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, 0.28, 0.03), plaqueMat);
    plaqueMesh.position.set(0, -h / 2 + 0.2, frameDepth / 2 + 0.02);
    group.add(plaqueMesh);

    // Overhead gold gallery picture light
    const fixture = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, w * 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 })
    );
    fixture.rotation.z = Math.PI / 2;
    fixture.position.set(0, h / 2 + borderWidth + 0.2, 0.35);
    group.add(fixture);

    // Gentle warm spotlight
    const spotlight = new THREE.SpotLight(0xffedd5, 3.2, 12, Math.PI / 3.8, 0.4, 1.2);
    spotlight.position.set(
      slot.position.x + Math.sin(slot.rotationY) * 1.5,
      slot.position.y + h / 2 + 1.2,
      slot.position.z + Math.cos(slot.rotationY) * 1.5
    );
    spotlight.target = canvasMesh;
    this.scene.add(spotlight);

    // Heart beacon
    const beaconGeo = new THREE.RingGeometry(0.2, 0.28, 24);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, -h / 2 - borderWidth - 0.35, 0.2);
    beacon.visible = false;
    group.add(beacon);

    group.userData = { artworkId: artData.id, artData };
    canvasMesh.userData = { artworkId: artData.id, artData };

    this.scene.add(group);
    this.artworks.set(artData.id, {
      mesh: group,
      data: artData,
      spotlight,
      beacon,
      slot
    });
  }

  loadTextureAsync(url) {
    return new Promise((resolve) => {
      this.textureLoader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.generateMipmaps = true;

          // Maximum Anisotropic Filtering prevents blurriness when viewed from angles
          const maxAniso = this.renderer ? this.renderer.capabilities.getMaxAnisotropy() : 16;
          tex.anisotropy = Math.min(maxAniso, 16);

          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
          resolve(tex);
        },
        undefined,
        () => {
          const fallback = TextureGenerator.createGoldTexture();
          resolve(fallback);
        }
      );
    });
  }

  update(characterPos) {
    let closestDist = Infinity;
    let closestArt = null;

    this.artworks.forEach((item) => {
      const artPos = item.mesh.position;
      const dist = characterPos.distanceTo(artPos);

      if (dist < 4.8) {
        item.beacon.visible = true;
        const s = 1.0 + Math.sin(Date.now() * 0.007) * 0.18;
        item.beacon.scale.set(s, s, 1);
      } else {
        item.beacon.visible = false;
      }

      if (dist < 3.8 && dist < closestDist) {
        closestDist = dist;
        closestArt = item.data;
      }
    });

    this.nearestArtwork = closestArt;
    return this.nearestArtwork;
  }

  getArtworkMeshByRaycast(raycaster) {
    const meshes = [];
    this.artworks.forEach((item) => {
      meshes.push(item.mesh);
    });
    const intersects = raycaster.intersectObjects(meshes, true);
    if (intersects.length > 0) {
      let curr = intersects[0].object;
      while (curr) {
        if (curr.userData && curr.userData.artData) {
          return curr.userData.artData;
        }
        curr = curr.parent;
      }
    }
    return null;
  }
}
