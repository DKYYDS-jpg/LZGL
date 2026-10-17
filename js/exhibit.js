/* ==========================================================
   3D 红色记忆展厅 | 开场动画 + 星空穹顶 + 音效 + 呼吸光 + PLY/GLB模型
   ========================================================== */

(function init3DExhibit() {
  if (typeof THREE === 'undefined') {
    console.error('Three.js 未加载');
    return;
  }

  const intro = document.getElementById('exhibitIntro');
  const header = document.getElementById('exhibitHeader');
  const nav = document.getElementById('exhibitNav');
  const hint = document.getElementById('exhibitHint');
  const infoBox = document.getElementById('exhibitInfo');
  const infoTitle = document.getElementById('exhibitInfoTitle');
  const infoDesc = document.getElementById('exhibitInfoDesc');
  const infoOverlay = document.getElementById('exhibitInfoOverlay');
  const canvas = document.getElementById('canvas3d');

  let scene, camera, renderer, controls;
  let raycaster, pointer;
  let interactables = [];
  let animatedItems = [];
  let displayGroup = null;
  let monumentStar = null;
  let skylight = null;
  let ambientLight = null;
  let storyEffects = [];
  let entryProgress = 0;
  let entryStartTime = null;
  const ENTRY_DURATION = 3000;
  let activeGallery = 'redarmy';
  let introFinished = false;

  // 摄像机聚焦/复位动画相关变量
  let originalCameraPos = new THREE.Vector3();
  let originalTarget = new THREE.Vector3();
  let cameraTween = {
    active: false,
    progress: 0,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3()
  };

  /* ==========================================================
     音效系统
     ========================================================== */
  let audioCtx = null;
  let userInteracted = false;
  let pendingSounds = [];
  let bgmConnected = false;

  function initAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return null;
      }
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!bgmConnected) {
      const bgm = document.getElementById('bgMusic');
      if (bgm) {
        try {
          const source = audioCtx.createMediaElementSource(bgm);
          source.connect(audioCtx.destination);
          bgmConnected = true;
        } catch (e) {
          bgmConnected = true;
        }
      }
    }

    return audioCtx;
  }

  ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(evt => {
    document.addEventListener(evt, initAudio, { passive: true });
  });

  ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(evt => {
    document.addEventListener(evt, () => {
      if (userInteracted) return;
      userInteracted = true;
      initAudio();
      setTimeout(() => {
        pendingSounds.forEach(t => actuallyPlay(t));
        pendingSounds = [];
      }, 150);
    }, { passive: true, once: true });
  });

  function playSound(type) {
    if (!userInteracted) {
      pendingSounds.push(type);
      return;
    }
    if (!audioCtx) initAudio();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => actuallyPlay(type));
    } else {
      actuallyPlay(type);
    }
  }

  function actuallyPlay(type) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    switch (type) {
      case 'bell': {
        [261.63, 392, 523.25].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const t = now + i * 0.15;
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 2);
          osc.connect(gain).connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 2);
        });
        break;
      }
      case 'tap': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case 'horn': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(330, now + 0.3);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }
      case 'switch': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case 'complete': {
        [523, 659, 784, 1046].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const t = now + i * 0.08;
          gain.gain.setValueAtTime(0.13, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          osc.connect(gain).connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 0.4);
        });
        break;
      }
    }
  }

  /* ==========================================================
     四馆数据
     ========================================================== */
  const GALLERIES = {
    redarmy: {
      accent: 0xcc0000,
      items: [
        { 
          name: '红军帽', 
          model: 'models/hongjun-bajiaomao.ply', 
          desc: '八角帽上的红星，见证了红军在古蔺的峥嵘岁月与长征精神。', 
          type: 'hat', 
          anim: 'spin' 
        },
        { name: '渡江门板', model: 'models/dujiang-menban.ply', desc: '1935年红军四渡赤水，太平渡、二郎滩的老乡们拆下自家门板，助红军搭建浮桥。', color: 0x8a6a4a, type: 'wooden_plank', anim: 'float' },
        { name: '红军号', model: 'models/hongjun-hao.ply', desc: '冲锋的号角响彻赤水河畔，见证了四渡赤水这一军事奇迹。', color: 0xd4a843, type: 'horn', anim: 'sway' },
        { name: '行军马灯', model: 'models/xingjun-madeng.ply', desc: '照亮红军在古蔺崇山峻岭中夜行军与渡河的道路。', color: 0x8a6a3a, type: 'lantern', anim: 'float' },
        { name: '草鞋', model: 'models/caoxie.ply', desc: '踏遍古蔺千山万水，沾满赤水河畔泥土的革命印记。', color: 0x8a6a3a, type: 'straw_shoes', anim: 'float' },
        { name: '望远镜', model: 'models/wangyuanjing.ply', desc: '红军指挥员用它洞察敌情，在四渡赤水中运筹帷幄、声东击西。', color: 0x2a2a2a, type: 'telescope', anim: 'spin' }
      ],
    },
    scenery: {
      accent: 0x5a9a5a,
      items: [
        { name: '太平古镇', model: 'models/taiping-guzhen.ply', desc: '国家AAAA级旅游景区，被誉为“没有围墙的红色博物馆”。', color: 0x8a6a4a, type: 'town', anim: 'float' },
        { name: '黄荆老林', model: 'models/huangjing-laolin.ply', desc: '北纬28度最后的原始常绿阔叶林，森林覆盖率98%以上。', color: 0x3a7a3a, type: 'tree', anim: 'sway' },
        { name: '大黑洞', model: 'models/dahei-dong.ply', desc: '喀斯特溶洞奇观，洞内高度差300余米，苗寨民俗文化区。', color: 0x5a4a6a, type: 'cave', anim: 'float' },
        { name: '观文千鸟湖', model: 'models/guanwen-qianniaohu.ply', desc: '网红玻璃栈道，每年冬季上万只候鸟在此越冬。', color: 0x4a7a9a, type: 'lake', anim: 'ripple' },
        { name: '红龙湖', model: 'models/honglong-hu.ply', desc: '省级森林公园，丹霞地貌与高山湖泊交相辉映。', color: 0xb85a3a, type: 'mountain', anim: 'float' },
        { name: '双沙花海', model: 'models/shuangsha-huahai.ply', desc: '连续16届菜花节，累计游客超30万人次。', color: 0xe8c030, type: 'flower', anim: 'spin' },
      ],
    },
    food: {
      accent: 0xe8a030,
      items: [
        { name: '古蔺麻辣鸡', model: 'models/gulin-malaji.ply', desc: '国家地理标志，年销240万只，登过《舌尖上的中国2》。', color: 0xb84820, type: 'chicken', anim: 'float' },
        { name: '古蔺手工面', model: 'models/gulin-shougongmian.ply', desc: '国家地理标志，年产5.2万吨，远销9个国家。', color: 0xf0d8a0, type: 'noodle', anim: 'float' },
        { name: '赶黄草', model: 'models/ganhuangcao.ply', desc: '国家地理标志，苗族“神仙草”，药食同源。', color: 0x5a9a5a, type: 'herb', anim: 'sway' },
        { name: '石宝红汤羊肉', model: 'models/shibao-hongtang-yangrou.ply', desc: '省级名菜，入选“味美四川”名录。', color: 0xa03020, type: 'meat', anim: 'float' },
        { name: '郎酒', model: 'models/langjiu.ply', desc: '中国两大酱香白酒之一，产自赤水河畔二郎镇。', color: 0xd4a843, type: 'bottle', anim: 'spin' },
        { name: '古蔺甜橙', model: 'models/gulin-tiancheng.ply', desc: '赤水河谷孕育，皮薄多汁，每年11月成熟。', color: 0xe8a030, type: 'orange', anim: 'spin' },
      ],
    },
    heritage: {
      accent: 0xc84a8a,
      items: [
        { name: '古蔺花灯', model: 'models/gulin-huadeng.ply', desc: '国家级非遗，俗称“扭扭灯”，花灯之乡的活态传承。', color: 0xd84a4a, type: 'lantern', anim: 'swing' },
        { name: '苗族蜡染', model: 'models/miaozu-laran.ply', desc: '传统印染工艺，带动1000余人居家就业。', color: 0x3a5a8a, type: 'cloth', anim: 'wave' },
        { name: '苗族刺绣', model: 'models/miaozu-cixiu.ply', desc: '纹样精美、色彩丰富，正申报市级非遗名录。', color: 0xc84a8a, type: 'embroidery', anim: 'spin' },
        { name: '芦笙', model: 'models/lusheng.ply', desc: '苗族传统乐器，制作技艺可追溯至清朝陶氏一脉。', color: 0xb8944a, type: 'lusheng', anim: 'sway' },
        { name: '黄荆根雕', model: 'models/huangjing-gendiao.ply', desc: '传统美术，依形就势，每一件都是独一无二的艺术品。', color: 0x8a6a4a, type: 'carving', anim: 'float' },
        { name: '踩山节', model: 'models/caishan-jiegu.ply', desc: '省级非遗，2026年吸引约5万游客。', color: 0xa01818, type: 'drum', anim: 'spin' },
      ],
    },
  };

  /* ==========================================================
     初始化
     ========================================================== */
  function initScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1a0a0a, 0.02);

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 60);
    camera.lookAt(0, 1.5, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    scene.environment = createEnvironment();

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 4;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minPolarAngle = 0.2;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.35;
    controls.enablePan = false;
    controls.enabled = false;

    ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    scene.add(new THREE.HemisphereLight(0xf5d78e, 0x1a0a0a, 0.4));

    skylight = new THREE.SpotLight(0xf5d78e, 2.0);
    skylight.position.set(0, 20, 0);
    skylight.angle = Math.PI / 4;
    skylight.penumbra = 0.8;
    skylight.castShadow = true;
    skylight.shadow.mapSize.width = 2048;
    skylight.shadow.mapSize.height = 2048;
    scene.add(skylight);

    [0xa01818, 0xd4a843, 0xa01818, 0xd4a843].forEach((c, i) => {
      const light = new THREE.PointLight(c, 0.9, 40);
      const angle = (i / 4) * Math.PI * 2;
      light.position.set(Math.cos(angle) * 12, 6, Math.sin(angle) * 12);
      scene.add(light);
    });

    const rimLight = new THREE.DirectionalLight(0xd4a843, 0.5);
    rimLight.position.set(-10, 8, -10);
    scene.add(rimLight);

    createHall();
    scene.add(createMonument());
    createParticles();
    createLightBeams();
    createStarDome();

    displayGroup = new THREE.Group();
    scene.add(displayGroup);
    buildGallery('redarmy');

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    window.addEventListener('resize', onResize);
    initPointerEvents();

    infoBox.addEventListener('click', closeInfo);
    if (infoOverlay) infoOverlay.addEventListener('click', closeInfo);

    document.querySelectorAll('.exhibit-nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const g = btn.dataset.gallery;
        if (!g || g === activeGallery) return;
        initAudio();
        playSound('switch');
        document.querySelectorAll('.exhibit-nav-btn').forEach((b) =>
          b.classList.toggle('active', b === btn)
        );
        activeGallery = g;
        switchGallery(g);
      });
    });

    animate();
    startIntroSequence();
  }

  function startIntroSequence() {
    setTimeout(() => {
      if (intro) intro.classList.add('hide');
      playSound('bell');

      setTimeout(() => {
        if (header) header.classList.add('show');
        if (nav) nav.classList.add('show');
        if (hint) hint.classList.add('show');
        introFinished = true;
        entryStartTime = Date.now();
      }, 800);
    }, 3200);
  }

  let starDome = null;
  function createStarDome() {
    const geo = new THREE.BufferGeometry();
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 40 + Math.random() * 15;

      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      positions[i * 3 + 1] = Math.abs(Math.cos(phi)) * r + 10;
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;

      sizes[i] = 0.3 + Math.random() * 0.9;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xf5d78e,
      size: 0.35,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
      depthWrite: false,
    });

    starDome = new THREE.Points(geo, mat);
    starDome.userData._isStarDome = true;
    scene.add(starDome);
  }

  function createEnvironment() {
    const cvs = document.createElement('canvas');
    cvs.width = 512;
    cvs.height = 256;
    const ctx = cvs.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#5a3a1a');
    grad.addColorStop(0.5, '#2a1510');
    grad.addColorStop(1, '#0a0202');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    for (let i = 0; i < 12; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 120 + 40;
      const r = 30 + Math.random() * 70;
      const radial = ctx.createRadialGradient(x, y, 0, x, y, r);
      radial.addColorStop(0, 'rgba(245, 215, 142, 0.7)');
      radial.addColorStop(0.5, 'rgba(212, 168, 67, 0.3)');
      radial.addColorStop(1, 'rgba(212, 168, 67, 0)');
      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(cvs);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function createLightBeams() {
    for (let i = 0; i < 3; i++) {
      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5 - i * 0.5, 4 - i * 0.8, 13, 32, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0xf5d78e,
          transparent: true,
          opacity: 0.025 - i * 0.005,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      beam.position.y = 5;
      beam.rotation.y = i * Math.PI / 3;
      scene.add(beam);
    }
  }

  function switchGallery(key) {
    const gallery = GALLERIES[key];
    if (!gallery) return;

    // 集章打卡：参观到该馆即点亮徽章
    if (window.__stampCollect) window.__stampCollect(key);

    // 自动巡游：更新巡游目标馆，并中止进行中的巡游
    tourHallKey = key;
    stopTour();

    closeInfo();
    clearStoryEffects();

    while (displayGroup.children.length > 0) {
      const child = displayGroup.children[0];
      displayGroup.remove(child);
      disposeObject(child);
    }
    interactables = [];
    animatedItems = [];

    if (monumentStar && monumentStar.material) {
      monumentStar.material.color.setHex(gallery.accent);
      monumentStar.material.emissive.setHex(gallery.accent);
      monumentStar.material.emissiveIntensity = 0.7;
    }

    buildGallery(key);
  }

  function disposeObject(obj) {
    obj.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    });
  }

  function closeInfo() {
    infoBox.classList.remove('show');
    if (infoOverlay) infoOverlay.classList.remove('show');
    clearTimeout(window._exhibitTimer);

    // 触发摄像机复位
    if (camera.position.distanceTo(originalCameraPos) > 0.5) {
      cameraTween.startPos.copy(camera.position);
      cameraTween.startTarget.copy(controls.target);
      cameraTween.endPos.copy(originalCameraPos);
      cameraTween.endTarget.copy(originalTarget);
      cameraTween.progress = 0;
      cameraTween.active = true;
      controls.enabled = false;
    }
  }

  function buildGallery(key) {
    const gallery = GALLERIES[key];
    if (!gallery) return;

    const items = gallery.items;
    const count = items.length;
    const RADIUS = 9;

    items.forEach((item, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * RADIUS;
      const z = Math.sin(angle) * RADIUS;

      const caseGroup = new THREE.Group();
      caseGroup.position.set(x, -2, z);
      caseGroup.lookAt(0, -2, 0);

      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.3, 0.4, 32),
        new THREE.MeshStandardMaterial({ color: 0x3a1a1a, roughness: 0.6, metalness: 0.4 })
      );
      base.position.y = 0.2;
      base.castShadow = true;
      base.receiveShadow = true;
      caseGroup.add(base);

      const trim = new THREE.Mesh(
        new THREE.RingGeometry(1.05, 1.15, 32),
        new THREE.MeshBasicMaterial({
          color: 0xd4a843,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        })
      );
      trim.rotation.x = -Math.PI / 2;
      trim.position.y = 0.41;
      caseGroup.add(trim);

      const exhibit = createExhibitShape(item);
      exhibit.position.y = 1.4;
      exhibit.userData = {
        name: item.name,
        desc: item.desc,
        animType: item.anim,
        baseY: 1.4,
        phase: Math.random() * Math.PI * 2,
      };
      caseGroup.add(exhibit);
      interactables.push(exhibit);
      animatedItems.push(exhibit);

      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 2.4, 32, 1, true),
        new THREE.MeshPhysicalMaterial({
          color: 0xf5d78e,
          transparent: true,
          opacity: 0.1,
          roughness: 0.05,
          metalness: 0.1,
          side: THREE.DoubleSide,
          envMapIntensity: 1.5,
        })
      );
      glass.position.y = 1.6;
      caseGroup.add(glass);

      const glassTop = new THREE.Mesh(
        new THREE.CircleGeometry(1, 32),
        new THREE.MeshPhysicalMaterial({
          color: 0xf5d78e,
          transparent: true,
          opacity: 0.13,
          side: THREE.DoubleSide,
          envMapIntensity: 1.5,
        })
      );
      glassTop.rotation.x = -Math.PI / 2;
      glassTop.position.y = 2.8;
      caseGroup.add(glassTop);

      const glowRing = new THREE.Mesh(
        new THREE.RingGeometry(1.15, 1.4, 48),
        new THREE.MeshBasicMaterial({
          color: gallery.accent,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide,
        })
      );
      glowRing.rotation.x = -Math.PI / 2;
      glowRing.position.y = 0.42;
      caseGroup.add(glowRing);

      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(1.5, 32),
        new THREE.MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
        })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.005;
      caseGroup.add(shadow);

      displayGroup.add(caseGroup);

      const nameCanvas = document.createElement('canvas');
      nameCanvas.width = 256;
      nameCanvas.height = 64;
      const ctx = nameCanvas.getContext('2d');
      ctx.fillStyle = 'rgba(26, 10, 10, 0.9)';
      ctx.fillRect(0, 0, 256, 64);
      ctx.strokeStyle = '#d4a843';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, 252, 60);
      ctx.fillStyle = '#f5d78e';
      ctx.font = 'bold 24px "STKaiti", "KaiTi", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.name, 128, 34);

      const texture = new THREE.CanvasTexture(nameCanvas);
      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.4),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true })
      );
      plaque.position.set(0, 3.3, 0);
      plaque.userData._billboard = true;
      caseGroup.add(plaque);
    });
  }

  /* ==========================================================
     展品创建
     ========================================================== */
  function createExhibitShape(item) {
    if (item.model) {
      const group = new THREE.Group();
      const filePath = item.model;
      const isPLY = filePath.toLowerCase().endsWith('.ply');

      console.log('开始加载模型：', filePath);

      function onModelLoaded(object) {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        console.log('模型尺寸：', item.name,
          size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2));

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? 1.6 / maxDim : 1;
        object.scale.setScalar(scale);

        object.position.set(
          -center.x * scale,
          -box.min.y * scale,
          -center.z * scale
        );

        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        group.add(object);
        console.log('模型加载成功：', item.name);
      }

      function onLoadError(err) {
        console.warn('模型加载失败：', err);
        group.add(createShape(item.type, item.color, item.anim));
      }

      if (isPLY) {
        const loader = new THREE.PLYLoader();
        loader.load(
          filePath,
          (geometry) => {
            geometry.computeVertexNormals();
            geometry.center();

            // 开启顶点颜色，显示白帽+红星原生质感
            const material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              vertexColors: true, 
              roughness: 0.75,
              metalness: 0.1,
              flatShading: false,
              side: THREE.DoubleSide,
            });

            const mesh = new THREE.Mesh(geometry, material);
            onModelLoaded(mesh);
          },
          undefined,
          onLoadError
        );
      } else {
        const loader = new THREE.GLTFLoader();
        loader.load(
          filePath,
          (gltf) => onModelLoaded(gltf.scene),
          undefined,
          onLoadError
        );
      }

      return group;
    }

    return createShape(item.type, item.color, item.anim);
  }

  /* ==========================================================
     展品几何体
     ========================================================== */
  function createShape(type, color, anim) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: color, roughness: 0.45, metalness: 0.35,
      emissive: color, emissiveIntensity: 0.15, envMapIntensity: 0.8,
    });

    switch (type) {
      case 'hat': {
        group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.08, 32), mat));
        const top = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.5, 32), mat);
        top.position.y = 0.28;
        group.add(top);
        const star = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12),
          new THREE.MeshBasicMaterial({ color: 0xa01818 }));
        star.position.set(0, 0.32, 0.5);
        group.add(star);
        break;
      }
      case 'wooden_plank': {
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.95, metalness: 0.05 });
        const plank = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.8), woodMat);
        plank.rotation.z = Math.PI / 6;
        plank.position.y = 0.2;
        group.add(plank);
        for (let i = 0; i < 4; i++) {
          const nail = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.4 }));
          nail.position.set(-0.6 + i * 0.4, 0.26, 0.2);
          group.add(nail);
        }
        break;
      }
      case 'telescope': {
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.8, roughness: 0.2 });
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4a843, metalness: 0.9, roughness: 0.3 });
        
        const tube1 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.8, 24), metalMat);
        tube1.rotation.z = Math.PI / 2;
        tube1.position.x = -0.3;
        group.add(tube1);
        
        const tube2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 24), brassMat);
        tube2.rotation.z = Math.PI / 2;
        tube2.position.x = 0.3;
        group.add(tube2);
        
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.14, 24),
          new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6 }));
        lens.rotation.y = Math.PI / 2;
        lens.position.x = -0.7;
        group.add(lens);
        break;
      }
      case 'horn': {
        const tube = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 16, 32, Math.PI * 1.5),
          new THREE.MeshStandardMaterial({ color: 0xd4a843, metalness: 0.8, roughness: 0.3 }));
        tube.rotation.x = Math.PI / 2;
        tube.rotation.z = Math.PI / 4;
        tube.position.y = -0.2;
        group.add(tube);
        const bell = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 16),
          new THREE.MeshStandardMaterial({ color: 0xd4a843, metalness: 0.8, roughness: 0.3 }));
        bell.rotation.z = -Math.PI / 4;
        bell.position.set(0.6, -0.5, 0);
        group.add(bell);
        break;
      }
      case 'straw_shoes': {
        const shoeMat = new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.95 });
        for (let i = 0; i < 2; i++) {
          const sole = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), shoeMat);
          sole.scale.set(1, 0.2, 1.5);
          sole.position.set((i === 0 ? -1 : 1) * 0.4, -0.2, 0);
          group.add(sole);
        }
        break;
      }
      case 'town': {
        for (let i = 0; i < 3; i++) {
          const w = 0.4 + (i % 2) * 0.15;
          const h = 0.5 + i * 0.12;
          const house = new THREE.Mesh(new THREE.BoxGeometry(w, h, w),
            new THREE.MeshStandardMaterial({ color: 0xd8c8a8, roughness: 0.85 }));
          house.position.set((i - 1) * 0.55, -0.3 + h / 2, 0);
          house.castShadow = true;
          group.add(house);
          const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.75, 0.3, 4),
            new THREE.MeshStandardMaterial({ color: 0x6a3020, roughness: 0.9 }));
          roof.position.set((i - 1) * 0.55, -0.3 + h + 0.12, 0);
          roof.rotation.y = Math.PI / 4;
          group.add(roof);
          const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.15),
            new THREE.MeshStandardMaterial({ color: 0xf5d78e, emissive: 0xd4a843, emissiveIntensity: 0.6 }));
          windowMesh.position.set((i - 1) * 0.55, -0.1 + h / 2, w / 2 + 0.001);
          group.add(windowMesh);
        }
        const ground = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.9),
          new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.9 }));
        ground.position.y = -0.35;
        group.add(ground);
        break;
      }
      case 'tree': {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.9, 10),
          new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.9 }));
        trunk.position.y = -0.25;
        trunk.castShadow = true;
        group.add(trunk);
        for (let i = 0; i < 3; i++) {
          const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.55 - i * 0.1, 0.5, 8),
            new THREE.MeshStandardMaterial({ color: i === 0 ? 0x3a7a3a : i === 1 ? 0x2a6a2a : 0x4a8a4a, roughness: 0.95 }));
          leaf.position.y = 0.15 + i * 0.28;
          leaf.rotation.y = i * Math.PI / 8;
          group.add(leaf);
        }
        break;
      }
      case 'cave': {
        const rock = new THREE.Mesh(
          new THREE.SphereGeometry(0.85, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.6),
          new THREE.MeshStandardMaterial({ color: 0x5a4a6a, roughness: 0.95 }));
        rock.position.y = -0.4;
        group.add(rock);
        const hole = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 20),
          new THREE.MeshBasicMaterial({ color: 0x050202 }));
        hole.position.set(0, -0.45, 0.65);
        hole.scale.z = 0.5;
        group.add(hole);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 8, 24),
          new THREE.MeshStandardMaterial({ color: 0x3a2a4a, roughness: 0.9 }));
        rim.position.set(0, -0.45, 0.66);
        group.add(rim);
        for (let i = 0; i < 3; i++) {
          const plant = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 6),
            new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.9 }));
          plant.position.set((Math.random() - 0.5) * 0.6, 0.5 + Math.random() * 0.1, (Math.random() - 0.5) * 0.3);
          group.add(plant);
        }
        break;
      }
      case 'lake': {
        const lake = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.05, 40),
          new THREE.MeshStandardMaterial({ color: 0x4a7a9a, transparent: true, opacity: 0.8, roughness: 0.1, metalness: 0.85, envMapIntensity: 1.8 }));
        lake.position.y = -0.25;
        group.add(lake);
        const bank = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.08, 8, 40),
          new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.95 }));
        bank.rotation.x = Math.PI / 2;
        bank.position.y = -0.25;
        group.add(bank);
        for (let i = 0; i < 3; i++) {
          const bird = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 4),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }));
          bird.position.set((Math.random() - 0.5) * 1.2, 0.3 + Math.random() * 0.3, (Math.random() - 0.5) * 0.8);
          bird.rotation.z = Math.PI / 2;
          group.add(bird);
        }
        break;
      }
      case 'mountain': {
        const heights = [1.3, 0.9, 0.7];
        const colors = [0xb85a3a, 0x8a4a2a, 0xd87a5a];
        const positions = [[-0.35, 0], [0.2, -0.2], [0.55, 0.1]];
        for (let i = 0; i < 3; i++) {
          const m = new THREE.Mesh(new THREE.ConeGeometry(0.55, heights[i], 4),
            new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.9 }));
          m.position.set(positions[i][0], -0.4 + heights[i] / 2 - 0.2, positions[i][1]);
          m.rotation.y = Math.PI / 4;
          group.add(m);
          const snow = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.25, 4),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }));
          snow.position.set(positions[i][0], heights[i] - 0.35, positions[i][1]);
          snow.rotation.y = Math.PI / 4;
          group.add(snow);
        }
        break;
      }
      case 'flower': {
        for (let i = 0; i < 6; i++) {
          const petal = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14),
            new THREE.MeshStandardMaterial({ color: 0xf0d030, emissive: 0x8a6a10, emissiveIntensity: 0.4, roughness: 0.5 }));
          const a = (i / 6) * Math.PI * 2;
          petal.position.set(Math.cos(a) * 0.22, 0.15, Math.sin(a) * 0.22);
          group.add(petal);
        }
        const center = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14),
          new THREE.MeshStandardMaterial({ color: 0xa03020, roughness: 0.5 }));
        center.position.y = 0.15;
        group.add(center);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6),
          new THREE.MeshStandardMaterial({ color: 0x3a7a3a }));
        stem.position.y = -0.2;
        group.add(stem);
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0x4a8a3a, roughness: 0.9 }));
        leaf.position.set(0.12, -0.15, 0);
        leaf.scale.set(1.5, 0.3, 0.5);
        group.add(leaf);
        break;
      }
      case 'chicken': {
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 40),
          new THREE.MeshStandardMaterial({ color: 0xf0e8d8, roughness: 0.15, metalness: 0.05, envMapIntensity: 1.2 }));
        plate.position.y = -0.4;
        group.add(plate);
        const chickenMat = new THREE.MeshStandardMaterial({ color: 0xc85a2a, emissive: 0x5a1a08, emissiveIntensity: 0.3, roughness: 0.4, metalness: 0.1, envMapIntensity: 1.5 });
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 24), chickenMat);
        body.scale.set(1.1, 0.7, 0.9);
        body.position.y = -0.1;
        group.add(body);
        for (let i = 0; i < 2; i++) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.35, 10), chickenMat);
          leg.position.set((i === 0 ? -1 : 1) * 0.4, -0.05, 0.15);
          leg.rotation.z = (i === 0 ? -1 : 1) * Math.PI / 3.5;
          group.add(leg);
        }
        for (let i = 0; i < 2; i++) {
          const wing = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), chickenMat);
          wing.scale.set(0.8, 0.4, 0.6);
          wing.position.set((i === 0 ? -1 : 1) * 0.5, 0.05, -0.1);
          group.add(wing);
        }
        const sauce = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.02, 32),
          new THREE.MeshStandardMaterial({ color: 0x8a1a08, roughness: 0.3, metalness: 0.15 }));
        sauce.position.y = -0.36;
        group.add(sauce);
        break;
      }
      case 'noodle': {
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.45, 0.4, 32, 1, true),
          new THREE.MeshStandardMaterial({ color: 0xf0e8d8, roughness: 0.25, metalness: 0.05, side: THREE.DoubleSide }));
        bowl.position.y = -0.2;
        group.add(bowl);
        const bowlBottom = new THREE.Mesh(new THREE.CircleGeometry(0.45, 32),
          new THREE.MeshStandardMaterial({ color: 0xf0e8d8, roughness: 0.25, side: THREE.DoubleSide }));
        bowlBottom.rotation.x = -Math.PI / 2;
        bowlBottom.position.y = -0.4;
        group.add(bowlBottom);
        const soup = new THREE.Mesh(new THREE.CircleGeometry(0.62, 32),
          new THREE.MeshStandardMaterial({ color: 0xd4a843, roughness: 0.15, metalness: 0.2 }));
        soup.rotation.x = -Math.PI / 2;
        soup.position.y = -0.05;
        group.add(soup);
        for (let i = 0; i < 6; i++) {
          const noodle = new THREE.Mesh(new THREE.TorusGeometry(0.25 - i * 0.02, 0.02, 6, 20, Math.PI * 1.6),
            new THREE.MeshStandardMaterial({ color: 0xf5d78e }));
          noodle.rotation.x = -Math.PI / 2;
          noodle.rotation.z = i * 0.3;
          noodle.position.y = 0 + i * 0.02;
          group.add(noodle);
        }
        for (let i = 0; i < 5; i++) {
          const green = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x4a9a3a }));
          green.position.set((Math.random() - 0.5) * 0.5, 0.08, (Math.random() - 0.5) * 0.5);
          group.add(green);
        }
        break;
      }
      case 'herb': {
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.9 + Math.random() * 0.2, 6),
            new THREE.MeshStandardMaterial({ color: 0x5a9a5a, roughness: 0.9 }));
          const offsetX = Math.cos(angle) * 0.12;
          const offsetZ = Math.sin(angle) * 0.12;
          stem.position.set(offsetX, 0, offsetZ);
          stem.rotation.z = offsetX * 0.5;
          stem.rotation.x = offsetZ * 0.5;
          group.add(stem);
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x6aaa5a, roughness: 0.8 }));
          leaf.scale.set(1, 0.3, 0.6);
          leaf.position.set(offsetX * 1.5, 0.2 + Math.random() * 0.3, offsetZ * 1.5);
          group.add(leaf);
        }
        const tie = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 6, 20),
          new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.8 }));
        tie.rotation.x = Math.PI / 2;
        tie.position.y = -0.3;
        group.add(tie);
        break;
      }
      case 'meat': {
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 0.35, 32),
          new THREE.MeshStandardMaterial({ color: 0x3a1a1a, roughness: 0.4, metalness: 0.3 }));
        bowl.position.y = -0.25;
        group.add(bowl);
        const soup = new THREE.Mesh(new THREE.CircleGeometry(0.68, 32),
          new THREE.MeshStandardMaterial({ color: 0xa03020, roughness: 0.15, metalness: 0.1 }));
        soup.rotation.x = -Math.PI / 2;
        soup.position.y = -0.06;
        group.add(soup);
        for (let i = 0; i < 5; i++) {
          const meat = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 14),
            new THREE.MeshStandardMaterial({ color: 0x8a2a1a, emissive: 0x3a0a08, emissiveIntensity: 0.3, roughness: 0.5 }));
          meat.scale.set(1, 0.6, 0.8);
          const a = (i / 5) * Math.PI * 2;
          meat.position.set(Math.cos(a) * 0.25, 0.08, Math.sin(a) * 0.25);
          group.add(meat);
        }
        for (let i = 0; i < 6; i++) {
          const green = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6),
            new THREE.MeshStandardMaterial({ color: 0x4a9a3a }));
          green.position.set((Math.random() - 0.5) * 0.9, 0.15, (Math.random() - 0.5) * 0.9);
          group.add(green);
        }
        break;
      }
      case 'bottle': {
        const bottleMat = new THREE.MeshStandardMaterial({ color: 0xd4a843, roughness: 0.15, metalness: 0.75, envMapIntensity: 1.6 });
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1, 32), bottleMat);
        body.position.y = -0.15;
        group.add(body);
        const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.32, 0.25, 32), bottleMat);
        shoulder.position.y = 0.5;
        group.add(shoulder);
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.35, 24), bottleMat);
        neck.position.y = 0.78;
        group.add(neck);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 24),
          new THREE.MeshStandardMaterial({ color: 0xa01818, metalness: 0.5, roughness: 0.3 }));
        cap.position.y = 1.02;
        group.add(cap);
        const label = new THREE.Mesh(
          new THREE.CylinderGeometry(0.325, 0.325, 0.35, 32, 1, true, -Math.PI / 3, Math.PI * 2 / 3),
          new THREE.MeshStandardMaterial({ color: 0xf5e6c8, roughness: 0.6, side: THREE.DoubleSide }));
        label.position.y = -0.15;
        group.add(label);
        break;
      }
      case 'orange': {
        const orange = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32),
          new THREE.MeshStandardMaterial({ color: 0xe8a030, emissive: 0x6a4a10, emissiveIntensity: 0.2, roughness: 0.65, metalness: 0.05 }));
        group.add(orange);
        for (let i = 0; i < 12; i++) {
          const phi = Math.acos(1 - 2 * (i + 0.5) / 12);
          const theta = Math.PI * (1 + Math.sqrt(5)) * i;
          const dot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6),
            new THREE.MeshStandardMaterial({ color: 0xc88020 }));
          dot.position.set(Math.sin(phi) * Math.cos(theta) * 0.54, Math.cos(phi) * 0.54, Math.sin(phi) * Math.sin(theta) * 0.54);
          group.add(dot);
        }
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 14),
          new THREE.MeshStandardMaterial({ color: 0x3a8a3a, roughness: 0.7 }));
        leaf.scale.set(1.3, 0.25, 0.6);
        leaf.position.set(0.2, 0.5, 0);
        leaf.rotation.z = Math.PI / 6;
        group.add(leaf);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8),
          new THREE.MeshStandardMaterial({ color: 0x5a4a2a }));
        stem.position.set(0.1, 0.55, 0);
        group.add(stem);
        break;
      }
      case 'lantern': {
        const lanternMat = new THREE.MeshStandardMaterial({ color: 0xd84a4a, emissive: 0xa82020, emissiveIntensity: 0.6, roughness: 0.5, metalness: 0.1 });
        const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), lanternMat);
        lantern.scale.set(1, 0.9, 1);
        group.add(lantern);
        for (let i = 0; i < 2; i++) {
          const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 20),
            new THREE.MeshStandardMaterial({ color: 0xd4a843, metalness: 0.7, roughness: 0.3 }));
          cap.position.y = (i === 0 ? -1 : 1) * 0.52;
          group.add(cap);
        }
        const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.3, 12),
          new THREE.MeshStandardMaterial({ color: 0xd4a843, roughness: 0.6 }));
        tassel.position.y = -0.75;
        group.add(tassel);
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6),
          new THREE.MeshStandardMaterial({ color: 0x8a6a3a }));
        rope.position.y = 0.72;
        group.add(rope);
        for (let i = 0; i < 4; i++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.01, 6, 32),
            new THREE.MeshBasicMaterial({ color: 0xd4a843 }));
          ring.rotation.x = Math.PI / 2;
          ring.scale.y = 0.9;
          ring.position.y = -0.2 + i * 0.15;
          group.add(ring);
        }
        break;
      }
      case 'cloth': {
        const clothGeo = new THREE.PlaneGeometry(1.1, 1.3, 20, 20);
        const cloth = new THREE.Mesh(clothGeo,
          new THREE.MeshStandardMaterial({ color: 0x3a5a8a, side: THREE.DoubleSide, roughness: 0.9 }));
        const pos = clothGeo.attributes.position;
        const orig = pos.array.slice();
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          pos.setZ(i, Math.sin(x * 6) * 0.05 + Math.sin(y * 5) * 0.03);
        }
        clothGeo.computeVertexNormals();
        cloth.userData._origPositions = orig;
        cloth.userData._isCloth = true;
        group.add(cloth);
        for (let i = 0; i < 10; i++) {
          const dot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff }));
          dot.position.set((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 1.1, 0.08);
          group.add(dot);
        }
        break;
      }
      case 'embroidery': {
        const frame = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.05, 10, 48),
          new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.7, metalness: 0.2 }));
        group.add(frame);
        const inner = new THREE.Mesh(new THREE.CircleGeometry(0.6, 48),
          new THREE.MeshStandardMaterial({ color: 0xf0e8d8, side: THREE.DoubleSide, roughness: 0.8 }));
        inner.position.z = -0.01;
        group.add(inner);
        const colors = [0xc84a8a, 0xe8a030, 0x8a4aa8, 0xd84a4a];
        for (let i = 0; i < 8; i++) {
          const petal = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10),
            new THREE.MeshStandardMaterial({ color: colors[i % colors.length], emissive: colors[i % colors.length], emissiveIntensity: 0.2, roughness: 0.6 }));
          const a = (i / 8) * Math.PI * 2;
          petal.position.set(Math.cos(a) * 0.25, Math.sin(a) * 0.25, 0.04);
          petal.scale.set(1, 0.6, 0.5);
          group.add(petal);
        }
        const center = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 14),
          new THREE.MeshStandardMaterial({ color: 0xd4a843, emissive: 0x8a6a10, emissiveIntensity: 0.4 }));
        center.position.z = 0.05;
        group.add(center);
        break;
      }
      case 'lusheng': {
        const lengths = [1.2, 1, 0.8, 0.7, 0.6];
        for (let i = 0; i < lengths.length; i++) {
          const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, lengths[i], 10),
            new THREE.MeshStandardMaterial({ color: 0xb8944a, roughness: 0.65, metalness: 0.15 }));
          pipe.position.set((i - 2) * 0.1, -0.3 + lengths[i] / 2, 0);
          group.add(pipe);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 6, 12),
            new THREE.MeshStandardMaterial({ color: 0xd4a843, metalness: 0.8, roughness: 0.25 }));
          ring.rotation.x = Math.PI / 2;
          ring.position.set((i - 2) * 0.1, -0.3 + lengths[i], 0);
          group.add(ring);
        }
        const base = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24),
          new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.75, metalness: 0.1 }));
        base.scale.set(1, 0.8, 1);
        base.position.y = -0.5;
        group.add(base);
        const mouth = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 12),
          new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.75 }));
        mouth.rotation.z = Math.PI / 2;
        mouth.position.set(0.45, -0.4, 0);
        group.add(mouth);
        break;
      }
      case 'carving': {
        const woodGeo = new THREE.BoxGeometry(0.55, 1, 0.4, 6, 12, 6);
        const pos = woodGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
          pos.setX(i, x + (Math.random() - 0.5) * 0.12);
          pos.setY(i, y + (Math.random() - 0.5) * 0.08);
          pos.setZ(i, z + (Math.random() - 0.5) * 0.12);
        }
        woodGeo.computeVertexNormals();
        const wood = new THREE.Mesh(woodGeo,
          new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.9, metalness: 0.05 }));
        group.add(wood);
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.15, 24),
          new THREE.MeshStandardMaterial({ color: 0x3a1a0a, roughness: 0.8 }));
        base.position.y = -0.55;
        group.add(base);
        break;
      }
      case 'drum': {
        const drumMat = new THREE.MeshStandardMaterial({ color: 0xa01818, roughness: 0.7, metalness: 0.1 });
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.65, 32), drumMat);
        drum.rotation.z = Math.PI / 2;
        group.add(drum);
        for (let i = 0; i < 2; i++) {
          const head = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32),
            new THREE.MeshStandardMaterial({ color: 0xf0e8d0, roughness: 0.85, side: THREE.DoubleSide }));
          head.position.x = (i === 0 ? -1 : 1) * 0.331;
          head.rotation.y = (i === 0 ? -1 : 1) * Math.PI / 2;
          group.add(head);
        }
        for (let ring = 0; ring < 2; ring++) {
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6),
              new THREE.MeshStandardMaterial({ color: 0xd4a843, metalness: 0.9, roughness: 0.2 }));
            rivet.position.set((ring === 0 ? -1 : 1) * 0.28, Math.cos(a) * 0.5, Math.sin(a) * 0.5);
            group.add(rivet);
          }
        }
        break;
      }
      default: {
        group.add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 20), mat));
      }
    }

    return group;
  }

  function createHall() {
    const RADIUS = 18;

    const floor = new THREE.Mesh(new THREE.CircleGeometry(RADIUS, 64),
      new THREE.MeshStandardMaterial({ color: 0x2a1515, roughness: 0.4, metalness: 0.6, envMapIntensity: 0.5 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);

    [6, 10, 14, 17].forEach((r, i) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.05, r + 0.05, 80),
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xd4a843 : 0xa01818,
          transparent: true, opacity: 0.35, side: THREE.DoubleSide,
        }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -1.95;
      scene.add(ring);
    });

    const PILLAR_COUNT = 12;
    const PILLAR_RADIUS = 15;
    for (let i = 0; i < PILLAR_COUNT; i++) {
      const angle = (i / PILLAR_COUNT) * Math.PI * 2;
      const x = Math.cos(angle) * PILLAR_RADIUS;
      const z = Math.sin(angle) * PILLAR_RADIUS;

      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 10, 16),
        new THREE.MeshStandardMaterial({ color: 0x5a2a2a, roughness: 0.7, metalness: 0.3 }));
      pillar.position.set(x, 3, z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      scene.add(pillar);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xd4a843, emissive: 0x8a6a2a, emissiveIntensity: 0.4, roughness: 0.3, metalness: 0.7 }));
      cap.position.set(x, 8.2, z);
      scene.add(cap);
    }
  }

  function createMonument() {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.3, 48),
      new THREE.MeshStandardMaterial({ color: 0x3a1a1a, roughness: 0.6, metalness: 0.4 }));
    base.position.y = -1.85;
    base.receiveShadow = true;
    group.add(base);

    const starShape = new THREE.Shape();
    const outerR = 1.0, innerR = 0.45; // 改小一点，不抢戏
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    monumentStar = new THREE.Mesh(
      new THREE.ExtrudeGeometry(starShape, {
        depth: 0.5, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 3,
      }),
      new THREE.MeshStandardMaterial({ color: 0xcc0000, emissive: 0x8a0000, emissiveIntensity: 0.7, roughness: 0.4, metalness: 0.6 })
    );
    monumentStar.position.y = 2.2;
    monumentStar.castShadow = true;
    group.add(monumentStar);

    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xf5d78e }));
    glow.position.set(0, 2.2, 0.3);
    group.add(glow);

    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 6, 32, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.04, side: THREE.DoubleSide }));
    beam.position.y = 5.5;
    group.add(beam);

    const baseGlow = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.8, 48),
      new THREE.MeshBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
    baseGlow.rotation.x = -Math.PI / 2;
    baseGlow.position.y = -1.68;
    group.add(baseGlow);

    return group;
  }

  function createParticles() {
    const geo = new THREE.BufferGeometry();
    const count = 400;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 13;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.random() * 12 - 2;
      positions[i * 3 + 2] = Math.sin(a) * r;
      speeds[i] = 0.005 + Math.random() * 0.01;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData._speeds = speeds;

    const points = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xd4a843, size: 0.1, transparent: true, opacity: 0.55,
    }));
    points.userData._isParticles = true;
    scene.add(points);
  }

  function initPointerEvents() {
    let startX = 0, startY = 0, startTime = 0;

    canvas.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
    });

    canvas.addEventListener('pointerup', (e) => {
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      const dt = Date.now() - startTime;

      if (dx < 12 && dy < 12 && dt < 500) {
        handlePick(e.clientX, e.clientY);
      }
    });
  }

  function handlePick(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactables, true);

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj.parent && !obj.userData.name) obj = obj.parent;

      if (obj.userData.name) {
        playSound('tap');
        if (obj.userData.name.includes('号')) playSound('horn');

        // 1. 记录原始相机位置
        originalCameraPos.copy(camera.position);
        originalTarget.copy(controls.target);

        // 2. 计算展品世界坐标
        const worldPos = new THREE.Vector3();
        obj.getWorldPosition(worldPos);
        worldPos.y += 1.5;

        // 3. 计算推进后的相机位置（距离展品 4.5 个单位）
        const dir = new THREE.Vector3().subVectors(camera.position, worldPos).normalize();
        const targetCamPos = worldPos.clone().add(dir.multiplyScalar(4.5));

        // 4. 初始化补间动画
        cameraTween.startPos.copy(camera.position);
        cameraTween.startTarget.copy(controls.target);
        cameraTween.endPos.copy(targetCamPos);
        cameraTween.endTarget.copy(worldPos);
        cameraTween.progress = 0;
        cameraTween.active = true;

        // 5. 禁用控制器
        controls.enabled = false;
        controls.autoRotate = false;

        infoTitle.textContent = obj.userData.name;
        infoDesc.textContent = obj.userData.desc;
        infoBox.classList.add('show');
        if (infoOverlay) infoOverlay.classList.add('show');
        obj.userData._pop = 1;

        triggerStoryEffect(obj);

        clearTimeout(window._exhibitTimer);
        window._exhibitTimer = setTimeout(() => closeInfo(), 3500);
      }
    }
  }

  function triggerStoryEffect(obj) {
    const worldPos = new THREE.Vector3();
    obj.getWorldPosition(worldPos);

    const particleCount = 32;
    const group = new THREE.Group();

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xf5d78e, transparent: true, opacity: 1 }));
      p.userData._angle = angle;
      p.userData._radius = 0.9;
      p.userData._speed = 0.8 + Math.random() * 0.6;
      group.add(p);
    }

    const core = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xf5d78e, transparent: true, opacity: 0.9 }));
    group.add(core);

    group.position.copy(worldPos);
    group.userData._startTime = performance.now();
    group.userData._duration = 3000;
    group.userData._core = core;

    scene.add(group);
    storyEffects.push(group);
  }

  function clearStoryEffects() {
    storyEffects.forEach((g) => {
      scene.remove(g);
      g.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });
    storyEffects = [];
  }

  function updateStoryEffects(time) {
    for (let i = storyEffects.length - 1; i >= 0; i--) {
      const g = storyEffects[i];
      const elapsed = performance.now() - g.userData._startTime;
      const t = elapsed / g.userData._duration;

      if (t >= 1) {
        scene.remove(g);
        g.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        storyEffects.splice(i, 1);
        continue;
      }

      const children = g.children;
      const radiusPhase = t < 0.6 ? 1 : 1 + (t - 0.6) * 3;
      const risePhase = t < 0.4 ? 0 : (t - 0.4) * 4;
      const fadePhase = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;

      for (let j = 0; j < children.length - 1; j++) {
        const p = children[j];
        const a = p.userData._angle + time * p.userData._speed;
        const r = p.userData._radius * radiusPhase;
        p.position.x = Math.cos(a) * r;
        p.position.z = Math.sin(a) * r;
        p.position.y = risePhase + Math.sin(time * 2 + j) * 0.1;
        if (p.material) p.material.opacity = Math.max(0, fadePhase);
      }

      const core = g.userData._core;
      if (core) {
        const coreScale = 1 + Math.sin(time * 4) * 0.2;
        core.scale.setScalar(coreScale);
        core.material.opacity = Math.max(0, fadePhase * 0.9);
      }
    }
  }

  function updateItemAnimations(time) {
    animatedItems.forEach((obj) => {
      const anim = obj.userData.animType;
      const phase = obj.userData.phase;
      const baseY = obj.userData.baseY;

      switch (anim) {
        case 'float': obj.position.y = baseY + Math.sin(time * 1.2 + phase) * 0.08; break;
        case 'sway': obj.rotation.z = Math.sin(time * 1.5 + phase) * 0.1; break;
        case 'spin': obj.rotation.y += 0.008; break;
        case 'wave':
          obj.traverse((child) => {
            if (child.userData._isCloth && child.geometry) {
              const pos = child.geometry.attributes.position;
              const orig = child.userData._origPositions;
              if (orig) {
                for (let i = 0; i < pos.count; i++) {
                  const ox = orig[i * 3];
                  const oy = orig[i * 3 + 1];
                  pos.setZ(i, Math.sin(ox * 6 + time * 2) * 0.06 + Math.sin(oy * 5 + time * 1.5) * 0.04);
                }
                pos.needsUpdate = true;
                child.geometry.computeVertexNormals();
              }
            }
          });
          break;
        case 'ripple':
          obj.children.forEach((child, i) => {
            if (child.geometry && child.geometry.type === 'TorusGeometry') {
              child.rotation.z += 0.005 + i * 0.002;
            }
          });
          break;
        case 'swing': obj.rotation.z = Math.sin(time * 1.8 + phase) * 0.15; break;
      }
    });
  }

  let breathTime = 0;
  function updateBreathingLight(time) {
    breathTime += 0.016;
    const baseBreath = Math.sin(breathTime * Math.PI / 4) * 0.5 + 0.5;

    const freqMap = { redarmy: 4, scenery: 4, food: 3, heritage: 3.5 };
    const freq = freqMap[activeGallery] || 4;
    const cycle = Math.sin(breathTime * Math.PI / freq) * 0.5 + 0.5;

    if (skylight) skylight.intensity = 1.8 + cycle * 0.4;
    if (ambientLight) ambientLight.intensity = 0.15 + baseBreath * 0.15;
  }

  function updateStarDome(time) {
    if (starDome) starDome.rotation.y = time * 0.02;
  }

  function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() / 1000;

    if (entryProgress < 1 && introFinished) {
      if (entryStartTime === null) entryStartTime = Date.now();
      const elapsed = Date.now() - entryStartTime;
      entryProgress = Math.min(elapsed / ENTRY_DURATION, 1);
      const ease = 1 - Math.pow(1 - entryProgress, 3);

      camera.position.x = 0;
      camera.position.y = 15 + (4 - 15) * ease;
      camera.position.z = 60 + (16 - 60) * ease;
      camera.lookAt(0, 1.5, 0);

      if (entryProgress >= 1) {
        controls.enabled = true;
        controls.target.set(0, 1.5, 0);
        controls.autoRotate = true;
        camera.position.set(0, 4, 16);
        camera.lookAt(0, 1.5, 0);
        controls.update();
      }
    } else if (cameraTween.active) {
      // 摄像机补间动画逻辑
      cameraTween.progress += cameraTween.speed || 0.025;
      const t = Math.min(cameraTween.progress, 1);
      // EaseOutCubic 缓动函数
      const ease = 1 - Math.pow(1 - t, 3);

      camera.position.lerpVectors(cameraTween.startPos, cameraTween.endPos, ease);
      controls.target.lerpVectors(cameraTween.startTarget, cameraTween.endTarget, ease);

      if (t >= 1) {
        cameraTween.active = false;
        if (!cameraTween.noRestore) {
          controls.enabled = true;
          controls.autoRotate = true; // 复位后恢复自动旋转
        }
      }
    } else if (controls.enabled) {
      controls.update();
    }

    updateItemAnimations(time);
    updateStoryEffects(time);
    updateBreathingLight(time);
    updateStarDome(time);

    interactables.forEach((obj) => {
      if (obj.userData._pop) {
        obj.userData._pop *= 0.92;
        if (obj.userData._pop < 0.01) obj.userData._pop = 0;
        const s = 1 + obj.userData._pop * 0.25;
        obj.scale.set(s, s, s);
      }
    });

    scene.traverse((child) => {
      if (child.userData && child.userData._isParticles && child.geometry) {
        const positions = child.geometry.attributes.position.array;
        const speeds = child.geometry.userData._speeds;
        for (let i = 0; i < speeds.length; i++) {
          positions[i * 3 + 1] += speeds[i];
          if (positions[i * 3 + 1] > 12) positions[i * 3 + 1] = -2;
        }
        child.geometry.attributes.position.needsUpdate = true;
      }
      if (child.userData && child.userData._billboard) {
        child.lookAt(camera.position);
      }
    });

    renderer.render(scene, camera);
  }

  function onResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /* ==========================================================
     自动巡游导览 + 语音讲解
     - 相机沿展品圆形阵列逐站飞行（复用 cameraTween，慢速）
     - 到站底部字幕展示展品信息，Web Speech API 语音朗读
     - 按钮 / ESC / 点击画布可随时接管退出
     ========================================================== */
  let tourHallKey = 'redarmy';
  let tour = { active: false, timer: null };
  let tourBtn = null, tourCaption = null;

  const TOUR_RADIUS = 9;         // 与 buildGallery 的 RADIUS 保持一致
  const TOUR_FLY_SPEED = 0.011;  // 相机飞行步进（约 1.5 秒/站）
  const TOUR_GAP_MS = 1000;      // 每站讲解读完后到下一站的转换间隔

  const TOUR_HALL_NAMES = {
    redarmy: '红军馆', scenery: '风景馆', food: '美食馆', heritage: '非遗馆',
  };

  function ensureTourUI() {
    if (tourBtn) return;
    tourBtn = document.createElement('button');
    tourBtn.id = 'tourBtn';
    tourBtn.textContent = '▶ 自动巡游';
    tourBtn.addEventListener('click', () => (tour.active ? stopTour() : startTour()));
    document.body.appendChild(tourBtn);

    tourCaption = document.createElement('div');
    tourCaption.id = 'tourCaption';
    document.body.appendChild(tourCaption);

    const st = document.createElement('style');
    st.id = 'tourStyle';
    st.textContent = `
      #tourBtn { position: fixed; right: 30px; bottom: 92px; z-index: 9998; padding: 10px 20px;
        border-radius: 24px; border: 1px solid rgba(212,168,67,.55); background: rgba(20,8,6,.78);
        backdrop-filter: blur(8px); color: #f5d78e; font-size: 13px; letter-spacing: 2px;
        cursor: pointer; transition: all .3s; font-family: inherit; }
      #tourBtn:hover { border-color: #f5d78e; background: rgba(140,24,20,.85); }
      #tourBtn.on { background: linear-gradient(135deg, #b8241c, #8a1a14); border-color: #f5d78e;
        box-shadow: 0 0 16px rgba(245,215,142,.4); }
      #tourCaption { position: fixed; left: 50%; bottom: 68px; transform: translateX(-50%); z-index: 9997;
        max-width: min(680px, 86vw); padding: 14px 44px 14px 26px; border-radius: 12px; text-align: center;
        background: rgba(14,6,4,.85); border: 1px solid rgba(212,168,67,.45); backdrop-filter: blur(10px);
        color: #f0e2c8; font-size: 14px; line-height: 1.7; display: none; pointer-events: none; }
      #tourCaption.show { display: block; animation: tourCapUp .4s ease; }
      @keyframes tourCapUp { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
      #tourCaption b { display: block; font-size: 17px; color: #f5d78e; letter-spacing: 3px; margin-bottom: 2px; }
      #tourCaption i { position: absolute; right: 12px; top: 8px; font-style: normal; font-size: 11px;
        color: rgba(240,226,200,.5); }
      @media (max-width: 768px) { #tourBtn { right: 16px; bottom: 76px; padding: 8px 14px; font-size: 12px; }
        #tourCaption { bottom: 56px; font-size: 13px; padding: 10px 36px 10px 16px; } }`;
    document.head.appendChild(st);

    // 退出通道：ESC / 点击画布接管
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && tour.active) stopTour(); });
    renderer.domElement.addEventListener('pointerdown', () => { if (tour.active) stopTour(); });
  }

  function startTour() {
    const gallery = GALLERIES[tourHallKey] || GALLERIES.redarmy;
    if (!gallery || !gallery.items || !gallery.items.length) return;

    tour.active = true;
    controls.enabled = false;
    controls.autoRotate = false;
    closeInfo();
    stopVoices();
    tourBtn.textContent = '■ 停止巡游';
    tourBtn.classList.add('on');
    tourCaption.classList.add('show');
    tourCaption.innerHTML = '<b>' + (TOUR_HALL_NAMES[tourHallKey] || '') + '</b>巡游开始，共 ' +
      gallery.items.length + ' 件展品';

    let i = 0;
    const count = gallery.items.length;
    const step = () => {
      if (!tour.active) return;
      const item = gallery.items[i];
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const ex = Math.cos(angle) * TOUR_RADIUS, ez = Math.sin(angle) * TOUR_RADIUS;

      // 站点字幕
      tourCaption.innerHTML = '<i>' + (i + 1) + ' / ' + count + '</i><b>' + item.name + '</b>' + item.desc;

      // 相机飞行（巡游专属慢速；结束后不自动恢复控制权）
      cameraTween.startPos.copy(camera.position);
      cameraTween.startTarget.copy(controls.target);
      cameraTween.endPos.set(Math.cos(angle) * (TOUR_RADIUS - 4.2), -0.7, Math.sin(angle) * (TOUR_RADIUS - 4.2));
      cameraTween.endTarget.set(ex * 0.96, -1.0, ez * 0.96);
      cameraTween.progress = 0;
      cameraTween.speed = TOUR_FLY_SPEED;
      cameraTween.noRestore = true;
      cameraTween.active = true;

      // 语音讲解：完整读完介绍后停 1 秒 → 下一站
      speakText(item.name + '。' + item.desc, () => {
        if (!tour.active) return;
        tour.timer = setTimeout(() => {
          if (!tour.active) return;
          i += 1;
          if (i >= count) {
            tourCaption.innerHTML = '<b>' + (TOUR_HALL_NAMES[tourHallKey] || '') +
              '</b>巡游完毕，点击任意展品可查看详情';
            tour.timer = setTimeout(() => { if (tour.active) stopTour(); }, 3500);
          } else {
            step();
          }
        }, TOUR_GAP_MS);
      });
    };
    tour.timer = setTimeout(step, 1500);  // 开场字幕停留
  }

  function stopTour() {
    if (!tour.active) return;
    tour.active = false;
    clearTimeout(tour.timer);
    stopVoices();
    if (tourBtn) {
      tourBtn.textContent = '▶ 自动巡游';
      tourBtn.classList.remove('on');
      tourCaption.classList.remove('show');
    }
    cameraTween.noRestore = false;  // 复位飞行结束后恢复手动控制
    closeInfo();                    // 相机复位
  }

  function stopVoices() {
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
  }

  function speakText(text, onDone) {
    let done = false;
    const finish = () => { if (done) return; done = true; if (onDone) onDone(); };
    try {
      if (!window.speechSynthesis) throw new Error('no tts');
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.95;
      u.onend = finish;
      u.onerror = finish;
      speechSynthesis.speak(u);
      setTimeout(finish, Math.max(5000, text.length * 330));  // 浏览器不触发 onend 时的兜底（放宽以读完全文）
    } catch (e) {
      setTimeout(finish, 3500);  // 设备不支持语音时按字幕阅读节奏推进
    }
  }

  initScene();
  ensureTourUI();
})();

/* ==========================================================
   集章打卡 + 参观纪念海报（自包含模块）
   - 参观四个展馆点亮徽章（localStorage 持久化）
   - 集齐四枚可生成/下载参观纪念海报
   ========================================================== */
(function stampSystem() {
  const HALLS = [
    { key: 'redarmy',  name: '红军馆', sub: '红色记忆' },
    { key: 'scenery',  name: '风景馆', sub: '绿水青山' },
    { key: 'food',     name: '美食馆', sub: '蔺州味道' },
    { key: 'heritage', name: '非遗馆', sub: '苗乡遗韵' },
  ];
  const STORE = 'gulin_stamps';
  let stamps = [];
  try { stamps = JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (e) { stamps = []; }

  function save() { try { localStorage.setItem(STORE, JSON.stringify(stamps)); } catch (e) {} }
  function has(key) { return stamps.indexOf(key) !== -1; }
  function complete() { return HALLS.every(h => has(h.key)); }

  /* ---------- 打章入口（switchGallery 挂钩 + 初始馆） ---------- */
  window.__stampCollect = function (key) {
    if (!has(key)) {
      stamps.push(key);
      save();
      renderPanel();
      if (complete()) toast('四馆集齐！纪念海报已解锁');
      else toast('已点亮「' + HALLS.find(h => h.key === key).name + '」印章');
    }
    updateBadge();
  };
  // 初始默认馆（redarmy 不经过 switchGallery）延迟打卡
  setTimeout(() => window.__stampCollect('redarmy'), 4000);

  /* ---------- 样式 ---------- */
  const st = document.createElement('style');
  st.id = 'stampStyle';
  st.textContent = `
    #stampBtn { position: fixed; left: 24px; bottom: 24px; z-index: 9998; width: 54px; height: 54px;
      border-radius: 50%; border: 1px solid rgba(212,168,67,.55); background: rgba(20,8,6,.78);
      backdrop-filter: blur(8px); color: #f5d78e; cursor: pointer; display: flex; flex-direction: column;
      align-items: center; justify-content: center; font-size: 11px; letter-spacing: 1px;
      transition: all .3s ease; font-family: inherit; }
    #stampBtn:hover { transform: scale(1.08); border-color: #f5d78e; background: rgba(140,24,20,.8); }
    #stampBtn .n { font-size: 15px; font-weight: bold; color: #ffd98a; line-height: 1.1; }
    #stampBtn.all { box-shadow: 0 0 16px rgba(245,215,142,.45); }
    #stampPanel { position: fixed; left: 24px; bottom: 92px; z-index: 9998; width: 300px; padding: 18px;
      border-radius: 14px; border: 1px solid rgba(212,168,67,.4); display: none;
      background: linear-gradient(160deg, rgba(38,14,10,.96), rgba(20,8,6,.96)); backdrop-filter: blur(12px);
      color: #f0e2c8; box-shadow: 0 12px 40px rgba(0,0,0,.5); }
    #stampPanel.show { display: block; animation: stampUp .25s ease; }
    @keyframes stampUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
    #stampPanel h4 { margin: 0 0 12px; font-size: 15px; color: #f5d78e; letter-spacing: 2px; }
    #stampPanel h4 small { float: right; font-size: 11px; color: rgba(240,226,200,.55); letter-spacing: 0; }
    .stamp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .stamp-item { border: 1px dashed rgba(212,168,67,.35); border-radius: 10px; padding: 10px 6px;
      text-align: center; color: rgba(240,226,200,.35); transition: all .3s; }
    .stamp-item.on { border: 1px solid rgba(245,215,142,.8); color: #ffe9b8;
      background: radial-gradient(circle at 50% 30%, rgba(160,30,24,.5), rgba(60,16,12,.6));
      box-shadow: inset 0 0 14px rgba(245,180,80,.15); }
    .stamp-item b { display: block; font-size: 14px; letter-spacing: 2px; }
    .stamp-item i { font-style: normal; font-size: 10px; opacity: .75; }
    #stampPosterBtn { display: none; width: 100%; margin-top: 12px; padding: 10px; border: none;
      border-radius: 8px; cursor: pointer; font-size: 13px; letter-spacing: 3px;
      background: linear-gradient(135deg, #b8241c, #8a1a14); color: #ffe9b8;
      border: 1px solid rgba(245,215,142,.5); }
    #stampPosterBtn.show { display: block; }
    #stampPosterBtn:hover { filter: brightness(1.15); }
    #stampPosterWrap { display: none; margin-top: 12px; text-align: center; }
    #stampPosterWrap.show { display: block; }
    #stampPosterWrap img { width: 100%; border-radius: 8px; border: 1px solid rgba(212,168,67,.4); }
    #stampPosterWrap a { display: inline-block; margin-top: 8px; font-size: 12px; color: #f5d78e;
      text-decoration: none; border: 1px solid rgba(245,215,142,.4); padding: 6px 18px; border-radius: 20px;
      letter-spacing: 2px; }
    #stampPosterWrap p { margin: 6px 0 0; font-size: 11px; color: rgba(240,226,200,.5); }
    #stampToast { position: fixed; top: 76px; left: 50%; transform: translateX(-50%); z-index: 9999;
      padding: 10px 22px; border-radius: 24px; font-size: 13px; letter-spacing: 2px; pointer-events: none;
      background: rgba(20,8,6,.9); border: 1px solid rgba(245,215,142,.55); color: #ffe9b8;
      opacity: 0; transition: opacity .35s; }
    #stampToast.show { opacity: 1; }
    @media (max-width: 768px) { #stampBtn { left: 14px; bottom: 14px; width: 46px; height: 46px; }
      #stampPanel { left: 12px; right: 12px; width: auto; bottom: 70px; } }`;
  document.head.appendChild(st);

  /* ---------- UI ---------- */
  const btn = document.createElement('button');
  btn.id = 'stampBtn';
  btn.innerHTML = '<span class="n">0/4</span><span>集章</span>';
  btn.addEventListener('click', () => panel.classList.toggle('show'));
  document.body.appendChild(btn);

  const panel = document.createElement('div');
  panel.id = 'stampPanel';
  document.body.appendChild(panel);

  const toastEl = document.createElement('div');
  toastEl.id = 'stampToast';
  document.body.appendChild(toastEl);
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  function updateBadge() {
    btn.querySelector('.n').textContent = stamps.length + '/4';
    btn.classList.toggle('all', complete());
  }

  function renderPanel() {
    panel.innerHTML = `
      <h4>云游四馆 · 集章打卡<small>已点亮 ${stamps.length}/4</small></h4>
      <div class="stamp-grid">
        ${HALLS.map(h => `
          <div class="stamp-item${has(h.key) ? ' on' : ''}">
            <b>${has(h.key) ? '✓ ' : ''}${h.name}</b><i>${h.sub}</i>
          </div>`).join('')}
      </div>
      <button id="stampPosterBtn" class="${complete() ? 'show' : ''}">生成参观纪念海报</button>
      <div id="stampPosterWrap"></div>`;
    const posterBtn = document.getElementById('stampPosterBtn');
    if (posterBtn) posterBtn.addEventListener('click', makePoster);
  }

  /* ---------- 海报生成 ---------- */
  function makePoster() {
    const wrap = document.getElementById('stampPosterWrap');
    wrap.innerHTML = '<p style="font-size:12px;color:rgba(240,226,200,.6);">海报生成中…</p>';
    wrap.classList.add('show');

    const W = 1080, H = 1620;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');

    // 背景
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#3a100b'); bg.addColorStop(.5, '#240a08'); bg.addColorStop(1, '#160605');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // 光晕
    const glow = ctx.createRadialGradient(W/2, H*.32, 60, W/2, H*.32, 620);
    glow.addColorStop(0, 'rgba(212,150,60,.16)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    // 金色双线边框
    ctx.strokeStyle = 'rgba(212,168,67,.9)'; ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, W-72, H-72);
    ctx.strokeStyle = 'rgba(212,168,67,.4)'; ctx.lineWidth = 1;
    ctx.strokeRect(50, 50, W-100, H-100);
    // 四角饰
    ctx.strokeStyle = 'rgba(245,215,142,.95)'; ctx.lineWidth = 4;
    [[36,36,1,1],[W-36,36,-1,1],[36,H-36,1,-1],[W-36,H-36,-1,-1]].forEach(([x,y,dx,dy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y+dy*46); ctx.lineTo(x, y); ctx.lineTo(x+dx*46, y);
      ctx.stroke();
    });

    // 标题
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f5d78e';
    ctx.font = 'bold 96px "Noto Serif SC","SimSun",serif';
    ctx.fillText('重走长征路', W/2, 236);
    ctx.font = '56px "Noto Serif SC","SimSun",serif';
    ctx.fillStyle = '#e8c882';
    ctx.fillText('· 古 蔺 ·', W/2, 320);
    ctx.font = '26px sans-serif';
    ctx.fillStyle = 'rgba(240,226,200,.65)';
    ctx.fillText('3 D 数 字 展 厅 · 参 观 纪 念', W/2, 384);

    // 四枚印章（2×2）
    const sx = [W/2-190, W/2+190], sy = [640, 960];
    HALLS.forEach((h, i) => {
      const x = sx[i%2], y = sy[Math.floor(i/2)];
      const on = has(h.key);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((i%2 ? 1 : -1) * 0.035);
      ctx.beginPath(); ctx.arc(0, 0, 118, 0, Math.PI*2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = on ? '#d4352a' : 'rgba(150,120,100,.35)';
      ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 104, 0, Math.PI*2);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = on ? 'rgba(212,53,42,.6)' : 'rgba(150,120,100,.25)';
      ctx.stroke();
      if (on) {
        ctx.fillStyle = 'rgba(212,53,42,.12)';
        ctx.beginPath(); ctx.arc(0, 0, 104, 0, Math.PI*2); ctx.fill();
      }
      ctx.fillStyle = on ? '#e04a3a' : 'rgba(150,120,100,.4)';
      ctx.font = 'bold 52px "Noto Serif SC","SimSun",serif';
      ctx.fillText(h.name, 0, -6);
      ctx.font = '24px sans-serif';
      ctx.fillStyle = on ? 'rgba(224,120,90,.9)' : 'rgba(150,120,100,.35)';
      ctx.fillText(h.sub, 0, 42);
      ctx.restore();
    });

    // 底部落款（日期 + 二维码 + 引导语）
    const date = new Date();
    const dstr = `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`;
    ctx.font = '26px sans-serif';
    ctx.fillStyle = 'rgba(240,226,200,.55)';
    ctx.fillText(`参观日期  ${dstr}`, W/2, 1252);
    ctx.font = '30px sans-serif';
    ctx.fillStyle = 'rgba(240,226,200,.85)';
    ctx.fillText('四馆集齐 · 云游圆满', W/2, 1304);

    // 网址二维码（本地 qrcode-generator 绘制，失败不影响海报生成）
    try {
      if (typeof qrcode === 'function') {
        const qr = qrcode(0, 'M');
        qr.addData('https://lzgl-38yl31m.maozi.io/');
        qr.make();
        const n = qr.getModuleCount();
        const qs = 180, pad = 16;
        const qx = W/2 - qs/2 - pad, qy = 1328 - pad;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qx, qy, qs + pad*2, qs + pad*2);
        const cell = qs / n;
        ctx.fillStyle = '#160605';
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            if (qr.isDark(r, c)) ctx.fillRect(W/2 - qs/2 + c*cell, 1328 + r*cell, cell + .6, cell + .6);
          }
        }
        ctx.strokeStyle = 'rgba(212,168,67,.85)';
        ctx.lineWidth = 2;
        ctx.strokeRect(qx, qy, qs + pad*2, qs + pad*2);
      }
    } catch (e) { /* 二维码不可用时静默降级 */ }

    ctx.font = '24px "Noto Serif SC","SimSun",serif';
    ctx.fillStyle = 'rgba(212,168,67,.85)';
    ctx.fillText('扫 码 进 入 · 古蔺 3D 数 字 展 厅', W/2, H-58);

    const url = cv.toDataURL('image/png');
    wrap.innerHTML = `
      <img src="${url}" alt="参观纪念海报">
      <a download="古蔺数字展厅参观纪念.png" href="${url}">下载海报</a>
      <p>手机端可长按图片保存分享</p>`;
  }

  renderPanel();
  updateBadge();
})();