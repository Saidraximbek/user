import * as THREE from 'three';

export class SceneManager {
  constructor(container) {
    this.container = container;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x18091a); // Deep romantic wine/plum
    this.scene.fog = new THREE.FogExp2(0x18091a, 0.015);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    this.camera.position.set(0, 3, 5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    this.container.appendChild(this.renderer.domElement);

    // Clock
    this.clock = new THREE.Clock();

    // Lighting Setup
    this.setupLighting();

    window.addEventListener('resize', () => this.onResize());

    this.currentMood = 'day';
  }

  setupLighting() {
    // Ambient Light - warm romantic glow
    this.ambientLight = new THREE.AmbientLight(0xffe4e6, 1.3);
    this.scene.add(this.ambientLight);

    // Main Skylight Sun
    this.sunLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    this.sunLight.position.set(8, 18, 8);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 40;
    this.sunLight.shadow.camera.left = -20;
    this.sunLight.shadow.camera.right = 20;
    this.sunLight.shadow.camera.top = 20;
    this.sunLight.shadow.camera.bottom = -20;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Warm soft fill lights around the hall
    this.fillLight1 = new THREE.PointLight(0xf43f5e, 1.6, 20, 1.4);
    this.fillLight1.position.set(0, 4.6, 0);
    this.scene.add(this.fillLight1);

    this.fillLight2 = new THREE.PointLight(0xfef08a, 1.1, 16, 1.4);
    this.fillLight2.position.set(0, 4.2, -6);
    this.scene.add(this.fillLight2);

    this.fillLight3 = new THREE.PointLight(0xfef08a, 1.1, 16, 1.4);
    this.fillLight3.position.set(0, 4.2, 6);
    this.scene.add(this.fillLight3);
  }

  setLightingMood(mood) {
    this.currentMood = mood;
    if (mood === 'day') {
      this.scene.background.set(0x18091a);
      this.scene.fog.color.set(0x18091a);
      this.ambientLight.color.set(0xffe4e6);
      this.ambientLight.intensity = 1.3;
      this.sunLight.color.set(0xffedd5);
      this.sunLight.intensity = 1.8;
      this.renderer.toneMappingExposure = 1.08;
    } else if (mood === 'sunset') {
      this.scene.background.set(0x2d0b1a);
      this.scene.fog.color.set(0x2d0b1a);
      this.ambientLight.color.set(0xfb7185);
      this.ambientLight.intensity = 1.0;
      this.sunLight.color.set(0xf97316);
      this.sunLight.intensity = 2.4;
      this.renderer.toneMappingExposure = 1.18;
    } else if (mood === 'night') {
      this.scene.background.set(0x0c020d);
      this.scene.fog.color.set(0x0c020d);
      this.ambientLight.color.set(0x2e1065);
      this.ambientLight.intensity = 0.55;
      this.sunLight.color.set(0xf43f5e);
      this.sunLight.intensity = 0.7;
      this.renderer.toneMappingExposure = 1.3;
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
