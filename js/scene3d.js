// 3D 世界地图（Three.js）
const Scene3D = {
  scene: null,
  camera: null,
  renderer: null,
  playerMesh: null,
  playerGroup: null,
  keys: {},
  regions: {},
  markers: {},
  animationId: null,
  cameraTarget: null,

  init() {
    const canvas = document.getElementById('game-canvas');
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 150, 400);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 80, 100);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 光照
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -200;
    sun.shadow.camera.right = 200;
    sun.shadow.camera.top = 200;
    sun.shadow.camera.bottom = -200;
    this.scene.add(sun);

    this.buildWorld();
    this.buildPlayer();
    this.bindInput();
    window.addEventListener('resize', () => this.onResize());
    this.animate();
  },

  buildWorld() {
    // 地形 - 大平面
    const groundGeo = new THREE.PlaneGeometry(500, 500, 100, 100);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x5a8a3a });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 为每个地区创建区域与地标
    Object.values(World.regions).forEach(region => {
      const group = new THREE.Group();
      group.position.set(region.position.x, 0, region.position.z);

      // 地区底座（圆形平台）
      const baseGeo = new THREE.CircleGeometry(35, 32);
      const baseMat = new THREE.MeshLambertMaterial({ color: region.color, transparent: true, opacity: 0.3 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.rotation.x = -Math.PI / 2;
      base.position.y = 0.1;
      group.add(base);

      // 中央地标建筑
      const building = this.createBuilding(region);
      group.add(building);

      // 地区名称牌
      this.createSign(region.name, group);

      this.scene.add(group);
      this.regions[region.id] = group;
      this.markers[region.id] = { x: region.position.x, z: region.position.z };
    });

    // 装饰：随机树木、岩石
    for (let i = 0; i < 120; i++) {
      const tree = this.createTree();
      const x = Utils.randInt(-240, 240);
      const z = Utils.randInt(-240, 240);
      // 避免在地区中心
      let tooClose = false;
      Object.values(World.regions).forEach(r => {
        if (Math.abs(x - r.position.x) < 40 && Math.abs(z - r.position.z) < 40) tooClose = true;
      });
      if (!tooClose) {
        tree.position.set(x, 0, z);
        tree.rotation.y = Math.random() * Math.PI * 2;
        this.scene.add(tree);
      }
    }

    // 连接各地区的路径
    this.createPaths();
  },

  createBuilding(region) {
    const group = new THREE.Group();
    const color = region.color;

    if (region.id === 'holy_empire') {
      // 教堂
      const body = new THREE.Mesh(new THREE.BoxGeometry(12, 18, 12), new THREE.MeshLambertMaterial({ color: 0xf0e8d0 }));
      body.position.y = 9; body.castShadow = true; group.add(body);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(10, 10, 4), new THREE.MeshLambertMaterial({ color: 0xc9a961 }));
      roof.position.y = 23; roof.castShadow = true; group.add(roof);
      const cross = new THREE.Mesh(new THREE.BoxGeometry(1, 6, 1), new THREE.MeshLambertMaterial({ color: 0xffd700 }));
      cross.position.y = 30; group.add(cross);
    } else if (region.id === 'emerald_council') {
      // 古树
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 20, 8), new THREE.MeshLambertMaterial({ color: 0x5a3a1a }));
      trunk.position.y = 10; trunk.castShadow = true; group.add(trunk);
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(12, 12, 12), new THREE.MeshLambertMaterial({ color: 0x2a6a2a }));
      leaves.position.y = 25; leaves.castShadow = true; group.add(leaves);
    } else if (region.id === 'lava_confederation') {
      // 火山
      const volcano = new THREE.Mesh(new THREE.ConeGeometry(15, 30, 8), new THREE.MeshLambertMaterial({ color: 0x4a3030 }));
      volcano.position.y = 15; volcano.castShadow = true; group.add(volcano);
      const lava = new THREE.Mesh(new THREE.ConeGeometry(5, 8, 8), new THREE.MeshLambertMaterial({ color: 0xff6600 }));
      lava.position.y = 28; group.add(lava);
    } else if (region.id === 'free_cities') {
      // 城市建筑群
      for (let i = 0; i < 5; i++) {
        const h = Utils.randInt(8, 18);
        const b = new THREE.Mesh(new THREE.BoxGeometry(6, h, 6), new THREE.MeshLambertMaterial({ color: 0x8a8ac0 }));
        b.position.set(Utils.randInt(-12, 12), h / 2, Utils.randInt(-12, 12));
        b.castShadow = true; group.add(b);
      }
    } else if (region.id === 'shadow_lands') {
      // 暗黑城堡
      const body = new THREE.Mesh(new THREE.BoxGeometry(14, 14, 14), new THREE.MeshLambertMaterial({ color: 0x2a2030 }));
      body.position.y = 7; body.castShadow = true; group.add(body);
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 20, 8), new THREE.MeshLambertMaterial({ color: 0x1a1020 }));
      tower.position.y = 17; tower.castShadow = true; group.add(tower);
      const spire = new THREE.Mesh(new THREE.ConeGeometry(4, 8, 8), new THREE.MeshLambertMaterial({ color: 0x4a3a6a }));
      spire.position.y = 31; group.add(spire);
    } else if (region.id === 'steppe_tribes') {
      // 帐篷群
      for (let i = 0; i < 6; i++) {
        const tent = new THREE.Mesh(new THREE.ConeGeometry(5, 7, 4), new THREE.MeshLambertMaterial({ color: 0xc9a070 }));
        const angle = (i / 6) * Math.PI * 2;
        tent.position.set(Math.cos(angle) * 10, 3.5, Math.sin(angle) * 10);
        tent.rotation.y = angle;
        tent.castShadow = true; group.add(tent);
      }
      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.5, 10, 0.5), new THREE.MeshLambertMaterial({ color: 0x8a6a4a }));
      flag.position.y = 5; group.add(flag);
    }
    return group;
  },

  createSign(text, parent) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(30, 7.5, 1);
    sprite.position.y = 40;
    parent.add(sprite);
  },

  createTree() {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 4, 6), new THREE.MeshLambertMaterial({ color: 0x5a3a1a }));
    trunk.position.y = 2; trunk.castShadow = true; group.add(trunk);
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(2.5, 6, 6), new THREE.MeshLambertMaterial({ color: 0x3a6a2a }));
    leaves.position.y = 5; leaves.castShadow = true; group.add(leaves);
    return group;
  },

  createPaths() {
    const regionList = Object.values(World.regions);
    for (let i = 0; i < regionList.length; i++) {
      for (let j = i + 1; j < regionList.length; j++) {
        const a = regionList[i], b = regionList[j];
        const dx = b.position.x - a.position.x;
        const dz = b.position.z - a.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 180) {
          const points = [
            new THREE.Vector3(a.position.x, 0.2, a.position.z),
            new THREE.Vector3(b.position.x, 0.2, b.position.z)
          ];
          const geo = new THREE.BufferGeometry().setFromPoints(points);
          const mat = new THREE.LineBasicMaterial({ color: 0xc9a961, linewidth: 2 });
          const line = new THREE.Line(geo, mat);
          this.scene.add(line);
        }
      }
    }
  },

  buildPlayer() {
    this.playerGroup = new THREE.Group();
    // 身体（用圆柱体替代 CapsuleGeometry，兼容 r128）
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 1.8, 8), new THREE.MeshLambertMaterial({ color: 0x4a90d9 }));
    body.position.y = 1.5; body.castShadow = true;
    this.playerGroup.add(body);
    // 头
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 12), new THREE.MeshLambertMaterial({ color: 0xf0c090 }));
    head.position.y = 3; head.castShadow = true;
    this.playerGroup.add(head);
    // 武器指示
    const weapon = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 0.2), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
    weapon.position.set(1, 1.5, 0); weapon.castShadow = true;
    this.playerGroup.add(weapon);

    // 起始位置
    const startRegion = World.regions[Game.state.currentRegion] || World.regions.free_cities;
    this.playerGroup.position.set(startRegion.position.x, 0, startRegion.position.z + 5);
    this.scene.add(this.playerGroup);
  },

  bindInput() {
    window.addEventListener('keydown', e => { this.keys[e.key.toLowerCase()] = true; });
    window.addEventListener('keyup', e => { this.keys[e.key.toLowerCase()] = false; });
  },

  update() {
    if (Game.state.phase !== 'worldMap') return;
    const speed = 0.5;
    let moved = false;
    const pos = this.playerGroup.position;
    if (this.keys['w'] || this.keys['arrowup']) { pos.z -= speed; moved = true; }
    if (this.keys['s'] || this.keys['arrowdown']) { pos.z += speed; moved = true; }
    if (this.keys['a'] || this.keys['arrowleft']) { pos.x -= speed; moved = true; }
    if (this.keys['d'] || this.keys['arrowright']) { pos.x += speed; moved = true; }
    if (moved) {
      // 朝向移动方向
      const angle = Math.atan2((this.keys['d'] || this.keys['arrowright'] ? 1 : 0) - (this.keys['a'] || this.keys['arrowleft'] ? 1 : 0),
                              (this.keys['w'] || this.keys['arrowup'] ? -1 : 0) - (this.keys['s'] || this.keys['arrowdown'] ? -1 : 0));
      this.playerGroup.rotation.y = angle;
      // 行走动画（身体上下浮动）
      this.playerGroup.children[0].position.y = 1.5 + Math.sin(Date.now() * 0.01) * 0.15;
    }
    // 限制范围
    pos.x = Utils.clamp(pos.x, -240, 240);
    pos.z = Utils.clamp(pos.z, -240, 240);
    // 摄像机跟随
    this.camera.position.x = pos.x;
    this.camera.position.z = pos.z + 100;
    this.camera.position.y = 80;
    this.camera.lookAt(pos.x, 0, pos.z);
    // 检查是否接近地区
    this.checkRegionProximity();
  },

  checkRegionProximity() {
    const pos = this.playerGroup.position;
    Object.values(World.regions).forEach(region => {
      const dx = pos.x - region.position.x;
      const dz = pos.z - region.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 30 && Game.state.currentRegion !== region.id) {
        Game.state.currentRegion = region.id;
        UI.showRegionEnter(region);
      }
    });
  },

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  },

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  },

  // 传送玩家到某地区
  teleportTo(regionId) {
    const r = World.regions[regionId];
    if (r && this.playerGroup) {
      this.playerGroup.position.set(r.position.x, 0, r.position.z + 5);
      Game.state.currentRegion = regionId;
    }
  }
};
