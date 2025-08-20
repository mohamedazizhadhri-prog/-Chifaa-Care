import * as THREE from 'three';
import { gsap } from 'gsap';

export class PillModelService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private container!: HTMLElement;
  private animationId!: number;
  private pillModel!: THREE.Object3D;

  init(container: HTMLElement) {
    this.container = container;
    this.setupScene();
    this.createPill();
    this.animate();
  }

  private setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf8fafc);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 4); // Move camera slightly closer to make pill appear larger

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createPill() {
    const whiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      metalness: 0.1,
      roughness: 0.3
    });
    
    const redMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.95,
      metalness: 0.1,
      roughness: 0.3
    });
    
    const halfLength = 0.7; // Increased from 0.5 to make pill longer
    const radius = 0.4; // Increased from 0.3 to make pill thicker
    
    // Create top half (white) - position it to the right
    const topGeometry = new THREE.CapsuleGeometry(radius, halfLength, 8, 16);
    const topPill = new THREE.Mesh(topGeometry, whiteMaterial);
    topPill.position.x = halfLength / 1.5; // Adjusted position for new size
    topPill.position.y = 0; // Center vertically
    topPill.rotation.z = Math.PI / 2; // Rotate 90 degrees around Z-axis to lay down
    
    // Create bottom half (red) - position it to the left
    const bottomGeometry = new THREE.CapsuleGeometry(radius, halfLength, 8, 16);
    const bottomPill = new THREE.Mesh(bottomGeometry, redMaterial);
    bottomPill.position.x = -halfLength / 1.5; // Adjusted position for new size
    bottomPill.position.y = 0; // Center vertically
    bottomPill.rotation.z = Math.PI / 2; // Rotate 90 degrees around Z-axis to lay down
    
    this.pillModel = new THREE.Group();
    this.pillModel.add(topPill);
    this.pillModel.add(bottomPill);
    
    this.scene.add(this.pillModel);
    
    this.setupLighting();
    this.startAnimation();
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(2, 2, 2);
    this.scene.add(directionalLight);
  }

  private startAnimation() {
    if (this.pillModel) {
      // Gentle floating up and down
      gsap.to(this.pillModel.position, {
        y: 0.2,
        duration: 3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });

      // Rotate around the pill's length axis (like rolling) - using Y-axis for proper rolling
      gsap.to(this.pillModel.rotation, {
        y: -Math.PI * 2, // Negative value for correct rolling direction
        duration: 8,
        ease: "none",
        repeat: -1
      });
    }
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    if (this.camera && this.renderer && this.container) {
      const aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.aspect = aspect;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      if (this.container && this.renderer.domElement) {
        this.container.removeChild(this.renderer.domElement);
      }
    }

    window.removeEventListener('resize', () => this.onWindowResize());
  }
}
