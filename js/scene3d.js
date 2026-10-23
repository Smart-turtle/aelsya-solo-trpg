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
  particles: [],
  regionGroups: {},

  // 各地区视觉主题配置
  regionThemes: {
    holy_empire: {
      groundColor: 0xd4c89a,       // 暖黄草地
      particleColor: 0xfff8c0,      // 金色圣光粒子
      particleSize: 0.8,
      particleCount: 60,
      particleType: 'holy',          // 缓慢上升的光点
      accent: 0xf5d76e,
      fogColor: 0xe8e0c8,
      skyColor: 0xc8d8f0
    },
    emerald_council: {
      groundColor: 0x2a5a2a,        // 深绿森林
      particleColor: 0x88cc66,      // 翠叶绿粒子
      particleSize: 0.6,
      particleCount: 80,
      particleType: 'leaf',          // 飘落的叶子
      accent: 0x5cb85c,
      fogColor: 0xb8d8a8,
      skyColor: 0xa0d0f0
    },
    lava_confederation: {
      groundColor: 0x5a3a2a,        // 暗红熔岩土
      particleColor: 0xff7722,      // 橙红火光
      particleSize: 1.0,
      particleCount: 70,
      particleType: 'ember',         // 上升的火星
      accent: 0xe8743c,
      fogColor: 0xc89070,
      skyColor: 0xd89060
    },
    free_cities: {
      groundColor: 0x8a8a7a,        // 灰石土地
      particleColor: 0xcccccc,      // 尘埃
      particleSize: 0.4,
      particleCount: 40,
      particleType: 'dust',          // 漂浮的尘埃
      accent: 0x7a8ef0,
      fogColor: 0xc0c0c0,
      skyColor: 0xd0d8e8
    },
    shadow_lands: {
      groundColor: 0x2a2030,        // 暗黑紫土
      particleColor: 0x8866aa,      // 紫雾
      particleSize: 1.2,
      particleCount: 90,
      particleType: 'mist',          // 弥漫的紫雾
      accent: 0x9b7ac9,
      fogColor: 0x3a3040,
      skyColor: 0x4a4058
    },
    steppe_tribes: {
      groundColor: 0x7a9a4a,        // 草原绿
      particleColor: 0xc8d890,      // 草屑/花粉
      particleSize: 0.5,
      particleCount: 50,
      particleType: 'pollen',        // 飘散的花粉
      accent: 0x9ad64a,
      fogColor: 0xd0d8b0,
      skyColor: 0xb8d0f0
    }
  },

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
      const theme = this.regionThemes[region.id] || this.regionThemes.free_cities;
      const group = new THREE.Group();
      group.position.set(region.position.x, 0, region.position.z);

      // 地区底座（圆形平台，带主题色）
      const baseGeo = new THREE.CircleGeometry(45, 48);
      const baseMat = new THREE.MeshLambertMaterial({ color: theme.groundColor, transparent: true, opacity: 0.7 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.rotation.x = -Math.PI / 2;
      base.position.y = 0.1;
      base.receiveShadow = true;
      group.add(base);

      // 外环装饰环（发光）
      const ringGeo = new THREE.RingGeometry(40, 43, 48);
      const ringMat = new THREE.MeshBasicMaterial({ color: theme.accent, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.15;
      group.add(ring);

      // 地区特色装饰地面元素
      this.createRegionDecor(region, group, theme);

      // 中央地标建筑（增强版）
      const building = this.createBuilding(region);
      group.add(building);

      // 地区名称牌
      this.createSign(region.name, group, theme);

      // 粒子效果
      this.createParticles(region, group, theme);

      this.scene.add(group);
      this.regions[region.id] = group;
      this.regionGroups[region.id] = group;
      this.markers[region.id] = { x: region.position.x, z: region.position.z };
    });

    // 装饰：随机树木、岩石（散布于各地区之间）
    for (let i = 0; i < 120; i++) {
      const tree = this.createTree();
      const x = Utils.randInt(-240, 240);
      const z = Utils.randInt(-240, 240);
      let tooClose = false;
      Object.values(World.regions).forEach(r => {
        if (Math.abs(x - r.position.x) < 45 && Math.abs(z - r.position.z) < 45) tooClose = true;
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

  // 地区特色地面装饰
  createRegionDecor(region, group, theme) {
    if (region.id === 'holy_empire') {
      // 圣光帝国：白色石柱环绕
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(1.2, 1.5, 8, 8),
          new THREE.MeshLambertMaterial({ color: 0xf0e8d0 })
        );
        pillar.position.set(Math.cos(angle) * 28, 4, Math.sin(angle) * 28);
        pillar.castShadow = true;
        group.add(pillar);
        // 柱顶圣光
        const light = new THREE.Mesh(
          new THREE.SphereGeometry(1.5, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xfff8c0 })
        );
        light.position.set(Math.cos(angle) * 28, 9, Math.sin(angle) * 28);
        group.add(light);
      }
    } else if (region.id === 'emerald_council') {
      // 翡翠森林：蘑菇环、小古树
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const r = 25 + Math.random() * 10;
        const mushroom = new THREE.Group();
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 2, 6), new THREE.MeshLambertMaterial({ color: 0xe8e0d0 }));
        stem.position.y = 1; mushroom.add(stem);
        const cap = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: i % 2 ? 0xcc4444 : 0x88aa44 }));
        cap.position.y = 2; mushroom.add(cap);
        mushroom.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
        mushroom.castShadow = true;
        group.add(mushroom);
      }
    } else if (region.id === 'lava_confederation') {
      // 熔岩邦联：熔岩裂缝、黑曜石
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const r = 20 + Math.random() * 15;
        const crack = new THREE.Mesh(
          new THREE.PlaneGeometry(3, 12),
          new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.8 })
        );
        crack.rotation.x = -Math.PI / 2;
        crack.rotation.z = Math.random() * Math.PI;
        crack.position.set(Math.cos(angle) * r, 0.2, Math.sin(angle) * r);
        group.add(crack);
      }
      // 黑曜石柱
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const obsidian = new THREE.Mesh(
          new THREE.ConeGeometry(1.5, 6, 5),
          new THREE.MeshLambertMaterial({ color: 0x1a1a1a })
        );
        obsidian.position.set(Math.cos(angle) * 32, 3, Math.sin(angle) * 32);
        obsidian.castShadow = true;
        group.add(obsidian);
      }
    } else if (region.id === 'free_cities') {
      // 自由城邦：摊位、路灯
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const stall = new THREE.Mesh(
          new THREE.BoxGeometry(4, 2.5, 3),
          new THREE.MeshLambertMaterial({ color: 0x9a8a6a })
        );
        stall.position.set(Math.cos(angle) * 26, 1.25, Math.sin(angle) * 26);
        stall.rotation.y = angle;
        stall.castShadow = true;
        group.add(stall);
        // 屋顶
        const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 1.5, 4), new THREE.MeshLambertMaterial({ color: 0xaa5533 }));
        roof.position.set(Math.cos(angle) * 26, 3.5, Math.sin(angle) * 26);
        roof.rotation.y = angle + Math.PI / 4;
        group.add(roof);
      }
    } else if (region.id === 'shadow_lands') {
      // 暗影之地：枯树、墓碑
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const r = 22 + Math.random() * 12;
        const deadTree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.8, 6, 5), new THREE.MeshLambertMaterial({ color: 0x2a1a1a }));
        trunk.position.y = 3; deadTree.add(trunk);
        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 3, 4), new THREE.MeshLambertMaterial({ color: 0x2a1a1a }));
        branch.position.set(0.8, 5, 0); branch.rotation.z = -0.5; deadTree.add(branch);
        deadTree.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
        deadTree.rotation.y = Math.random() * Math.PI;
        group.add(deadTree);
      }
      // 墓碑
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + 0.3;
        const tomb = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.6), new THREE.MeshLambertMaterial({ color: 0x4a4050 }));
        tomb.position.set(Math.cos(angle) * 18, 1.25, Math.sin(angle) * 18);
        tomb.rotation.y = angle;
        group.add(tomb);
      }
    } else if (region.id === 'steppe_tribes') {
      // 草原部落：篝火、围栏
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const r = 22;
        const campfire = new THREE.Group();
        const logs = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.5, 6), new THREE.MeshLambertMaterial({ color: 0x5a3a1a }));
        logs.position.y = 0.25; campfire.add(logs);
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.5, 6), new THREE.MeshBasicMaterial({ color: 0xff8833 }));
        flame.position.y = 1.5; campfire.add(flame);
        campfire.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
        group.add(campfire);
      }
      // 木围栏
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.5, 4), new THREE.MeshLambertMaterial({ color: 0x7a5a3a }));
        post.position.set(Math.cos(angle) * 33, 1.25, Math.sin(angle) * 33);
        group.add(post);
      }
    }
  },

  createBuilding(region) {
    const group = new THREE.Group();
    const theme = this.regionThemes[region.id] || this.regionThemes.free_cities;

    if (region.id === 'holy_empire') {
      // 大教堂：双钟楼 + 玫瑰窗 + 金顶
      const body = new THREE.Mesh(new THREE.BoxGeometry(14, 20, 10), new THREE.MeshLambertMaterial({ color: 0xf0e8d0 }));
      body.position.y = 10; body.castShadow = true; group.add(body);
      // 双塔
      for (let sx = -1; sx <= 1; sx += 2) {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3, 28, 12), new THREE.MeshLambertMaterial({ color: 0xe8e0c8 }));
        tower.position.set(sx * 8, 14, 0); tower.castShadow = true; group.add(tower);
        const spire = new THREE.Mesh(new THREE.ConeGeometry(3, 10, 12), new THREE.MeshLambertMaterial({ color: 0xffd700 }));
        spire.position.set(sx * 8, 33, 0); group.add(spire);
        const cross = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4, 0.6), new THREE.MeshBasicMaterial({ color: 0xfff8c0 }));
        cross.position.set(sx * 8, 40, 0); group.add(cross);
      }
      // 中央主顶
      const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(8, 12, 4), new THREE.MeshLambertMaterial({ color: 0xc9a961 }));
      mainRoof.position.y = 26; group.add(mainRoof);
      // 玫瑰窗
      const rose = new THREE.Mesh(new THREE.CircleGeometry(2.5, 16), new THREE.MeshBasicMaterial({ color: 0x66aaff }));
      rose.position.set(0, 14, 5.1); group.add(rose);
    } else if (region.id === 'emerald_council') {
      // 世界树：多层树冠 + 发光树洞
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(4, 6, 22, 10), new THREE.MeshLambertMaterial({ color: 0x4a2a1a }));
      trunk.position.y = 11; trunk.castShadow = true; group.add(trunk);
      // 三层树冠
      for (let i = 0; i < 3; i++) {
        const radius = 14 - i * 3;
        const h = 10;
        const leaves = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 10), new THREE.MeshLambertMaterial({ color: i === 0 ? 0x2a6a2a : (i === 1 ? 0x3a8a3a : 0x4aaa4a) }));
        leaves.position.y = 22 + i * 7; leaves.castShadow = true; group.add(leaves);
      }
      // 发光树洞
      const hollow = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), new THREE.MeshBasicMaterial({ color: 0x88ff88 }));
      hollow.position.set(0, 10, 3); group.add(hollow);
      // 缠绕的藤蔓
      for (let i = 0; i < 4; i++) {
        const vine = new THREE.Mesh(new THREE.TorusGeometry(5, 0.3, 4, 12), new THREE.MeshLambertMaterial({ color: 0x4a6a2a }));
        vine.position.y = 5 + i * 4;
        vine.rotation.x = Math.PI / 2;
        group.add(vine);
      }
    } else if (region.id === 'lava_confederation') {
      // 火山要塞：熔岩口 + 矮人要塞
      const volcano = new THREE.Mesh(new THREE.ConeGeometry(18, 35, 10), new THREE.MeshLambertMaterial({ color: 0x3a2020 }));
      volcano.position.y = 17.5; volcano.castShadow = true; group.add(volcano);
      // 熔岩口
      const crater = new THREE.Mesh(new THREE.CylinderGeometry(7, 5, 4, 10), new THREE.MeshBasicMaterial({ color: 0xff4400 }));
      crater.position.y = 36; group.add(crater);
      // 熔岩溢出
      const lavaFlow = new THREE.Mesh(new THREE.ConeGeometry(3, 10, 6), new THREE.MeshBasicMaterial({ color: 0xff6600 }));
      lavaFlow.position.set(5, 30, 0); lavaFlow.rotation.z = 0.5; group.add(lavaFlow);
      // 矮人要塞入口
      const fort = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 6), new THREE.MeshLambertMaterial({ color: 0x5a4a3a }));
      fort.position.set(0, 3, 10); fort.castShadow = true; group.add(fort);
      const gate = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 0.5), new THREE.MeshLambertMaterial({ color: 0x2a1a0a }));
      gate.position.set(0, 2, 13.1); group.add(gate);
      // 锻造火光
      const forgeGlow = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff8833 }));
      forgeGlow.position.set(-5, 2, 8); group.add(forgeGlow);
    } else if (region.id === 'free_cities') {
      // 自由城邦：多层建筑群 + 中央高塔
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = 12 + Math.random() * 6;
        const h = Utils.randInt(8, 20);
        const w = Utils.randInt(4, 7);
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), new THREE.MeshLambertMaterial({ color: 0x8a8ac0 }));
        b.position.set(Math.cos(angle) * r, h / 2, Math.sin(angle) * r);
        b.rotation.y = angle;
        b.castShadow = true; group.add(b);
        // 屋顶
        const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.8, 3, 4), new THREE.MeshLambertMaterial({ color: 0xaa5533 }));
        roof.position.set(Math.cos(angle) * r, h + 1.5, Math.sin(angle) * r);
        roof.rotation.y = angle;
        group.add(roof);
      }
      // 中央法师塔
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 30, 12), new THREE.MeshLambertMaterial({ color: 0x6a6aaa }));
      tower.position.y = 15; tower.castShadow = true; group.add(tower);
      const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(5, 10, 12), new THREE.MeshLambertMaterial({ color: 0x4a4a8a }));
      towerRoof.position.y = 35; group.add(towerRoof);
      // 塔顶魔法球
      const orb = new THREE.Mesh(new THREE.SphereGeometry(2, 12, 12), new THREE.MeshBasicMaterial({ color: 0x66ccff }));
      orb.position.y = 42; group.add(orb);
    } else if (region.id === 'shadow_lands') {
      // 暗黑城堡：尖塔 + 紫色能量
      const body = new THREE.Mesh(new THREE.BoxGeometry(16, 16, 16), new THREE.MeshLambertMaterial({ color: 0x1a1020 }));
      body.position.y = 8; body.castShadow = true; group.add(body);
      // 四角尖塔
      const corners = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
      corners.forEach(([cx, cz]) => {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3, 24, 8), new THREE.MeshLambertMaterial({ color: 0x120818 }));
        tower.position.set(cx * 9, 12, cz * 9); tower.castShadow = true; group.add(tower);
        const spire = new THREE.Mesh(new THREE.ConeGeometry(3, 10, 8), new THREE.MeshLambertMaterial({ color: 0x3a2a5a }));
        spire.position.set(cx * 9, 29, cz * 9); group.add(spire);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xaa66cc }));
        glow.position.set(cx * 9, 35, cz * 9); group.add(glow);
      });
      // 中央黑塔
      const mainTower = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 35, 10), new THREE.MeshLambertMaterial({ color: 0x0a0510 }));
      mainTower.position.y = 17.5; mainTower.castShadow = true; group.add(mainTower);
      const mainSpire = new THREE.Mesh(new THREE.ConeGeometry(4, 12, 10), new THREE.MeshLambertMaterial({ color: 0x2a1a4a }));
      mainSpire.position.y = 41; group.add(mainSpire);
      // 中央紫色光球
      const voidOrb = new THREE.Mesh(new THREE.SphereGeometry(2.5, 12, 12), new THREE.MeshBasicMaterial({ color: 0x8844cc }));
      voidOrb.position.y = 48; group.add(voidOrb);
    } else if (region.id === 'steppe_tribes') {
      // 草原部落：大汗金帐 + 环绕帐篷
      // 金帐（中央大帐篷）
      const goldenTent = new THREE.Mesh(new THREE.ConeGeometry(8, 14, 8), new THREE.MeshLambertMaterial({ color: 0xe8c84a }));
      goldenTent.position.y = 7; goldenTent.castShadow = true; group.add(goldenTent);
      const tentTop = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd700 }));
      tentTop.position.y = 14.5; group.add(tentTop);
      // 环绕帐篷
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = 20;
        const tent = new THREE.Mesh(new THREE.ConeGeometry(4, 7, 4), new THREE.MeshLambertMaterial({ color: i % 2 ? 0xc9a070 : 0xb8905a }));
        tent.position.set(Math.cos(angle) * r, 3.5, Math.sin(angle) * r);
        tent.rotation.y = angle;
        tent.castShadow = true; group.add(tent);
      }
      // 旗杆与旗帜
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.3, 16, 0.3), new THREE.MeshLambertMaterial({ color: 0x5a3a1a }));
      pole.position.y = 8; group.add(pole);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), new THREE.MeshBasicMaterial({ color: 0xcc3333, side: THREE.DoubleSide }));
      flag.position.set(3, 13, 0); group.add(flag);
    }
    return group;
  },

  createSign(text, parent, theme) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    // 半透明背景
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, 256, 64);
    // 边框
    const accentHex = '#' + theme.accent.toString(16).padStart(6, '0');
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 252, 60);
    // 文字
    ctx.fillStyle = accentHex;
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = accentHex;
    ctx.shadowBlur = 8;
    ctx.fillText(text, 128, 32);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(30, 7.5, 1);
    sprite.position.y = 50;
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

  // 创建地区粒子效果
  createParticles(region, group, theme) {
    const count = theme.particleCount;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 1] = Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: theme.particleColor,
      size: theme.particleSize,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geo, mat);
    points.userData = {
      type: theme.particleType,
      speeds: Array.from({ length: count }, () => 0.02 + Math.random() * 0.05)
    };
    group.add(points);
    this.particles.push(points);
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
    window.addEventListener('keydown', e => {
      this.keys[e.key.toLowerCase()] = true;
      // 按 E 进入当前接近的地区
      if (e.key.toLowerCase() === 'e' && this.nearRegion && Game.state.phase === 'worldMap') {
        this.enterRegion(this.nearRegion);
      }
    });
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
    let nearest = null;
    let nearestDist = Infinity;
    Object.values(World.regions).forEach(region => {
      const dx = pos.x - region.position.x;
      const dz = pos.z - region.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < nearestDist) { nearestDist = dist; nearest = region; }
    });
    if (nearest && nearestDist < 40) {
      this.nearRegion = nearest.id;
      Game.state.currentRegion = nearest.id;
      UI.showRegionPrompt(nearest);
    } else {
      this.nearRegion = null;
      UI.hideRegionPrompt();
    }
    // 根据最近地区动态调整天空与雾效
    if (nearest) {
      const theme = this.regionThemes[nearest.id] || this.regionThemes.free_cities;
      const t = Math.min(1, (80 - nearestDist) / 60); // 距离越近影响越大
      this._lerpAtmosphere(theme, t);
    }
  },

  // 平滑过渡天空与雾色
  _lerpAtmosphere(theme, t) {
    if (!this._targetSky) this._targetSky = new THREE.Color(this.scene.background.getHex());
    if (!this._targetFog) this._targetFog = new THREE.Color(this.scene.fog.color.getHex());
    this._targetSky.setHex(theme.skyColor);
    this._targetFog.setHex(theme.fogColor);
    this.scene.background.lerp(this._targetSky, 0.02 * t);
    this.scene.fog.color.lerp(this._targetFog, 0.02 * t);
  },

  // 进入地区，触发剧情对话
  enterRegion(regionId) {
    const region = World.regions[regionId];
    if (!region) return;
    this.nearRegion = null;
    UI.hideRegionPrompt();
    Game.state.currentRegion = regionId;
    // 根据游戏进度决定进入哪个剧情节点
    const nodeId = Story.getRegionEntryNode(regionId);
    Story.showNode(nodeId);
  },

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    this.update();
    this.animateParticles();
    this.renderer.render(this.scene, this.camera);
  },

  // 粒子动画
  animateParticles() {
    const t = Date.now() * 0.001;
    this.particles.forEach(points => {
      const pos = points.geometry.attributes.position;
      const type = points.userData.type;
      const speeds = points.userData.speeds;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const speed = speeds[i];
        if (type === 'holy' || type === 'ember') {
          // 上升后回到底部
          pos.setY(i, y + speed * 2);
          if (y > 50) pos.setY(i, 0);
        } else if (type === 'leaf' || type === 'pollen') {
          // 飘落 + 水平摆动
          pos.setY(i, y - speed * 0.8);
          pos.setX(i, pos.getX(i) + Math.sin(t * 2 + i) * 0.05);
          if (y < 0) pos.setY(i, 50);
        } else if (type === 'mist') {
          // 缓慢漂浮扩散
          pos.setY(i, y + Math.sin(t + i) * 0.02);
          pos.setX(i, pos.getX(i) + Math.cos(t * 0.5 + i) * 0.03);
          pos.setZ(i, pos.getZ(i) + Math.sin(t * 0.3 + i) * 0.03);
        } else {
          // dust: 缓慢漂浮
          pos.setY(i, y + Math.sin(t + i * 0.5) * 0.02);
          if (y > 50) pos.setY(i, 0);
          else if (y < 0) pos.setY(i, 50);
        }
      }
      pos.needsUpdate = true;
      // 粒子整体轻微旋转
      points.rotation.y += 0.0005;
    });
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
