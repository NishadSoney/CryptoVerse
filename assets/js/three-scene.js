class CryptoUniverseScene {
  constructor(containerElement) {
    if (!containerElement) {
      console.error('CryptoUniverseScene: container element is required');
      return;
    }
    this.container = containerElement;
    this.init();
  }

  init() {
    // 1. Scene Setup
    this.scene = new THREE.Scene();
    
    // We want a transparent background because the hero section has its own gradient
    this.scene.background = null; 

    // 2. Camera Setup
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 6.5;

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(10, 20, 10);
    this.scene.add(mainLight);

    const blueLight = new THREE.PointLight(0x38bdf8, 2, 50);
    blueLight.position.set(-5, -5, -5);
    this.scene.add(blueLight);

    const purpleLight = new THREE.PointLight(0x818cf8, 2, 50);
    purpleLight.position.set(5, 5, 5);
    this.scene.add(purpleLight);

    // Group to hold everything
    this.mainGroup = new THREE.Group();
    // Tilt it slightly to match the original hero vibe
    this.mainGroup.rotation.x = 0.2; 
    this.scene.add(this.mainGroup);

    // Mouse Interaction
    this.mouse = new THREE.Vector2();
    this.targetMouse = new THREE.Vector2();
    this.currentMouse = new THREE.Vector2();
    
    this.onMouseMove = this.onMouseMove.bind(this);
    window.addEventListener('mousemove', this.onMouseMove);

    // Resize handler
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    // Build the globe
    this.buildGenesisCoin();

    // Start animation loop
    this.animate();
  }

  createCryptoSprite(text, color, textColor = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.font = 'bold 64px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 68);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.6, 0.6, 1);
    
    return sprite;
  }

  buildGenesisCoin() {
    this.genesisGroup = new THREE.Group();

    // Outer crystalline wireframe cage
    const outerGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      wireframe: true,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 1.0
    });
    this.genesisOuter = new THREE.Mesh(outerGeo, outerMat);
    this.genesisGroup.add(this.genesisOuter);

    // Inner glowing sphere core
    const innerGeo = new THREE.SphereGeometry(0.75, 32, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: 0x4338ca,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 1.0
    });
    this.genesisInner = new THREE.Mesh(innerGeo, innerMat);
    this.genesisGroup.add(this.genesisInner);

    // Orbiting Crypto Icons
    this.orbitingIcons = new THREE.Group();
    const icons = [
      { text: '₿', color: '#f59e0b' },
      { text: 'Ð', color: '#eab308' },
      { text: 'Ξ', color: '#6366f1' },
      { text: '₮', color: '#059669' },
      { text: 'BNB', color: '#facc15' },
      { text: '✕', color: '#0ea5e9' },
      { text: 'SOL', color: '#10b981' },
      { text: 'TRX', color: '#ef4444' }
    ];
    
    this.genesisIcons = [];
    icons.forEach((iconData, i) => {
      const sprite = this.createCryptoSprite(iconData.text, iconData.color);
      const angle = (i / icons.length) * Math.PI * 2;
      const radius = 2.0;
      // A random tilt multiplier to create a diagonal orbit
      const tilt = (Math.random() - 0.5) * 2;
      const tiltPhase = Math.random() * Math.PI * 2;
      
      this.orbitingIcons.add(sprite);
      this.genesisIcons.push({ sprite, angle, radius, tilt, tiltPhase, speed: 0.001 + Math.random() * 0.001 });
    });
    this.genesisGroup.add(this.orbitingIcons);

    this.mainGroup.add(this.genesisGroup);
  }

  // Lerp helper for smooth transitions
  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  onMouseMove(e) {
    // Parallax effect restricted to the hero container area could be calculated here, 
    // but full screen window calculation is usually smoother.
    this.targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 0.25;
    this.targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 0.25;
  }

  onResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animId = requestAnimationFrame(this.animate.bind(this));
    this.time = (this.time || 0) + 0.016;

    // Mouse Parallax smooth lerp (reduced sensitivity)
    this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * 0.04;
    this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * 0.04;
    this.mainGroup.rotation.y = this.currentMouse.x * 0.5;
    this.mainGroup.rotation.x = 0.2 + this.currentMouse.y * 0.4;

    // Continuous idle animations
    if (this.genesisOuter) {
      this.genesisOuter.rotation.x += 0.002;
      this.genesisOuter.rotation.y += 0.004;
    }
    
    if (this.orbitingIcons && this.genesisIcons) {
      this.genesisIcons.forEach((icon) => {
        // Diagonal/Tilted Orbit
        icon.angle += icon.speed;
        const targetX = Math.cos(icon.angle) * icon.radius;
        const targetZ = Math.sin(icon.angle) * icon.radius;
        const targetY = Math.sin(icon.angle + icon.tiltPhase) * icon.tilt;
        
        icon.sprite.position.x = this.lerp(icon.sprite.position.x, targetX, 0.1);
        icon.sprite.position.y = this.lerp(icon.sprite.position.y, targetY, 0.1);
        icon.sprite.position.z = this.lerp(icon.sprite.position.z, targetZ, 0.1);
      });
      
      this.orbitingIcons.rotation.y -= 0.003;
      this.orbitingIcons.rotation.z = Math.sin(this.time * 0.5) * 0.1;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}

// Export to global scope for HTML inline scripts
window.CryptoUniverseScene = CryptoUniverseScene;
