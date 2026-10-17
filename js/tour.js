/* ==========================================================
   云游古蔺 · 沉浸全景漫游
   - 电脑端：太平古镇 / 观文千鸟湖 / 黄荆老林 使用百度全景 iframe
     （官网街景分享页 + H5航拍全景，免费无限时）；
     大黑洞 / 古郎 / 红龙湖 使用单张实景 360° 球体贴图
   - 手机端：百度街景在移动浏览器会被强制跳转引导打开App，
     因此 6 个景点统一使用单张实景 360° 球体贴图
   - 普通照片贴球：原图 1:1 居中成球面主画面（不放大、保清晰），
     两侧用照片边缘镜像延展铺满 360° 并压暗融入暗角，
     手指/鼠标拖动环视 + 松手惯性，不自动旋转
   ========================================================== */
(function () {
  'use strict';

  /* ==================== 景点数据 ==================== */
  const SPOTS = [
    {
      name: '太平古镇',
      desc: '国家AAAA级旅游景区 · 没有围墙的红色博物馆',
      // 电脑端：百度地图官网街景分享页（免费、无限时，无需AK授权）
      panoUrl: 'https://map.baidu.com/poi/%E5%A4%AA%E5%B9%B3%E5%8F%A4%E9%95%87/@11805057,3246548,21z,87t?shareurl=1#panoid=7fadea8c8cd10b49373a71bf&panotype=inter&heading=254&pitch=0&l=21&tn=B_NORMAL_MAP&sc=0&newmap=1&shareurl=1&pid=0902000000150403103827210IN&iid=7fadea8c8cd10b49373a71bf',
      photo: 'images/taiping-1.webp'
    },
    {
      name: '观文千鸟湖',
      desc: '网红玻璃栈道 · 万只候鸟越冬地',
      // 电脑端：百度「云游打卡」H5 航拍全景
      panoUrl: 'https://scenes.map.baidu.com/static/h5-project/fine-pano/fine-pano.html?uid=614f85b38e4bf52e2811d1e0&fr=weixin',
      photo: 'images/guanwen-lake.webp'
    },
    {
      name: '大黑洞景区',
      desc: '国家AAAA级景区 · 喀斯特溶洞奇观',
      photo: 'images/dahei-cave/dahei-cave1.webp'
    },
    {
      name: '黄荆老林',
      desc: '国家AAAA级景区 · 北纬28度最后的处女地',
      // 电脑端：百度地图官网街景分享页（瀑布水潭实景）
      panoUrl: 'https://map.baidu.com/search/%E9%BB%84%E8%8D%86%E8%80%81%E6%9E%97/@11771653,3260397,21z,87t?wd=%E9%BB%84%E8%8D%86%E8%80%81%E6%9E%97&l=18&newmap=1&shareurl=1#panoid=7e0f63a3d876176ab11e36bf&panotype=inter&heading=360&pitch=0&l=21&tn=B_NORMAL_MAP&newmap=1&shareurl=1&pid=0902000000150404152140360IN&iid=7e0f63a3d876176ab11e36bf',
      photo: 'images/huangjing-forest/huangjing-forest5.webp'
    },
    {
      name: '古郎景区',
      desc: '国家AAAA级景区 · 川黔渝生态旅游金三角',
      photo: 'images/gulang-cave/gulang-cave1.webp'
    },
    {
      name: '红龙湖森林公园',
      desc: '省级森林公园 · 丹霞地貌与湖光山色',
      photo: 'images/honglong-lake/honglong-lake1.webp'
    }
  ];

  const LAT_MAX = 75;         // 俯仰角限制，避免两极穿帮
  const PHOTO_LON = 180;      // 照片中心正对镜头时的方位角（u=0.5 → lon=180）
  const FOV_DEF = 72;         // 默认视野（越大越广角，越小越放大）
  const FOV_MIN = 40;         // 最大放大
  const FOV_MAX = 100;        // 最大缩小（广角）
  const clampFov = (v) => Math.max(FOV_MIN, Math.min(FOV_MAX, v));

  /* 移动端判定：手机 UA / 微信 / 粗指针（触屏）。
     map.baidu.com 街景在手机 UA 下被服务端 302 强跳到移动版首页（只引导打开App），
     scenes H5 在手机端亦按产品要求统一改为实景照片，故手机端全部走照片球 */
  const IS_MOBILE = /Android|iPhone|iPad|iPod|HarmonyOS|Mobile|MicroMessenger/i.test(navigator.userAgent)
    || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  if (IS_MOBILE) document.body.classList.add('is-mobile');

  /* 该景点在当前环境是否使用百度全景 iframe（仅电脑端 + 配置了 panoUrl） */
  function panoReady(spot) {
    return !IS_MOBILE && !!spot.panoUrl && !state.forcePhoto;
  }

  /* ==================== DOM ==================== */
  const viewport = document.getElementById('tourViewport');
  const veil = document.getElementById('tourVeil');
  const intro = document.getElementById('tourIntro');
  const titleEl = document.getElementById('tourTitle');
  const descEl = document.getElementById('tourDesc');
  const spotsBar = document.getElementById('tourSpots');
  const hintEl = document.getElementById('tourHint');
  const panoEl = document.getElementById('tourPano');
  const panoBadge = document.getElementById('panoBadge');
  const veilFallback = document.getElementById('veilFallback');
  const spotsToggle = document.getElementById('tourSpotsToggle');

  /* ==================== Three.js 场景 ==================== */
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  viewport.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0, 0);

  const sphereGeo = new THREE.SphereGeometry(50, 64, 48);
  sphereGeo.scale(-1, 1, 1); // 面片翻转向内，从球心看内壁（官方全景示例写法）
  const sphereMat = new THREE.MeshBasicMaterial({ side: THREE.FrontSide, color: 0x0a0505 });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(sphere);

  const MAX_ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1);

  /* ==================== 状态 ==================== */
  const state = {
    spot: -1,
    lon: PHOTO_LON, lat: 0,   // 视线方位角/俯仰角
    dragging: false,
    pinching: false,          // 双指捏合缩放中
    targetFov: FOV_DEF,       // 缩放目标视野
    lastX: 0, lastY: 0,
    vLon: 0, vLat: 0,         // 惯性角速度
    panoActive: false,        // 当前是否处于百度全景 iframe 模式
    forcePhoto: false,        // 全景加载失败时强制照片模式
    lastT: performance.now()
  };

  /* ==================== 音效（Web Audio 轻量合成） ==================== */
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }
  document.addEventListener('pointerdown', initAudio);
  document.addEventListener('keydown', initAudio);

  function playSound(type) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    let dur;
    if (type === 'switch') {
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      dur = 0.22;
    } else { /* tap */
      osc.frequency.setValueAtTime(1046, now);
      osc.frequency.exponentialRampToValueAtTime(1568, now + 0.08);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      dur = 0.18;
    }
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }

  /* ==================== 单张照片 → 2:1 等距柱状球面纹理 ==================== */
  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  /* 原图 1:1 水平居中铺在标准 2:1 画布上：主体零放大最清晰、不变形；
     左右不足的弧面用照片同侧边缘镜像延展填满，再压暗融入暗角。
     竖图（宽<高）也能自然居中，边缘由镜像内容补足 360° */
  function buildSphereCanvas(img) {
    const maxTex = renderer.capabilities.maxTextureSize || 4096;
    const s = Math.min(1, maxTex / (img.height * 2)); // 超 GPU 上限时整体缩
    const W = Math.round(img.height * 2 * s);
    const H = Math.round(img.height * s);
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(s, 0, 0, s, 0, 0);

    const fullW = img.height * 2;           // 缩放前画布宽
    const x = (fullW - img.width) / 2;      // 原图左边缘
    if (x > 0.5) {
      const bw = img.width * 0.25;          // 取边缘 25% 做镜像延展
      // 左侧
      ctx.save();
      ctx.translate(x, 0); ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, bw, img.height, 0, 0, x, img.height);
      ctx.restore();
      // 右侧
      ctx.save();
      ctx.translate(x + img.width, 0); ctx.scale(-1, 1);
      ctx.drawImage(img, img.width - bw, 0, bw, img.height, -x, 0, x, img.height);
      ctx.restore();
      // 两侧压暗，接缝与极点拉伸靠暗角遮罩消化
      const edge = Math.min(0.3, x / fullW + 0.03);
      const g = ctx.createLinearGradient(0, 0, fullW, 0);
      g.addColorStop(0, 'rgba(6,3,3,0.95)');
      g.addColorStop(edge, 'rgba(6,3,3,0)');
      g.addColorStop(1 - edge, 'rgba(6,3,3,0)');
      g.addColorStop(1, 'rgba(6,3,3,0.95)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, fullW, img.height);
    }
    // 中央原图 1:1
    ctx.drawImage(img, x, 0);
    return canvas;
  }

  /* ==================== 百度全景（iframe，仅电脑端3景） ==================== */
  let panoTimer = null;
  let fallbackTimer = null;

  function enterPano(spot) {
    state.panoActive = true;
    document.body.classList.add('pano-mode');
    document.body.classList.remove('bar-open');
    spotsToggle.textContent = '切换景区';
    hintEl.textContent = /scenes\.map\.baidu\.com/.test(spot.panoUrl)
      ? '拖动环视 · 航拍全景'
      : '拖动环视 · 沿箭头前进';
    veil.classList.add('on');
    veilFallback.classList.remove('show');
    clearTimeout(panoTimer);
    clearTimeout(fallbackTimer);
    /* 8秒没load：显示手动兜底；15秒仍没load：自动降级照片 */
    panoTimer = setTimeout(() => {
      if (state.panoActive) veilFallback.classList.add('show');
    }, 8000);
    fallbackTimer = setTimeout(() => {
      if (state.panoActive) fallbackToPhoto();
    }, 15000);
    panoEl.classList.add('on');
    panoBadge.classList.add('on');
    /* 同一全景页不重载，切回时秒开 */
    if (panoEl.dataset.url !== spot.panoUrl) {
      panoEl.dataset.url = spot.panoUrl;
      panoEl.dataset.loaded = '';
      panoEl.src = spot.panoUrl;
    } else if (panoEl.dataset.loaded === '1') {
      veil.classList.remove('on');
    }
  }

  /* 跨站 iframe 的 load 事件可正常触发 */
  panoEl.addEventListener('load', () => {
    if (!panoEl.dataset.url) return;
    panoEl.dataset.loaded = '1';
    clearTimeout(panoTimer);
    clearTimeout(fallbackTimer);
    veilFallback.classList.remove('show');
    if (state.panoActive) veil.classList.remove('on');
  });

  function exitPano() {
    if (!state.panoActive && !panoEl.classList.contains('on')) return;
    state.panoActive = false;
    clearTimeout(panoTimer);
    clearTimeout(fallbackTimer);
    document.body.classList.remove('pano-mode', 'bar-open');
    spotsToggle.textContent = '切换景区';
    panoEl.classList.remove('on');
    panoBadge.classList.remove('on');
  }

  /* 全景加载失败：降级照片模式 */
  function fallbackToPhoto() {
    if (!state.panoActive) return;
    state.forcePhoto = true;
    exitPano();
    build(state.spot);
  }

  veilFallback.addEventListener('click', () => {
    playSound('tap');
    clearTimeout(panoTimer);
    clearTimeout(fallbackTimer);
    fallbackToPhoto();
  });

  /* 全景模式下展开/收起景区切换栏（默认收起，不挡第三方全景控件） */
  spotsToggle.addEventListener('click', () => {
    playSound('tap');
    const open = document.body.classList.toggle('bar-open');
    spotsToggle.textContent = open ? '收起景区栏' : '切换景区';
  });

  /* ==================== 搭建某一景点 ==================== */
  function build(spotIdx) {
    const spot = SPOTS[spotIdx];
    titleEl.textContent = spot.name;
    descEl.textContent = spot.desc;
    spotsBar.querySelectorAll('.tour-spot-btn').forEach((b, bi) => {
      b.classList.toggle('active', bi === spotIdx);
    });

    /* 电脑端 3 景：百度全景 iframe */
    if (panoReady(spot)) {
      enterPano(spot);
      return Promise.resolve();
    }
    exitPano();
    hintEl.textContent = IS_MOBILE
      ? '‹ 单指拖动环视 · 双指缩放 ›'
      : '‹ 按住拖动环视 · 滚轮缩放 ›';

    /* 其余全部：单张实景照片球 */
    return loadImage(spot.photo).then((img) => {
      if (!img) return;
      const strip = buildSphereCanvas(img);
      const tex = new THREE.CanvasTexture(strip);
      tex.generateMipmaps = false;          // NPOT 纹理，不生成 mipmap
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = MAX_ANISO;            // 斜视方向更锐利
      if (sphereMat.map) sphereMat.map.dispose();
      sphereMat.map = tex;
      sphereMat.color.set(0xffffff);
      sphereMat.needsUpdate = true;

      state.lon = PHOTO_LON;                 // 首屏正对照片中心
      state.lat = 0;
      state.vLon = 0; state.vLat = 0;
      camera.fov = state.targetFov = FOV_DEF; // 每个景点恢复默认取景
      camera.updateProjectionMatrix();

      /* 预加载下一景点照片 */
      const nextSpot = SPOTS[(spotIdx + 1) % SPOTS.length];
      if (nextSpot) { const p = new Image(); p.src = nextSpot.photo; }
    });
  }

  /* ==================== 切换景点 ==================== */
  let switching = false;
  function switchSpot(i) {
    if (i === state.spot || switching) return;
    switching = true;
    playSound('switch');
    veil.classList.add('on');
    state.forcePhoto = false; // 切换景点时重置兜底标记，给全景重试机会
    setTimeout(() => {
      state.spot = i;
      build(i).then(() => {
        if (!state.panoActive) veil.classList.remove('on'); // 全景模式由 iframe load 关遮罩
        switching = false;
      });
    }, 300);
  }

  /* ==================== 渲染主循环（拖拽 + 惯性，无自动旋转） ==================== */
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(50, now - state.lastT);
    state.lastT = now;
    const f60 = dt / 16.7;

    if (!state.dragging && (Math.abs(state.vLon) > 0.005 || Math.abs(state.vLat) > 0.005)) {
      /* 松手惯性滑行 */
      state.lon += state.vLon * f60;
      state.lat += state.vLat * f60;
      state.vLon *= Math.pow(0.94, f60);
      state.vLat *= Math.pow(0.94, f60);
      state.lat = Math.max(-LAT_MAX, Math.min(LAT_MAX, state.lat));
    }

    /* 缩放平滑过渡（滚轮/双指只改 targetFov，这里渐进收敛） */
    if (Math.abs(camera.fov - state.targetFov) > 0.05) {
      camera.fov += (state.targetFov - camera.fov) * Math.min(1, 0.22 * f60);
      camera.updateProjectionMatrix();
    }

    /* 视线方向 → 相机 */
    const phi = (90 - state.lat) * Math.PI / 180;
    const theta = state.lon * Math.PI / 180;
    camera.lookAt(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );
    renderer.render(scene, camera);
  }

  /* ==================== 拖拽环视（转头）+ 双指/滚轮缩放 ==================== */
  function degPerPx() {
    const fovX = 2 * Math.atan(Math.tan(camera.fov * Math.PI / 360) * camera.aspect) * 180 / Math.PI;
    return fovX / window.innerWidth;
  }

  /* 活动指针表：1 个=拖拽环视，2 个=双指捏合缩放 */
  const pointers = new Map();
  let pinchDist = 0;

  viewport.addEventListener('pointerdown', (e) => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    hintEl.classList.add('off');
    viewport.setPointerCapture && viewport.setPointerCapture(e.pointerId);
    if (pointers.size === 2) {
      /* 第二根手指落下：停止拖拽与惯性，进入缩放 */
      state.dragging = false;
      state.pinching = true;
      state.vLon = 0; state.vLat = 0;
      const pts = [...pointers.values()];
      pinchDist = Math.max(1, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y));
    } else if (pointers.size === 1 && !state.pinching) {
      state.dragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      state.vLon = 0; state.vLat = 0;
    }
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (state.pinching && pointers.size >= 2) {
      /* 双指：指距变大→放大（fov 变小） */
      const pts = [...pointers.values()];
      const d = Math.max(1, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y));
      state.targetFov = clampFov(state.targetFov * (pinchDist / d));
      pinchDist = d;
      return;
    }
    if (!state.dragging) return;
    const k = degPerPx();
    const dx = e.clientX - state.lastX;
    const dy = e.clientY - state.lastY;
    state.lastX = e.clientX;
    state.lastY = e.clientY;
    state.lon += dx * k;               // 内容跟随手指
    state.lat += dy * k;
    state.lat = Math.max(-LAT_MAX, Math.min(LAT_MAX, state.lat));
    state.vLon = state.vLon * 0.7 + dx * k * 0.3;
    state.vLat = state.vLat * 0.7 + dy * k * 0.3;
  });

  function endPointer(e) {
    const wasPinching = state.pinching;
    pointers.delete(e.pointerId);
    if (wasPinching && pointers.size === 1) {
      /* 双指抬起一根：无缝接回单指拖拽，基准点重置防跳变 */
      state.pinching = false;
      state.dragging = true;
      const p = [...pointers.values()][0];
      state.lastX = p.x;
      state.lastY = p.y;
      state.vLon = 0; state.vLat = 0;
    } else if (pointers.size === 0) {
      state.pinching = false;
      state.dragging = false;
    }
  }
  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);

  /* 桌面端：滚轮缩放（iframe 全景模式下事件被全景页接管，不会进到这里） */
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    hintEl.classList.add('off');
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY; // 兼容行级滚动
    state.targetFov = clampFov(state.targetFov + dy * 0.05);
  }, { passive: false });

  /* ==================== 退出：返回首页入口位置（首页自动跳过开场加载） ==================== */
  function exitTour() {
    /* 记录全景页音乐状态，首页返回后续播 */
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
      try {
        sessionStorage.setItem('music_time', bgMusic.currentTime);
        sessionStorage.setItem('music_playing', String(!bgMusic.paused));
      } catch (e) {}
    }
    /* 首页检测到 skip_entry 会跳过封面/加载动画，
       并按 home_scroll 直接恢复到点击「开始云游」时的板块 */
    window.location.href = window.__localLink ? window.__localLink('/') : '/';
  }

  const closeBtn = document.querySelector('.tour-close');
  if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); exitTour(); });

  /* ==================== 键盘 / 尺寸 ==================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') exitTour();
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ==================== 底部景点按钮 ==================== */
  SPOTS.forEach((spot, i) => {
    const btn = document.createElement('button');
    btn.className = 'tour-spot-btn';
    btn.textContent = spot.name;
    btn.addEventListener('click', () => switchSpot(i));
    spotsBar.appendChild(btn);
  });

  /* ==================== 启动 ==================== */
  state.spot = 0;
  requestAnimationFrame(frame);
  build(0).then(() => {
    setTimeout(() => intro.classList.add('hide'), 500);
  }).catch((err) => console.error('全景构建失败：', err));
  setTimeout(() => intro.classList.add('hide'), 4000); // 兜底

  /* 调试句柄 */
  window.__tour = { state, sphereMat, renderer, camera, IS_MOBILE };
})();
