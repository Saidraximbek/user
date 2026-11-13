import './style.css';
import * as THREE from 'three';
import { SceneManager } from './museum/SceneManager.js';
import { MuseumArchitecture } from './museum/MuseumArchitecture.js';
import { ArtworkManager } from './museum/ArtworkManager.js';
import { CharacterGirl } from './museum/CharacterGirl.js';
import { CharacterController } from './museum/CharacterController.js';
import { GalleryStorage } from './storage/GalleryStorage.js';
import { UploadModal } from './ui/UploadModal.js';
import { InspectModal } from './ui/InspectModal.js';
import { GalleryManagerModal } from './ui/GalleryManagerModal.js';
import { HUD } from './ui/HUD.js';
import { TouchControls } from './ui/TouchControls.js';
import { LockScreen } from './ui/LockScreen.js';

class App {
  constructor() {
    this.canvasContainer = document.getElementById('canvas-container');
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.init();
  }

  async init() {
    // 1. Romantic Date-based Lock Screen (Password: 11-noyabr 2026yil)
    this.lockScreen = new LockScreen(() => {
      // Unlocked callback
    });

    // 2. Storage
    this.storage = new GalleryStorage();
    await this.storage.init();

    // 3. Scene, Camera, Renderer
    this.sceneManager = new SceneManager(this.canvasContainer);

    // 4. Museum Architecture
    this.architecture = new MuseumArchitecture(this.sceneManager.scene);

    // 5. Artwork Manager with High-Resolution Renderer Capabilities
    this.artworkManager = new ArtworkManager(this.sceneManager.scene, this.sceneManager.renderer);
    const artworks = await this.storage.getAll();
    await this.artworkManager.loadArtworks(artworks);

    // 6. Controllable Hijabi Girl Avatar: Zulfiya
    this.character = new CharacterGirl();
    this.sceneManager.scene.add(this.character.mesh);

    // 7. Character Controller & Camera Follow
    this.controller = new CharacterController(
      this.character,
      this.sceneManager.camera,
      this.sceneManager.renderer.domElement,
      this.architecture
    );

    // 8. Modals
    this.uploadModal = new UploadModal(
      this.storage,
      this.artworkManager,
      this.controller,
      async () => {
        const updated = await this.storage.getAll();
        await this.artworkManager.loadArtworks(updated);
      }
    );

    this.inspectModal = new InspectModal(
      this.storage,
      (artworkToEdit) => {
        this.uploadModal.open(artworkToEdit);
      },
      async (artworkIdToDelete) => {
        await this.storage.delete(artworkIdToDelete);
        const updated = await this.storage.getAll();
        await this.artworkManager.loadArtworks(updated);
      }
    );

    this.galleryManagerModal = new GalleryManagerModal(
      this.storage,
      this.controller,
      this.artworkManager,
      (artworkToEdit) => {
        this.uploadModal.open(artworkToEdit);
      },
      async () => {
        const updated = await this.storage.getAll();
        await this.artworkManager.loadArtworks(updated);
      }
    );

    // 9. HUD with Clean Dropdown Menu
    this.hud = new HUD(
      this.controller,
      this.artworkManager,
      this.sceneManager,
      {
        onOpenUpload: () => this.uploadModal.open(),
        onOpenGallery: () => this.galleryManagerModal.open(),
        onInspect: (art) => this.inspectModal.open(art)
      }
    );

    // 10. Mobile Touch Scroll & Controls
    this.touchControls = new TouchControls(
      this.controller,
      () => {
        if (this.artworkManager.nearestArtwork) {
          this.inspectModal.open(this.artworkManager.nearestArtwork);
        }
      }
    );

    // 11. Click directly on paintings to inspect
    this.setupPaintingClick();

    // 12. Drag and Drop images directly onto window
    this.setupWindowDragAndDrop();

    // Start render loop
    this.animate();
  }

  setupPaintingClick() {
    let downTime = 0;
    let downPos = { x: 0, y: 0 };

    this.sceneManager.renderer.domElement.addEventListener('pointerdown', (e) => {
      downTime = Date.now();
      downPos = { x: e.clientX, y: e.clientY };
    });

    this.sceneManager.renderer.domElement.addEventListener('pointerup', (e) => {
      const clickDuration = Date.now() - downTime;
      const moveDistance = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);

      if (clickDuration < 300 && moveDistance < 6) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.sceneManager.camera);
        const clickedArt = this.artworkManager.getArtworkMeshByRaycast(this.raycaster);

        if (clickedArt) {
          this.inspectModal.open(clickedArt);
        }
      }
    });
  }

  setupWindowDragAndDrop() {
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.uploadModal.open();
        if (e.dataTransfer.files.length > 1) {
          this.uploadModal.handleBulkFiles(Array.from(e.dataTransfer.files));
        } else {
          this.uploadModal.handleSingleFile(e.dataTransfer.files[0]);
        }
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.sceneManager.clock.getDelta(), 0.1);

    this.architecture.update(delta);
    this.controller.update(delta);

    const nearestArt = this.artworkManager.update(this.controller.position);

    this.hud.update(
      this.controller.position,
      nearestArt,
      this.controller.facingAngle
    );

    this.sceneManager.render();
  }
}

new App();
