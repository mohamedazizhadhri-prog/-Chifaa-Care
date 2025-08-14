import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

gsap.registerPlugin(ScrollTrigger);

export class ThreeSceneService {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private container!: HTMLElement;
  private animationId!: number;
  private objects: THREE.Object3D[] = [];
  private pillModel: THREE.Object3D | null = null;

  init(container: HTMLElement) {
    this.container = container;
    this.setupScene();
    this.createObjects();
    this.setupScrollTrigger();
    this.animate();
  }

  private setupScene() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf8fafc);

    // Camera setup
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 5);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createObjects() {
    // Create medical sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.8,
      shininess: 100
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    this.scene.add(sphere);
    this.objects.push(sphere);

    // Create molecular network
    const networkGeometry = new THREE.BufferGeometry();
    const networkMaterial = new THREE.LineBasicMaterial({ 
      color: 0x10b981,
      transparent: true,
      opacity: 0.6
    });

    const points: number[] = [];
    const connections: number[] = [];
    
    // Generate random points for molecular network
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 4;
      const y = (Math.random() - 0.5) * 4;
      const z = (Math.random() - 0.5) * 4;
      points.push(x, y, z);
    }

    // Create connections between nearby points
    for (let i = 0; i < points.length; i += 3) {
      for (let j = i + 3; j < points.length; j += 3) {
        const distance = Math.sqrt(
          Math.pow(points[i] - points[j], 2) +
          Math.pow(points[i + 1] - points[j + 1], 2) +
          Math.pow(points[i + 2] - points[j + 2], 2)
        );
        
        if (distance < 2) {
          connections.push(
            points[i], points[i + 1], points[i + 2],
            points[j], points[j + 1], points[j + 2]
          );
        }
      }
    }

    networkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connections, 3));
    const network = new THREE.LineSegments(networkGeometry, networkMaterial);
    this.scene.add(network);
    this.objects.push(network);

    // Create glowing particles
    const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });

    for (let i = 0; i < 15; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6
      );
      this.scene.add(particle);
      this.objects.push(particle);
    }

    // Load pill 3D model
    const loader = new GLTFLoader();
    loader.load('assets/pill_capsule.glb', (gltf) => {
      this.pillModel = gltf.scene;
      this.pillModel.position.set(2, 0, 0); // Position pill to the right
      this.pillModel.scale.set(1.5, 1.5, 1.5); // Adjust scale as needed
      this.scene.add(this.pillModel);
      this.objects.push(this.pillModel);
      // Animate pill on scroll
      gsap.to(this.pillModel.rotation, {
        scrollTrigger: {
          trigger: this.container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            this.pillModel!.rotation.x = progress * Math.PI * 2;
            this.pillModel!.rotation.y = progress * Math.PI * 2;
            this.pillModel!.position.y = Math.sin(progress * Math.PI) * 1.5;
          }
        }
      });
    }, undefined, (error) => {
      console.error('Error loading pill_capsule.glb:', error);
    });

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x10b981, 1, 10);
    pointLight.position.set(0, 0, 3);
    this.scene.add(pointLight);
  }

  private setupScrollTrigger() {
    // Animate camera position based on scroll
    gsap.to(this.camera.position, {
      scrollTrigger: {
        trigger: this.container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          this.camera.position.z = 5 + progress * 2;
          this.camera.position.y = progress * 1;
        }
      }
    });

    // Animate objects based on scroll
    this.objects.forEach((obj, index) => {
      gsap.to(obj.rotation, {
        scrollTrigger: {
          trigger: this.container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            obj.rotation.x = progress * Math.PI * 2;
            obj.rotation.y = progress * Math.PI * 2;
          }
        }
      });
    });
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Continuous rotation for some objects
    this.objects.forEach((obj, index) => {
      if (index === 0) { // Sphere
        obj.rotation.x += 0.005;
        obj.rotation.y += 0.003;
      }
    });

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

    // Dispose of geometries and materials
    this.objects.forEach(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose();
        } else if (Array.isArray(obj.material)) {
          obj.material.forEach(material => material.dispose());
        }
      }
    });

    // Remove ScrollTrigger
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
} 