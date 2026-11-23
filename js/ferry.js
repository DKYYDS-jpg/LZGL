/* ============================================================
 * 夜行古蔺 · 渡口
 * 俯视角潜行：控制红军通信员穿过古镇，避开巡逻与探照灯，
 * 摸到右侧渡口过关。纯 Canvas 2D，无外部依赖。
 * ============================================================ */
(function () {
  'use strict';

  var section = document.getElementById('ferryGame');
  if (!section) return;
  var canvas = document.getElementById('fgCanvas');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var stage = document.getElementById('fgStage');
  var overlay = document.getElementById('fgOverlay');
  var card = document.getElementById('fgCard');
  var levelEl = document.getElementById('fgLevel');
  var starsEl = document.getElementById('fgStars');
  var barEl = document.getElementById('fgBar');
  var meterEl = document.getElementById('fgMeterText');
  var fullBtn = document.getElementById('fgFull');
  var touchEl = document.getElementById('fgTouch');
  var atkBtn = document.getElementById('fgAtk');
  var weaponBtn = document.getElementById('fgWeapon');
  var weaponTagEl = document.getElementById('fgWeaponTag');
  var rotateEl = document.getElementById('fgRotate');
  var tiltEl = document.getElementById('fgTilt');

  var WORLD = { w: 1200, h: 700 };
  var VIEW_H = 320;
  var PI2 = Math.PI * 2;

  /* ---------------- 关卡数据 ---------------- */
  var LEVELS = [
    {
      name: '一渡 · 土城渡口',
      ground: '#16251f',
      start: { x: 90, y: 360 },
      goal: { x: 1062, y: 352 },
      water: { x: 1096, y: 0, w: 104, h: 700 },
      dock: { x: 1006, y: 326, w: 132, h: 52 },
      houses: [
        { x: 180, y: 110, w: 160, h: 110 },
        { x: 430, y: 430, w: 180, h: 120 },
        { x: 690, y: 90, w: 150, h: 100 },
        { x: 860, y: 470, w: 150, h: 110 }
      ],
      trees: [
        { x: 116, y: 126, r: 26 }, { x: 360, y: 626, r: 30 },
        { x: 646, y: 600, r: 22 }, { x: 986, y: 108, r: 24 },
        { x: 566, y: 616, r: 18 }
      ],
      reeds: [
        { x: 340, y: 300, r: 74 }, { x: 600, y: 240, r: 82 },
        { x: 960, y: 250, r: 70 }, { x: 760, y: 566, r: 60 }
      ],
      walls: [ { x: 900, y: 180, w: 24, h: 300 } ],
      crates: [
        { x: 498, y: 286, w: 44, h: 44 },
        { x: 1000, y: 600, w: 44, h: 44 }
      ],
      lanterns: [
        { x: 152, y: 428 }, { x: 520, y: 300 },
        { x: 900, y: 362 }, { x: 1012, y: 300 }
      ],
      stars: [ { x: 340, y: 300 }, { x: 600, y: 240 }, { x: 960, y: 250 } ],
      enemies: [
        { path: [ { x: 380, y: 70 }, { x: 380, y: 630 } ], speed: 50 },
        { path: [ { x: 540, y: 340 }, { x: 980, y: 340 } ], speed: 46 },
        { path: [ { x: 760, y: 640 }, { x: 760, y: 250 } ], speed: 54 }
      ],
      lights: []
    },
    {
      name: '二渡 · 太平渡',
      ground: '#152420',
      start: { x: 86, y: 620 },
      goal: { x: 1046, y: 352 },
      water: { x: 1080, y: 0, w: 120, h: 700 },
      dock: { x: 990, y: 326, w: 130, h: 52 },
      houses: [
        { x: 160, y: 90, w: 170, h: 110 },
        { x: 160, y: 330, w: 170, h: 120 },
        { x: 160, y: 570, w: 170, h: 100 },
        { x: 520, y: 200, w: 180, h: 120 },
        { x: 520, y: 470, w: 180, h: 120 },
        { x: 830, y: 80, w: 150, h: 110 },
        { x: 830, y: 300, w: 150, h: 110 }
      ],
      trees: [
        { x: 120, y: 300, r: 24 }, { x: 380, y: 560, r: 26 },
        { x: 470, y: 130, r: 22 }, { x: 780, y: 630, r: 24 },
        { x: 900, y: 520, r: 26 }
      ],
      reeds: [
        { x: 430, y: 320, r: 62 }, { x: 740, y: 520, r: 68 },
        { x: 960, y: 560, r: 60 }, { x: 700, y: 142, r: 55 }
      ],
      crates: [
        { x: 700, y: 240, w: 44, h: 44 },
        { x: 560, y: 340, w: 44, h: 44 }
      ],
      lanterns: [
        { x: 120, y: 482 }, { x: 420, y: 610 },
        { x: 700, y: 340 }, { x: 980, y: 330 }
      ],
      stars: [ { x: 430, y: 320 }, { x: 740, y: 520 }, { x: 960, y: 560 } ],
      enemies: [
        { path: [ { x: 430, y: 70 }, { x: 430, y: 640 } ], speed: 52 },
        { path: [ { x: 765, y: 140 }, { x: 765, y: 620 } ], speed: 48 },
        { path: [ { x: 590, y: 435 }, { x: 1010, y: 435 } ], speed: 45 }
      ],
      lights: [
        { x: 900, y: 638, base: -2.1, sweep: 0.45, speed: 0.5, len: 480, half: 0.13 }
      ]
    },
    {
      name: '三渡 · 茅台',
      ground: '#141f1d',
      start: { x: 84, y: 352 },
      goal: { x: 1028, y: 352 },
      water: { x: 1060, y: 0, w: 140, h: 700 },
      dock: { x: 972, y: 326, w: 130, h: 52 },
      houses: [
        { x: 140, y: 90, w: 180, h: 120 },
        { x: 140, y: 440, w: 180, h: 120 },
        { x: 450, y: 250, w: 180, h: 130 },
        { x: 450, y: 540, w: 180, h: 110 },
        { x: 760, y: 90, w: 170, h: 120 },
        { x: 760, y: 430, w: 170, h: 120 }
      ],
      trees: [
        { x: 100, y: 620, r: 26 }, { x: 370, y: 170, r: 22 },
        { x: 660, y: 470, r: 24 }, { x: 940, y: 200, r: 26 },
        { x: 990, y: 60, r: 20 }
      ],
      reeds: [
        { x: 330, y: 330, r: 60 }, { x: 650, y: 170, r: 58 },
        { x: 930, y: 330, r: 66 }, { x: 980, y: 600, r: 55 },
        { x: 650, y: 620, r: 50 }
      ],
      crates: [
        { x: 660, y: 386, w: 44, h: 44 },
        { x: 960, y: 470, w: 44, h: 44 }
      ],
      lanterns: [
        { x: 110, y: 520 }, { x: 400, y: 182 },
        { x: 700, y: 330 }, { x: 950, y: 300 }
      ],
      stars: [ { x: 330, y: 330 }, { x: 650, y: 170 }, { x: 980, y: 600 } ],
      enemies: [
        { path: [ { x: 385, y: 60 }, { x: 385, y: 650 } ], speed: 55 },
        { path: [ { x: 698, y: 640 }, { x: 698, y: 70 } ], speed: 50 },
        { path: [ { x: 600, y: 400 }, { x: 1000, y: 400 } ], speed: 46 }
      ],
      lights: [
        { x: 930, y: 80, base: 2.35, sweep: 0.42, speed: 0.5, len: 470, half: 0.12 },
        { x: 980, y: 640, base: -2.2, sweep: 0.4, speed: 0.42, len: 460, half: 0.12 }
      ]
    },
    {
      name: '四渡 · 二郎滩',
      ground: '#121d1b',
      start: { x: 80, y: 360 },
      goal: { x: 1052, y: 352 },
      water: { x: 1088, y: 0, w: 112, h: 700 },
      dock: { x: 1000, y: 326, w: 130, h: 52 },
      houses: [
        { x: 140, y: 80, w: 170, h: 110 },
        { x: 140, y: 320, w: 170, h: 110 },
        { x: 140, y: 540, w: 170, h: 110 },
        { x: 460, y: 180, w: 170, h: 120 },
        { x: 460, y: 440, w: 170, h: 120 },
        { x: 740, y: 80, w: 160, h: 110 },
        { x: 740, y: 300, w: 160, h: 110 },
        { x: 740, y: 540, w: 160, h: 100 }
      ],
      trees: [
        { x: 100, y: 120, r: 22 }, { x: 420, y: 630, r: 24 },
        { x: 700, y: 150, r: 20 }, { x: 980, y: 100, r: 22 },
        { x: 520, y: 650, r: 18 }
      ],
      reeds: [
        { x: 350, y: 230, r: 56 }, { x: 320, y: 500, r: 58 },
        { x: 610, y: 360, r: 60 }, { x: 880, y: 250, r: 58 },
        { x: 950, y: 600, r: 55 }
      ],
      crates: [
        { x: 615, y: 380, w: 44, h: 44 },
        { x: 950, y: 480, w: 44, h: 44 }
      ],
      lanterns: [
        { x: 110, y: 480 }, { x: 400, y: 120 },
        { x: 680, y: 520 }, { x: 1000, y: 300 }
      ],
      stars: [ { x: 320, y: 500 }, { x: 610, y: 360 }, { x: 950, y: 600 } ],
      enemies: [
        { path: [ { x: 350, y: 60 }, { x: 350, y: 650 } ], speed: 56 },
        { path: [ { x: 690, y: 640 }, { x: 690, y: 70 } ], speed: 52 },
        { path: [ { x: 620, y: 430 }, { x: 1000, y: 430 } ], speed: 48 },
        { path: [ { x: 1020, y: 650 }, { x: 1020, y: 470 } ], speed: 40 }
      ],
      lights: [
        { x: 940, y: 90, base: 2.35, sweep: 0.4, speed: 0.5, len: 460, half: 0.12 },
        { x: 960, y: 640, base: -2.1, sweep: 0.4, speed: 0.45, len: 440, half: 0.12 }
      ]
    }
  ];

  /* ---------------- 运行状态 ---------------- */
  var state = {
    level: 0,
    stars: 0,
    exposure: 0,
    running: false,
    paused: false,
    hidden: false,
    over: false,
    collected: {},
    attackCd: 0,
    attackAnim: 0,
    shake: 0,
    weapon: 'melee',
    portrait: false
  };
  var player = { x: 0, y: 0, vx: 0, vy: 0, r: 9.5, dir: 0 };
  var level = null;
  var keys = {};
  var stick = { active: false, id: null, ox: 0, oy: 0, vx: 0, vy: 0, cx: 0, cy: 0 };
  var tilt = { enabled: false, base: null, x: 0, y: 0, seen: 0 };
  var shots = [];
  var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) ||
    (window.matchMedia && window.matchMedia('(hover: none)').matches);
  var view = { w: 731, h: VIEW_H, camX: 0, camY: 0, scale: 1, dpr: 1, cssW: 848, cssH: 441 };
  var pops = [];
  var run = { started: 0, fails: 0, downs: 0 };
  var lastT = 0;
  var rafId = 0;
  var lastPct = -1;

  var SPEED = 162;
  var SPEED_HIDDEN = 108;
  var EXPOSURE_ENEMY = 58;
  var EXPOSURE_LIGHT = 85;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function dist2(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }

  function seedRand(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------------- 关卡装配 ---------------- */
  function loadLevel(index) {
    var cfg = LEVELS[index];
    var i;
    state.level = index;
    state.exposure = 0;
    state.hidden = false;
    state.over = false;
    pops = [];
    shots = [];
    tilt.base = null;

    var rand = seedRand(index * 977 + 13);
    var decor = [];
    for (i = 0; i < 260; i++) {
      var x = rand() * WORLD.w;
      var y = rand() * WORLD.h;
      if (inRect(x, y, cfg.water)) continue;
      var inHouse = false;
      for (var h = 0; h < cfg.houses.length; h++) {
        if (inRect(x, y, cfg.houses[h])) { inHouse = true; break; }
      }
      if (inHouse) continue;
      decor.push({ x: x, y: y, len: 4 + rand() * 7, a: rand() * 0.7 - 0.35, alpha: 0.05 + rand() * 0.08 });
    }

    var mud = [];
    for (i = 0; i < 9; i++) {
      mud.push({ x: rand() * WORLD.w, y: rand() * WORLD.h, rx: 60 + rand() * 90, ry: 30 + rand() * 50, a: 0.03 + rand() * 0.04 });
    }

    var reeds = cfg.reeds.map(function (r) {
      var strokes = [];
      for (i = 0; i < 40; i++) {
        var ang = rand() * PI2;
        var rr = Math.sqrt(rand()) * r.r;
        strokes.push({
          x: Math.cos(ang) * rr,
          y: Math.sin(ang) * rr,
          h: 9 + rand() * 15,
          lean: (rand() - 0.5) * 0.5,
          tint: rand() > 0.55
        });
      }
      return { x: r.x, y: r.y, r: r.r, strokes: strokes };
    });

    var flies = [];
    for (i = 0; i < 14; i++) {
      flies.push({ x: rand() * WORLD.w, y: rand() * WORLD.h, ph: rand() * PI2, sp: 0.35 + rand() * 0.5 });
    }

    var enemies = cfg.enemies.map(function (e) {
      return {
        path: e.path,
        speed: e.speed,
        x: e.path[0].x,
        y: e.path[0].y,
        wp: 1,
        dir: 0,
        seeing: 0,
        sight: 150,
        half: 0.52,
        hp: 2,
        flash: 0,
        down: false
      };
    });
    enemies.forEach(function (e) {
      var n = e.path[e.wp];
      e.dir = Math.atan2(n.y - e.y, n.x - e.x);
    });

    var lights = (cfg.lights || []).map(function (l) {
      return { x: l.x, y: l.y, base: l.base, sweep: l.sweep, speed: l.speed, len: l.len, half: l.half, a: l.base, phase: Math.random() * PI2 };
    });

    if (!state.collected[index]) state.collected[index] = [];

    var walls = cfg.walls || [];
    var crates = (cfg.crates || []).map(function (c) {
      return { x: c.x, y: c.y, w: c.w, h: c.h, hp: 2, flash: 0 };
    });

    level = {
      cfg: cfg,
      decor: decor,
      mud: mud,
      reeds: reeds,
      walls: walls,
      crates: crates,
      blockers: cfg.houses.concat(walls),
      enemies: enemies,
      lights: lights,
      flies: flies,
      stars: cfg.stars.map(function (s, si) {
        return { x: s.x, y: s.y, got: state.collected[index][si] === true };
      })
    };

    player.x = cfg.start.x;
    player.y = cfg.start.y;
    player.vx = player.vy = 0;
    player.dir = 0;

    levelEl.textContent = cfg.name;
    updateStars();
    resize();
    centerCamera(true);
    syncMeter(true);
  }

  function inRect(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
  }

  function updateStars() {
    starsEl.textContent = '★ ' + state.stars;
  }

  function centerCamera(instant) {
    var tx = clamp(player.x - view.w / 2, 0, Math.max(0, WORLD.w - view.w));
    var ty = clamp(player.y - view.h / 2, 0, Math.max(0, WORLD.h - view.h));
    if (instant) { view.camX = tx; view.camY = ty; }
  }

  /* ---------------- 画面尺寸 ---------------- */
  function resize() {
    var rect = stage.getBoundingClientRect();
    if (!rect.width) return;
    var fs = document.fullscreenElement === section;
    var cssW = Math.round(rect.width);
    var cssH;
    if (fs) {
      cssH = Math.round(rect.height) || Math.round(window.innerHeight - 100);
      canvas.style.height = '100%';
    } else {
      var ratio = cssW < 520 ? 0.9 : 0.52;
      cssH = Math.round(clamp(cssW * ratio, 250, 560));
      var maxH = Math.round(window.innerHeight * (isTouch ? 0.66 : 0.82));
      if (maxH > 200) cssH = Math.min(cssH, maxH);
      canvas.style.height = cssH + 'px';
    }
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    view.cssW = cssW;
    view.cssH = cssH;
    view.dpr = dpr;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    if (fs) {
      view.w = 600;
      view.h = 600 * (cssH / cssW);
      if (view.h > WORLD.h) {
        view.h = WORLD.h;
        view.w = WORLD.h * (cssW / cssH);
      }
    } else {
      view.h = VIEW_H;
      view.w = VIEW_H * (cssW / cssH);
    }
    view.scale = (cssH / view.h) * dpr;
    centerCamera(true);
  }

  /* ---------------- 输入 ---------------- */
  window.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].indexOf(k) >= 0 && state.running) e.preventDefault();
    keys[k] = true;
    if (state.running) {
      if (k === ' ' || k === 'j') attack();
      else if (k === '1') setWeapon('melee');
      else if (k === '2') setWeapon('ranged');
      else if (k === 'q') setWeapon(state.weapon === 'melee' ? 'ranged' : 'melee');
    }
  });
  window.addEventListener('keyup', function (e) {
    keys[e.key.toLowerCase()] = false;
  });
  window.addEventListener('blur', function () { keys = {}; });

  function canvasPoint(e) {
    var r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (view.cssW / r.width), y: (e.clientY - r.top) * (view.cssH / r.height) };
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (!state.running) return;
    var p = canvasPoint(e);
    stick.active = true;
    stick.id = e.pointerId;
    stick.ox = p.x; stick.oy = p.y;
    stick.cx = p.x; stick.cy = p.y;
    stick.vx = 0; stick.vy = 0;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!stick.active || e.pointerId !== stick.id) return;
    var p = canvasPoint(e);
    var dx = p.x - stick.ox, dy = p.y - stick.oy;
    var len = Math.sqrt(dx * dx + dy * dy);
    var max = 48;
    if (len > max) { dx = dx / len * max; dy = dy / len * max; len = max; }
    stick.cx = stick.ox + dx;
    stick.cy = stick.oy + dy;
    stick.vx = dx / max;
    stick.vy = dy / max;
  });
  function endStick(e) {
    if (!stick.active || (e && e.pointerId !== stick.id)) return;
    stick.active = false;
    stick.vx = stick.vy = 0;
  }
  canvas.addEventListener('pointerup', endStick);
  canvas.addEventListener('pointercancel', endStick);

  /* ---------------- 覆盖层 ---------------- */
  function showTouch(on) {
    if (!touchEl) return;
    if (on && isTouch && state.running) touchEl.classList.add('is-on');
    else touchEl.classList.remove('is-on');
  }

  function setOverlay(title, text, btnText, action) {
    showTouch(false);
    overlay.classList.add('is-show');
    card.innerHTML = '<div class="fg-overlay-title">' + title + '</div>' +
      '<p class="fg-overlay-text">' + text + '</p>' +
      '<button type="button" class="fg-next" id="fgStart">' + btnText + '</button>';
    var btn = card.querySelector('#fgStart');
    if (btn) btn.addEventListener('click', action);
  }
  function hideOverlay() { overlay.classList.remove('is-show'); }

  function startRun() {
    state.stars = 0;
    state.collected = {};
    state.over = false;
    run.started = performance.now();
    run.fails = 0;
    run.downs = 0;
    loadLevel(0);
    hideOverlay();
    state.running = true;
    if (isTouch) {
      enableTilt();
      goFullscreen();
    }
    syncRotateGate();
    showTouch(true);
    resize();
  }

  function nextLevel() {
    state.running = false;
    if (state.level >= LEVELS.length - 1) {
      win();
      return;
    }
    var nextName = LEVELS[state.level + 1].name;
    setOverlay('过了这一渡',
      '口令还在怀里，前面是' + nextName + '。<br>还有 ' + (LEVELS.length - 1 - state.level) + ' 段路。',
      '继续前进', function () {
        loadLevel(state.level + 1);
        hideOverlay();
        state.running = true;
        showTouch(true);
      });
  }

  function fail() {
    state.running = false;
    state.over = true;
    run.fails++;
    setOverlay('被手电照到了',
      '巡逻的枪口抬了起来。退回芦苇荡，换一条路再走。',
      '再来一次', function () {
        loadLevel(state.level);
        hideOverlay();
        state.running = true;
        showTouch(true);
      });
  }

  /* ---------------- 成绩卡 ---------------- */
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function fmtTime(secs) {
    return pad2(Math.floor(secs / 60)) + ':' + pad2(secs % 60);
  }

  function verdictOf() {
    if (run.fails === 0 && state.stars >= LEVELS.length * 3) return '星火不灭';
    if (run.fails === 0) return '无声过江';
    if (run.fails <= 2) return '险中送信';
    return '摸黑前行';
  }

  function win() {
    state.running = false;
    showTouch(false);
    var secs = Math.max(1, Math.round((performance.now() - run.started) / 1000));
    var verdict = verdictOf();
    var cardCanvas = makeScoreCard(secs, verdict);

    overlay.classList.add('is-show');
    card.innerHTML =
      '<div class="fg-overlay-title">天快亮了</div>' +
      '<p class="fg-overlay-text">你把口令送到渡口，队伍连夜过江。<br>' +
      '用时 ' + fmtTime(secs) + ' · 红星 ' + state.stars + '/' + (LEVELS.length * 3) +
      ' · 被发现 ' + run.fails + ' 次 · 制服 ' + run.downs + ' 人</p>' +
      '<div class="fg-score-btns">' +
      '<button type="button" class="fg-next" id="fgSaveCard">保存成绩卡</button>' +
      '<button type="button" class="fg-next fg-ghost" id="fgAgain">再走一次</button>' +
      '</div>';

    var saveBtn = card.querySelector('#fgSaveCard');
    if (saveBtn) saveBtn.addEventListener('click', function () { saveScoreCard(cardCanvas); });
    var againBtn = card.querySelector('#fgAgain');
    if (againBtn) againBtn.addEventListener('click', startRun);
  }

  function cardStar(g, x, y, ro, ri) {
    g.beginPath();
    for (var i = 0; i < 10; i++) {
      var r = i % 2 === 0 ? ro : ri;
      var a = -Math.PI / 2 + i * Math.PI / 5;
      var px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath();
  }

  function makeScoreCard(secs, verdict) {
    var CW = 1080, CH = 1440;
    var c = document.createElement('canvas');
    c.width = CW;
    c.height = CH;
    var g = c.getContext('2d');
    var i;

    var bg = g.createLinearGradient(0, 0, 0, CH);
    bg.addColorStop(0, '#0b1a18');
    bg.addColorStop(0.55, '#101512');
    bg.addColorStop(1, '#1b0f0b');
    g.fillStyle = bg;
    g.fillRect(0, 0, CW, CH);

    var vg = g.createRadialGradient(CW / 2, CH * 0.34, 60, CW / 2, CH * 0.45, CH * 0.78);
    vg.addColorStop(0, 'rgba(255, 214, 150, .07)');
    vg.addColorStop(1, 'rgba(0, 0, 0, .55)');
    g.fillStyle = vg;
    g.fillRect(0, 0, CW, CH);

    var rand = seedRand(20261127);
    for (i = 0; i < 160; i++) {
      g.fillStyle = 'rgba(180, 200, 180, ' + (0.015 + rand() * 0.025) + ')';
      g.fillRect(rand() * CW, rand() * CH, 2 + rand() * 2, 2 + rand() * 2);
    }

    g.strokeStyle = 'rgba(212, 168, 67, .5)';
    g.lineWidth = 2;
    g.strokeRect(38, 38, CW - 76, CH - 76);
    g.strokeStyle = 'rgba(212, 168, 67, .16)';
    g.lineWidth = 1;
    g.strokeRect(54, 54, CW - 108, CH - 108);

    g.textAlign = 'center';
    var serif = '"Noto Serif SC", "Songti SC", "SimSun", serif';

    g.fillStyle = 'rgba(212, 168, 67, .9)';
    g.font = '600 26px ' + serif;
    g.fillText('重 走 长 征 路 · 古 蔺', CW / 2, 150);

    g.fillStyle = '#f7ecd6';
    g.font = '700 78px ' + serif;
    g.fillText('夜行古蔺', CW / 2, 272);

    g.fillStyle = 'rgba(247, 236, 214, .55)';
    g.font = '400 28px ' + serif;
    g.fillText('四渡赤水 · 土城 / 太平渡 / 茅台 / 二郎滩', CW / 2, 330);

    g.fillStyle = '#ffcf6b';
    cardStar(g, CW / 2, 418, 36, 15);
    g.fill();

    g.fillStyle = '#ffd68e';
    g.font = '700 54px ' + serif;
    g.fillText(verdict, CW / 2, 540);

    g.strokeStyle = 'rgba(212, 168, 67, .3)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(240, 590);
    g.lineTo(CW - 240, 590);
    g.stroke();

    var colsX = [CW / 2 - 220, CW / 2 + 220];
    var rowsY = [682, 872];
    var labels = ['用时', '红星', '被发现', '制服'];
    var values = [fmtTime(secs), state.stars + ' / ' + (LEVELS.length * 3), run.fails + ' 次', run.downs + ' 人'];
    for (i = 0; i < 4; i++) {
      var lx = colsX[i % 2];
      var ly = rowsY[Math.floor(i / 2)];
      g.fillStyle = 'rgba(247, 236, 214, .5)';
      g.font = '400 24px ' + serif;
      g.fillText(labels[i], lx, ly);
      g.fillStyle = '#f7ecd6';
      g.font = '700 46px ' + serif;
      g.fillText(values[i], lx, ly + 62);
    }

    g.strokeStyle = 'rgba(212, 168, 67, .22)';
    g.beginPath();
    g.moveTo(240, 990);
    g.lineTo(CW - 240, 990);
    g.stroke();

    g.strokeStyle = 'rgba(120, 180, 170, .22)';
    g.lineWidth = 2;
    for (i = 0; i < 3; i++) {
      g.beginPath();
      for (var wx = 200; wx <= CW - 200; wx += 16) {
        var wy = 1070 + i * 26 + Math.sin(wx * 0.03 + i * 1.7) * 3;
        if (wx === 200) g.moveTo(wx, wy); else g.lineTo(wx, wy);
      }
      g.stroke();
    }

    g.fillStyle = 'rgba(90, 62, 40, .85)';
    g.beginPath();
    g.ellipse(CW / 2, 1052, 54, 16, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(150, 110, 70, .8)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(CW / 2, 1040);
    g.lineTo(CW / 2, 1016);
    g.stroke();
    g.fillStyle = 'rgba(179, 35, 27, .9)';
    g.beginPath();
    g.moveTo(CW / 2, 1016);
    g.lineTo(CW / 2 + 26, 1022);
    g.lineTo(CW / 2, 1028);
    g.closePath();
    g.fill();

    g.fillStyle = 'rgba(247, 236, 214, .62)';
    g.font = '400 26px ' + serif;
    g.fillText('「夜色是最好的掩护，芦苇是最好的友军。」', CW / 2, 1180);

    g.fillStyle = 'rgba(212, 168, 67, .8)';
    g.font = '600 24px ' + serif;
    g.fillText('重走长征路 · 古蔺 红色文旅', CW / 2, 1300);

    g.fillStyle = 'rgba(247, 236, 214, .4)';
    g.font = '400 20px ' + serif;
    g.fillText('华灿奖 · 数字媒体设计  |  lzgl-38yl31m.maozi.io', CW / 2, 1348);

    return c;
  }

  function downloadBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(url);
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 1500);
  }

  function saveScoreCard(c) {
    var name = '夜行古蔺-成绩卡.png';
    if (!c.toBlob) return;
    c.toBlob(function (blob) {
      if (!blob) return;
      if (isTouch && navigator.canShare && window.File) {
        try {
          var file = new File([blob], name, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: '夜行古蔺 · 成绩卡' }).catch(function (err) {
              if (!err || err.name !== 'AbortError') downloadBlob(blob, name);
            });
            return;
          }
        } catch (e) {}
      }
      downloadBlob(blob, name);
    }, 'image/png');
  }

  /* ---------------- 武器与攻击 ---------------- */
  function setWeapon(w) {
    state.weapon = w === 'ranged' ? 'ranged' : 'melee';
    var name = state.weapon === 'melee' ? '近战' : '远程';
    if (weaponBtn) {
      weaponBtn.textContent = name;
      weaponBtn.classList.toggle('is-ranged', state.weapon === 'ranged');
    }
    if (weaponTagEl) {
      weaponTagEl.textContent = name;
      weaponTagEl.classList.toggle('is-ranged', state.weapon === 'ranged');
    }
  }

  function hitEnemy(e) {
    e.hp--;
    e.flash = 0.25;
    if (e.hp <= 0) {
      e.down = true;
      run.downs++;
      pops.push({ x: e.x, y: e.y, t: 0, text: '制服' });
    }
  }

  function hitCrate(c) {
    c.hp--;
    c.flash = 0.22;
    if (c.hp <= 0) pops.push({ x: c.x + c.w / 2, y: c.y, t: 0, text: '碎' });
  }

  function shoot() {
    var sp = 540;
    shots.push({
      x: player.x + Math.cos(player.dir) * 14,
      y: player.y + Math.sin(player.dir) * 14,
      vx: Math.cos(player.dir) * sp,
      vy: Math.sin(player.dir) * sp,
      life: 0.55
    });
  }

  function updateShots(dt) {
    for (var i = shots.length - 1; i >= 0; i--) {
      var s = shots[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      var dead = s.life <= 0;

      if (!dead) {
        for (var b = 0; b < level.blockers.length; b++) {
          if (inRect(s.x, s.y, level.blockers[b])) { dead = true; break; }
        }
      }
      if (!dead) {
        for (var c = 0; c < level.crates.length; c++) {
          var cr = level.crates[c];
          if (cr.hp > 0 && inRect(s.x, s.y, cr)) {
            hitCrate(cr);
            state.shake = Math.max(state.shake, 0.12);
            dead = true;
            break;
          }
        }
      }
      if (!dead) {
        for (var e = 0; e < level.enemies.length; e++) {
          var en = level.enemies[e];
          if (!en.down && dist2(s.x, s.y, en.x, en.y) < 130) {
            hitEnemy(en);
            state.shake = Math.max(state.shake, 0.12);
            dead = true;
            break;
          }
        }
      }
      if (dead) shots.splice(i, 1);
    }
  }

  function attack() {
    if (!state.running || state.attackCd > 0) return;
    if (state.weapon === 'ranged') {
      state.attackCd = 0.5;
      state.attackAnim = 0.12;
      shoot();
      return;
    }
    state.attackCd = 0.45;
    state.attackAnim = 0.22;
    var hit = false;
    var hitRange = 48;
    var hitArc = 1.15;
    var i;

    for (i = 0; i < level.enemies.length; i++) {
      var e = level.enemies[i];
      if (e.down) continue;
      var edx = e.x - player.x, edy = e.y - player.y;
      var ed = Math.sqrt(edx * edx + edy * edy);
      if (ed > hitRange + 9) continue;
      if (angleDiff(Math.atan2(edy, edx), player.dir) > hitArc) continue;
      hitEnemy(e);
      hit = true;
    }

    for (i = 0; i < level.crates.length; i++) {
      var c = level.crates[i];
      if (c.hp <= 0) continue;
      var nx = clamp(player.x, c.x, c.x + c.w);
      var ny = clamp(player.y, c.y, c.y + c.h);
      var cdx = nx - player.x, cdy = ny - player.y;
      var cd = Math.sqrt(cdx * cdx + cdy * cdy);
      if (cd > hitRange) continue;
      if (angleDiff(Math.atan2(cdy, cdx), player.dir) > hitArc) continue;
      hitCrate(c);
      hit = true;
    }

    if (hit) state.shake = 0.18;
  }

  function update(dt) {
    if (state.attackCd > 0) state.attackCd -= dt;
    if (state.attackAnim > 0) state.attackAnim -= dt;
    if (state.shake > 0) state.shake -= dt;

    var ix = 0, iy = 0;
    if (stick.active) {
      ix = stick.vx; iy = stick.vy;
    } else if (tilt.enabled && tilt.seen && performance.now() - tilt.seen < 900) {
      ix = tilt.x; iy = tilt.y;
    } else {
      if (keys['a'] || keys['arrowleft']) ix -= 1;
      if (keys['d'] || keys['arrowright']) ix += 1;
      if (keys['w'] || keys['arrowup']) iy -= 1;
      if (keys['s'] || keys['arrowdown']) iy += 1;
    }
    var il = Math.sqrt(ix * ix + iy * iy);
    if (il > 1) { ix /= il; iy /= il; }

    var reedy = false;
    for (var i = 0; i < level.reeds.length; i++) {
      var rd = level.reeds[i];
      if (dist2(player.x, player.y, rd.x, rd.y) < rd.r * rd.r * 0.72) { reedy = true; break; }
    }
    state.hidden = reedy;

    var sp = reedy ? SPEED_HIDDEN : SPEED;
    player.vx += (ix * sp - player.vx) * Math.min(1, dt * 13);
    player.vy += (iy * sp - player.vy) * Math.min(1, dt * 13);
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    if (ix || iy) player.dir = Math.atan2(iy, ix);

    collide();
    updateShots(dt);

    /* 相机跟随 */
    var tx = clamp(player.x - view.w / 2, 0, Math.max(0, WORLD.w - view.w));
    var ty = clamp(player.y - view.h / 2, 0, Math.max(0, WORLD.h - view.h));
    view.camX += (tx - view.camX) * Math.min(1, dt * 7);
    view.camY += (ty - view.camY) * Math.min(1, dt * 7);

    /* 巡逻兵 */
    var seenRate = 0;
    for (i = 0; i < level.enemies.length; i++) {
      var en = level.enemies[i];
      if (en.flash > 0) en.flash -= dt;
      if (en.down) continue;
      var target = en.path[en.wp];
      var dx = target.x - en.x, dy = target.y - en.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < 5) {
        en.wp = (en.wp + 1) % en.path.length;
      } else {
        en.dir = Math.atan2(dy, dx);
        en.x += Math.cos(en.dir) * en.speed * dt;
        en.y += Math.sin(en.dir) * en.speed * dt;
      }
      if (sees(en.x, en.y, en.dir, en.sight, en.half)) {
        en.seeing = Math.min(1, en.seeing + dt * 2.5);
        var dd = Math.sqrt(dist2(player.x, player.y, en.x, en.y));
        seenRate = Math.max(seenRate, EXPOSURE_ENEMY * (1.25 - dd / en.sight * 0.5));
      } else {
        en.seeing = Math.max(0, en.seeing - dt * 1.6);
      }
    }

    /* 探照灯 */
    for (i = 0; i < level.lights.length; i++) {
      var li = level.lights[i];
      li.a = li.base + Math.sin(elapsed * li.speed + li.phase) * li.sweep;
      if (!state.hidden) {
        var ldx = player.x - li.x, ldy = player.y - li.y;
        var ld = Math.sqrt(ldx * ldx + ldy * ldy);
        if (ld < li.len) {
          var la = Math.atan2(ldy, ldx);
          if (angleDiff(la, li.a) < li.half && !losBlocked(li.x, li.y, player.x, player.y)) {
            seenRate = Math.max(seenRate, EXPOSURE_LIGHT);
          }
        }
      }
    }

    if (seenRate > 0 && !state.hidden) {
      state.exposure = Math.min(100, state.exposure + seenRate * dt);
      if (state.exposure >= 100) { fail(); return; }
    } else {
      state.exposure = Math.max(0, state.exposure - 26 * dt);
    }

    /* 木箱受击闪烁 */
    for (i = 0; i < level.crates.length; i++) {
      if (level.crates[i].flash > 0) level.crates[i].flash -= dt;
    }

    /* 拾取红星 */
    for (i = 0; i < level.stars.length; i++) {
      var st = level.stars[i];
      if (st.got) continue;
      if (dist2(player.x, player.y, st.x, st.y) < 400) {
        st.got = true;
        state.collected[state.level][i] = true;
        state.stars++;
        updateStars();
        pops.push({ x: st.x, y: st.y, t: 0 });
      }
    }

    /* 抵达渡口 */
    if (dist2(player.x, player.y, level.cfg.goal.x, level.cfg.goal.y) < 900) {
      nextLevel();
    }

    for (i = pops.length - 1; i >= 0; i--) {
      pops[i].t += dt;
      if (pops[i].t > 0.9) pops.splice(i, 1);
    }

    syncMeter(false);
  }

  function collide() {
    var rects = level.cfg.houses.concat(level.walls || [], [level.cfg.water]);
    for (var c = 0; c < level.crates.length; c++) {
      if (level.crates[c].hp > 0) rects.push(level.crates[c]);
    }
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      var nx = clamp(player.x, r.x, r.x + r.w);
      var ny = clamp(player.y, r.y, r.y + r.h);
      var dx = player.x - nx, dy = player.y - ny;
      var d2 = dx * dx + dy * dy;
      if (d2 >= player.r * player.r) continue;
      if (d2 > 0.0001) {
        var d = Math.sqrt(d2);
        player.x = nx + dx / d * player.r;
        player.y = ny + dy / d * player.r;
      } else {
        /* 圆心在矩形内：推向最近的边 */
        var left = player.x - r.x, right = r.x + r.w - player.x;
        var top = player.y - r.y, bottom = r.y + r.h - player.y;
        var m = Math.min(left, right, top, bottom);
        if (m === left) player.x = r.x - player.r;
        else if (m === right) player.x = r.x + r.w + player.r;
        else if (m === top) player.y = r.y - player.r;
        else player.y = r.y + r.h + player.r;
      }
    }
    player.x = clamp(player.x, player.r + 4, WORLD.w - player.r - 4);
    player.y = clamp(player.y, player.r + 4, WORLD.h - player.r - 4);
  }

  function angleDiff(a, b) {
    var d = (a - b) % PI2;
    if (d > Math.PI) d -= PI2;
    if (d < -Math.PI) d += PI2;
    return Math.abs(d);
  }

  function losBlocked(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy);
    var steps = Math.max(2, Math.ceil(len / 14));
    for (var i = 1; i < steps; i++) {
      var x = x1 + dx * (i / steps), y = y1 + dy * (i / steps);
      for (var h = 0; h < level.blockers.length; h++) {
        if (inRect(x, y, level.blockers[h])) return true;
      }
    }
    return false;
  }

  function sees(x, y, dir, sight, half) {
    if (state.hidden) return false;
    var dx = player.x - x, dy = player.y - y;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d > sight) return false;
    if (angleDiff(Math.atan2(dy, dx), dir) > half) return false;
    return !losBlocked(x, y, player.x, player.y);
  }

  function syncMeter(force) {
    var pct = Math.round(state.exposure);
    if (!force && pct === lastPct && !state.hidden) return;
    lastPct = pct;
    barEl.style.width = pct + '%';
    meterEl.textContent = state.hidden ? '隐蔽中 · ' + pct + '%' : '暴露 ' + pct + '%';
    meterEl.style.color = pct > 60 ? 'rgba(224, 118, 92, .95)' : 'rgba(212, 168, 67, .75)';
  }

  /* ---------------- 绘制 ---------------- */
  var elapsed = 0;

  function draw(t) {
    elapsed = t;
    var cfg = level.cfg;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(view.scale, 0, 0, view.scale, -view.camX * view.scale, -view.camY * view.scale);
    if (state.shake > 0) {
      var amp = state.shake * 22;
      ctx.translate((Math.random() - 0.5) * amp, (Math.random() - 0.5) * amp);
    }

    drawGround(t, cfg);
    drawWater(t, cfg);
    drawDock(t, cfg);
    drawLanterns(t, cfg);
    drawFireflies(t);
    drawReeds(t);
    drawHouses(cfg);
    drawWalls();
    drawCrates();
    drawTrees(cfg);
    drawStars(t);
    drawEnemies(t);
    drawSearchlights(t);
    drawPlayer(t);
    drawShots();
    drawAttackFx();
    drawPops();
    drawNight(t);
    drawScreenFx();
  }

  function drawGround(t, cfg) {
    ctx.fillStyle = cfg.ground;
    ctx.fillRect(view.camX - 20, view.camY - 20, view.w + 40, view.h + 40);

    drawRoad(cfg);

    for (var i = 0; i < level.mud.length; i++) {
      var m = level.mud[i];
      ctx.fillStyle = 'rgba(38, 58, 46, ' + m.a + ')';
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, PI2);
      ctx.fill();
    }
    for (i = 0; i < level.decor.length; i++) {
      var d = level.decor[i];
      var sway = Math.sin(t * 1.3 + d.x * 0.05) * 1.2;
      ctx.strokeStyle = 'rgba(128, 158, 118, ' + d.alpha + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + sway + d.a * 6, d.y - d.len);
      ctx.stroke();
    }
  }

  function roadPoints(cfg) {
    var sy = cfg.start.y, gy = cfg.goal.y;
    var my = (sy + gy) / 2;
    return [
      [cfg.start.x - 40, sy],
      [150, sy + (my - sy) * 0.35],
      [340, my - 14],
      [520, my + 12],
      [700, my - 16],
      [880, my + 10],
      [cfg.goal.x, gy]
    ];
  }

  function drawRoad(cfg) {
    var p = roadPoints(cfg);
    var i;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    function trace() {
      ctx.beginPath();
      ctx.moveTo(p[0][0], p[0][1]);
      for (i = 1; i < p.length - 1; i++) {
        var mx = (p[i][0] + p[i + 1][0]) / 2;
        var my = (p[i][1] + p[i + 1][1]) / 2;
        ctx.quadraticCurveTo(p[i][0], p[i][1], mx, my);
      }
      ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1]);
    }

    trace();
    ctx.strokeStyle = 'rgba(62, 56, 40, .5)';
    ctx.lineWidth = 54;
    ctx.stroke();

    trace();
    ctx.strokeStyle = 'rgba(104, 92, 66, .16)';
    ctx.lineWidth = 30;
    ctx.stroke();

    /* 路石 */
    for (i = 1; i < p.length; i++) {
      var x1 = p[i - 1][0], y1 = p[i - 1][1], x2 = p[i][0], y2 = p[i][1];
      var len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
      var steps = Math.floor(len / 44);
      for (var s = 1; s < steps; s++) {
        var k = s / steps;
        ctx.fillStyle = 'rgba(146, 128, 92, .12)';
        ctx.beginPath();
        ctx.ellipse(x1 + (x2 - x1) * k, y1 + (y2 - y1) * k, 3.4, 2, 0, 0, PI2);
        ctx.fill();
      }
    }
  }

  function drawWater(t, cfg) {
    var w = cfg.water;
    var g = ctx.createLinearGradient(w.x, 0, WORLD.w, 0);
    g.addColorStop(0, '#123238');
    g.addColorStop(1, '#0a2026');
    ctx.fillStyle = g;
    ctx.fillRect(w.x, 0, WORLD.w - w.x, WORLD.h);

    ctx.strokeStyle = 'rgba(96, 156, 150, .35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w.x, 0);
    ctx.lineTo(w.x, WORLD.h);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(170, 216, 206, .12)';
    ctx.lineWidth = 1.2;
    for (var i = 0; i < 9; i++) {
      var y = 30 + i * 78;
      ctx.beginPath();
      for (var x = w.x + 8; x < WORLD.w; x += 12) {
        var yy = y + Math.sin(x * 0.06 + t * 1.6 + i) * 3;
        if (x === w.x + 8) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
  }

  function drawDock(t, cfg) {
    var d = cfg.dock;
    var g = cfg.goal;

    /* 光晕提示 */
    var pulse = 0.5 + Math.sin(t * 2.2) * 0.5;
    var glow = ctx.createRadialGradient(g.x, g.y, 4, g.x, g.y, 56);
    glow.addColorStop(0, 'rgba(255, 206, 120, ' + (0.22 + pulse * 0.16) + ')');
    glow.addColorStop(1, 'rgba(255, 206, 120, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 56, 0, PI2);
    ctx.fill();

    /* 栈桥 */
    ctx.fillStyle = '#3a2a19';
    ctx.fillRect(d.x, d.y, d.w, d.h);
    ctx.strokeStyle = 'rgba(94, 70, 44, .9)';
    ctx.lineWidth = 1;
    for (var x = d.x + 8; x < d.x + d.w; x += 12) {
      ctx.beginPath(); ctx.moveTo(x, d.y); ctx.lineTo(x, d.y + d.h); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(20, 14, 9, .8)';
    ctx.strokeRect(d.x + .5, d.y + .5, d.w - 1, d.h - 1);

    /* 小船 */
    var bx = d.x + d.w + 14, by = d.y + d.h / 2;
    ctx.fillStyle = '#2b1a10';
    ctx.beginPath();
    ctx.ellipse(bx, by, 34, 15, 0, 0, PI2);
    ctx.fill();
    ctx.strokeStyle = '#5d4026';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(bx, by, 34, 15, 0, 0, PI2);
    ctx.stroke();
    /* 桅杆与小旗 */
    ctx.strokeStyle = '#6c5236';
    ctx.beginPath(); ctx.moveTo(bx, by - 12); ctx.lineTo(bx, by - 34); ctx.stroke();
    ctx.fillStyle = '#b3231b';
    ctx.beginPath();
    ctx.moveTo(bx, by - 34);
    ctx.lineTo(bx + 20, by - 30);
    ctx.lineTo(bx, by - 24);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffcf6b';
    starPath(bx + 7, by - 29.5, 2.4, 1.1, 0);
    ctx.fill();

    /* 目标文字 */
    ctx.font = '600 13px "Noto Serif SC", "Songti SC", serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 214, 142, ' + (0.65 + pulse * 0.3) + ')';
    ctx.fillText('渡口', g.x, g.y - 28);
  }

  function drawLanterns(t, cfg) {
    for (var i = 0; i < cfg.lanterns.length; i++) {
      var l = cfg.lanterns[i];
      var flick = 0.82 + Math.sin(t * 3.1 + i * 2.3) * 0.18;
      var g = ctx.createRadialGradient(l.x, l.y, 2, l.x, l.y, 62);
      g.addColorStop(0, 'rgba(255, 190, 110, ' + (0.16 * flick) + ')');
      g.addColorStop(1, 'rgba(255, 190, 110, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(l.x, l.y, 62, 0, PI2); ctx.fill();

      ctx.fillStyle = 'rgba(255, 214, 150, ' + (0.9 * flick) + ')';
      ctx.beginPath(); ctx.arc(l.x, l.y, 2.6, 0, PI2); ctx.fill();
    }
  }

  function drawFireflies(t) {
    for (var i = 0; i < level.flies.length; i++) {
      var f = level.flies[i];
      var x = f.x + Math.sin(t * 0.4 * f.sp + f.ph) * 18;
      var y = f.y + Math.cos(t * 0.32 * f.sp + f.ph) * 12;
      var a = 0.18 + 0.22 * (0.5 + Math.sin(t * 1.6 + f.ph) * 0.5);
      ctx.fillStyle = 'rgba(255, 214, 140, ' + a + ')';
      ctx.beginPath();
      ctx.arc(x, y, 1.7, 0, PI2);
      ctx.fill();
    }
  }

  function drawReeds(t) {
    for (var i = 0; i < level.reeds.length; i++) {
      var r = level.reeds[i];
      ctx.fillStyle = 'rgba(14, 28, 20, .55)';
      ctx.beginPath();
      ctx.ellipse(r.x, r.y + 4, r.r * 0.9, r.r * 0.62, 0, 0, PI2);
      ctx.fill();

      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.lineCap = 'round';
      for (var s = 0; s < r.strokes.length; s++) {
        var st = r.strokes[s];
        var sway = Math.sin(t * 1.8 + i + s * 0.6) * 2.2;
        ctx.strokeStyle = st.tint ? 'rgba(92, 132, 96, .7)' : 'rgba(50, 86, 66, .85)';
        ctx.lineWidth = st.tint ? 1.2 : 1.4;
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.quadraticCurveTo(st.x + st.lean * 5, st.y - st.h * 0.6, st.x + st.lean * 8 + sway, st.y - st.h);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawHouses(cfg) {
    for (var i = 0; i < cfg.houses.length; i++) {
      var h = cfg.houses[i];
      /* 投影 */
      ctx.fillStyle = 'rgba(0, 0, 0, .34)';
      ctx.fillRect(h.x + 6, h.y + 8, h.w, h.h);
      /* 屋顶 */
      ctx.fillStyle = '#2a1f18';
      ctx.fillRect(h.x, h.y, h.w, h.h);
      /* 受光的一半屋面 */
      ctx.fillStyle = 'rgba(255, 236, 200, .045)';
      ctx.fillRect(h.x, h.y, h.w, h.h / 2);
      /* 瓦垄 */
      ctx.strokeStyle = 'rgba(96, 74, 52, .32)';
      ctx.lineWidth = 1;
      for (var y = h.y + 8; y < h.y + h.h; y += 9) {
        ctx.beginPath(); ctx.moveTo(h.x + 3, y); ctx.lineTo(h.x + h.w - 3, y); ctx.stroke();
      }
      /* 屋脊 */
      ctx.strokeStyle = 'rgba(122, 96, 66, .8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(h.x + 2, h.y + h.h / 2);
      ctx.lineTo(h.x + h.w - 2, h.y + h.h / 2);
      ctx.stroke();
      /* 檐口 */
      ctx.strokeStyle = 'rgba(15, 11, 8, .85)';
      ctx.lineWidth = 2;
      ctx.strokeRect(h.x + 1, h.y + 1, h.w - 2, h.h - 2);
      /* 窗灯 */
      ctx.fillStyle = 'rgba(255, 190, 110, .5)';
      ctx.fillRect(h.x + h.w * 0.18, h.y + h.h - 10, 10, 6);
      ctx.fillRect(h.x + h.w * 0.68, h.y + h.h - 10, 10, 6);
    }
  }

  function drawWalls() {
    for (var i = 0; i < level.walls.length; i++) {
      var w = level.walls[i];
      ctx.fillStyle = 'rgba(0, 0, 0, .38)';
      ctx.fillRect(w.x + 6, w.y + 7, w.w, w.h);
      ctx.fillStyle = '#39322a';
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = 'rgba(122, 110, 88, .18)';
      ctx.lineWidth = 1;
      for (var y = w.y + 16; y < w.y + w.h; y += 18) {
        ctx.beginPath();
        ctx.moveTo(w.x + 2, y);
        ctx.lineTo(w.x + w.w - 2, y);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(150, 130, 100, .16)';
      ctx.fillRect(w.x, w.y, w.w, 3);
      ctx.strokeStyle = 'rgba(12, 9, 7, .8)';
      ctx.strokeRect(w.x + .5, w.y + .5, w.w - 1, w.h - 1);
    }
  }

  function drawCrates() {
    for (var i = 0; i < level.crates.length; i++) {
      var c = level.crates[i];
      if (c.hp <= 0) continue;
      ctx.fillStyle = 'rgba(0, 0, 0, .35)';
      ctx.fillRect(c.x + 4, c.y + 5, c.w, c.h);
      ctx.fillStyle = c.flash > 0 ? '#8a6437' : '#5a3f22';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = 'rgba(20, 13, 8, .85)';
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
      ctx.strokeStyle = 'rgba(196, 160, 104, .45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x + 4, c.y + 4);
      ctx.lineTo(c.x + c.w - 4, c.y + c.h - 4);
      ctx.moveTo(c.x + c.w - 4, c.y + 4);
      ctx.lineTo(c.x + 4, c.y + c.h - 4);
      ctx.stroke();
      if (c.flash > 0) {
        ctx.fillStyle = 'rgba(255, 240, 200, .28)';
        ctx.fillRect(c.x, c.y, c.w, c.h);
      }
    }
  }

  function drawShots() {
    for (var i = 0; i < shots.length; i++) {
      var s = shots[i];
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      var g = ctx.createRadialGradient(s.x, s.y, 1, s.x, s.y, 12);
      g.addColorStop(0, 'rgba(255, 226, 166, .55)');
      g.addColorStop(1, 'rgba(255, 226, 166, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(s.x, s.y, 12, 0, PI2); ctx.fill();
      ctx.restore();

      ctx.strokeStyle = 'rgba(255, 232, 180, .45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x - s.vx * 0.016, s.y - s.vy * 0.016);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      ctx.fillStyle = '#ffe6b0';
      ctx.beginPath(); ctx.arc(s.x, s.y, 2.6, 0, PI2); ctx.fill();
    }
  }

  function drawAttackFx() {
    if (state.attackAnim <= 0) return;
    if (state.weapon === 'ranged') {
      var m = 1 - state.attackAnim / 0.12;
      var mx = player.x + Math.cos(player.dir) * 18;
      var my = player.y + Math.sin(player.dir) * 18;
      ctx.save();
      ctx.globalAlpha = 0.85 * (1 - m);
      var g = ctx.createRadialGradient(mx, my, 1, mx, my, 16);
      g.addColorStop(0, 'rgba(255, 236, 180, .9)');
      g.addColorStop(1, 'rgba(255, 236, 180, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(mx, my, 16, 0, PI2); ctx.fill();
      ctx.restore();
      return;
    }
    var k = 1 - state.attackAnim / 0.22;
    ctx.save();
    ctx.globalAlpha = 0.9 * (1 - k * 0.7);
    ctx.strokeStyle = '#ffe0a8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(player.x, player.y, 30 + k * 10, player.dir - 0.95, player.dir + 0.95);
    ctx.stroke();
    ctx.restore();
  }

  function drawTrees(cfg) {
    for (var i = 0; i < cfg.trees.length; i++) {
      var tr = cfg.trees[i];
      ctx.fillStyle = 'rgba(0, 0, 0, .35)';
      ctx.beginPath(); ctx.ellipse(tr.x + 5, tr.y + 7, tr.r * 0.9, tr.r * 0.6, 0, 0, PI2); ctx.fill();
      var g = ctx.createRadialGradient(tr.x - 6, tr.y - 6, 2, tr.x, tr.y, tr.r);
      g.addColorStop(0, '#24402f');
      g.addColorStop(1, '#122019');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(tr.x, tr.y, tr.r, 0, PI2); ctx.fill();
    }
  }

  function drawStars(t) {
    for (var i = 0; i < level.stars.length; i++) {
      var s = level.stars[i];
      if (s.got) continue;
      var bob = Math.sin(t * 2.4 + i) * 3;
      var y = s.y + bob;
      var g = ctx.createRadialGradient(s.x, y, 2, s.x, y, 26);
      g.addColorStop(0, 'rgba(255, 206, 110, .34)');
      g.addColorStop(1, 'rgba(255, 206, 110, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(s.x, y, 26, 0, PI2); ctx.fill();

      ctx.fillStyle = '#ffcf6b';
      starPath(s.x, y, 9, 4, -Math.PI / 2);
      ctx.fill();
    }
  }

  function starPath(x, y, ro, ri, rot) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var r = i % 2 === 0 ? ro : ri;
      var a = rot + i * Math.PI / 5;
      if (i === 0) ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      else ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.closePath();
  }

  function drawEnemies(t) {
    for (var i = 0; i < level.enemies.length; i++) {
      var e = level.enemies[i];
      if (e.down) continue;
      /* 视野锥 */
      var alert = e.seeing;
      var g = ctx.createRadialGradient(e.x, e.y, 8, e.x, e.y, e.sight);
      g.addColorStop(0, 'rgba(255, 226, 156, ' + (0.16 + alert * 0.16) + ')');
      g.addColorStop(0.65, 'rgba(255, 214, 140, ' + (0.07 + alert * 0.08) + ')');
      g.addColorStop(1, 'rgba(255, 214, 140, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.arc(e.x, e.y, e.sight, e.dir - e.half, e.dir + e.half);
      ctx.closePath();
      ctx.fill();

      /* 投影 */
      ctx.fillStyle = 'rgba(0, 0, 0, .4)';
      ctx.beginPath(); ctx.ellipse(e.x + 2, e.y + 6, 10, 5.6, 0, 0, PI2); ctx.fill();
      /* 身体 */
      ctx.fillStyle = e.flash > 0 ? '#c46a4e' : (alert > 0.5 ? '#5a3730' : '#2c3a35');
      ctx.beginPath(); ctx.arc(e.x, e.y, 9, 0, PI2); ctx.fill();
      /* 帽檐 */
      ctx.fillStyle = e.flash > 0 ? '#e09a78' : (alert > 0.5 ? '#7a4238' : '#3b4c45');
      ctx.beginPath(); ctx.arc(e.x - Math.cos(e.dir) * 2.6, e.y - Math.sin(e.dir) * 2.6, 5.2, 0, PI2); ctx.fill();
      /* 手电亮点 */
      ctx.fillStyle = 'rgba(255, 232, 168, .9)';
      ctx.beginPath();
      ctx.arc(e.x + Math.cos(e.dir) * 8, e.y + Math.sin(e.dir) * 8, 2, 0, PI2);
      ctx.fill();

      if (e.seeing > 0.15) {
        ctx.font = '700 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(232, 96, 70, ' + (0.5 + e.seeing * 0.5) + ')';
        ctx.fillText('!', e.x, e.y - 16 - Math.sin(t * 8) * 2);
      }
    }
  }

  function drawSearchlights(t) {
    for (var i = 0; i < level.lights.length; i++) {
      var l = level.lights[i];
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      var g = ctx.createRadialGradient(l.x, l.y, 6, l.x, l.y, l.len);
      g.addColorStop(0, 'rgba(255, 236, 186, .30)');
      g.addColorStop(0.5, 'rgba(255, 226, 160, .10)');
      g.addColorStop(1, 'rgba(255, 226, 160, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.arc(l.x, l.y, l.len, l.a - l.half, l.a + l.half);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      /* 灯座 */
      ctx.fillStyle = '#20261f';
      ctx.beginPath(); ctx.arc(l.x, l.y, 7, 0, PI2); ctx.fill();
      ctx.fillStyle = '#ffe7ac';
      ctx.beginPath(); ctx.arc(l.x, l.y, 3, 0, PI2); ctx.fill();
    }
  }

  function drawPlayer(t) {
    var p = player;
    /* 船灯般的一圈微光 */
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var lg = ctx.createRadialGradient(p.x, p.y, 6, p.x, p.y, 96);
    lg.addColorStop(0, 'rgba(255, 196, 120, .10)');
    lg.addColorStop(1, 'rgba(255, 196, 120, 0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(p.x, p.y, 96, 0, PI2); ctx.fill();
    ctx.restore();

    var alpha = state.hidden ? 0.45 : 1;
    ctx.globalAlpha = alpha;

    /* 投影 */
    ctx.fillStyle = 'rgba(0, 0, 0, .42)';
    ctx.beginPath(); ctx.ellipse(p.x + 2, p.y + 7, 10.5, 6, 0, 0, PI2); ctx.fill();
    /* 身体 */
    ctx.fillStyle = '#a8201a';
    ctx.beginPath(); ctx.arc(p.x, p.y, 9.8, 0, PI2); ctx.fill();
    ctx.strokeStyle = 'rgba(255, 176, 120, .35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    /* 八角帽 */
    ctx.fillStyle = '#6f1713';
    ctx.beginPath(); ctx.arc(p.x, p.y, 6.4, 0, PI2); ctx.fill();
    /* 帽徽红星 */
    ctx.fillStyle = '#ffcf6b';
    starPath(p.x, p.y, 4, 1.8, -Math.PI / 2);
    ctx.fill();
    /* 朝向 */
    ctx.strokeStyle = 'rgba(255, 214, 150, .55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(p.dir) * 12, p.y + Math.sin(p.dir) * 12);
    ctx.lineTo(p.x + Math.cos(p.dir) * 18, p.y + Math.sin(p.dir) * 18);
    ctx.stroke();

    ctx.globalAlpha = 1;

    if (state.hidden) {
      ctx.font = '600 11px "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(160, 214, 168, .9)';
      ctx.fillText('隐蔽', p.x, p.y - 18);
    }
  }

  function drawPops() {
    for (var i = 0; i < pops.length; i++) {
      var p = pops[i];
      var k = p.t / 0.9;
      ctx.globalAlpha = 1 - k;
      ctx.font = '700 13px "Noto Serif SC", serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = p.text ? '#ffe0a8' : '#ffcf6b';
      ctx.fillText(p.text || '+1', p.x, p.y - 10 - k * 20);
      ctx.globalAlpha = 1;
    }
  }

  function drawNight(t) {
    /* 玩家周围的暖光 */
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    var g = ctx.createRadialGradient(player.x, player.y, 8, player.x, player.y, 150);
    g.addColorStop(0, 'rgba(255, 198, 120, .16)');
    g.addColorStop(0.55, 'rgba(255, 198, 120, .05)');
    g.addColorStop(1, 'rgba(255, 198, 120, 0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(player.x, player.y, 150, 0, PI2); ctx.fill();
    ctx.restore();
  }

  function drawScreenFx() {
    var cssW = view.cssW, cssH = view.cssH, dpr = view.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* 暗角 */
    var vg = ctx.createRadialGradient(cssW / 2, cssH / 2, Math.min(cssW, cssH) * 0.34,
      cssW / 2, cssH / 2, Math.max(cssW, cssH) * 0.74);
    vg.addColorStop(0, 'rgba(4, 10, 9, 0)');
    vg.addColorStop(1, 'rgba(3, 7, 7, .58)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, cssW, cssH);

    /* 暴露红晕 */
    if (state.exposure > 1) {
      ctx.fillStyle = 'rgba(176, 38, 28, ' + (state.exposure / 100 * 0.2) + ')';
      ctx.fillRect(0, 0, cssW, cssH);
    }

    /* 渡口方向指示 */
    if (level) {
      var sc = cssH / view.h;
      var gx = (level.cfg.goal.x - view.camX) * sc;
      var gy = (level.cfg.goal.y - view.camY) * sc;
      if (gx < 26 || gx > cssW - 26 || gy < 26 || gy > cssH - 26) {
        var ang = Math.atan2(gy - cssH / 2, gx - cssW / 2);
        var ex = clamp(gx, 36, cssW - 36);
        var ey = clamp(gy, 30, cssH - 30);
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate(ang);
        ctx.fillStyle = 'rgba(255, 206, 110, .9)';
        ctx.beginPath();
        ctx.moveTo(10, 0); ctx.lineTo(-7, -7); ctx.lineTo(-3, 0); ctx.lineTo(-7, 7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        var dd = Math.round(Math.sqrt(dist2(player.x, player.y, level.cfg.goal.x, level.cfg.goal.y)) / 10);
        ctx.font = '600 11px "Noto Serif SC", "Songti SC", serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 214, 142, .62)';
        ctx.fillText('渡口 ' + dd + 'm', ex, ey + 20);
      }
    }

    /* 摇杆 */
    if (stick.active) {
      ctx.strokeStyle = 'rgba(255, 226, 166, .28)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(stick.ox, stick.oy, 44, 0, PI2); ctx.stroke();
      ctx.fillStyle = 'rgba(255, 226, 166, .26)';
      ctx.beginPath(); ctx.arc(stick.cx, stick.cy, 18, 0, PI2); ctx.fill();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /* ---------------- 主循环 ---------------- */
  function loop(ts) {
    rafId = requestAnimationFrame(loop);
    if (!lastT) lastT = ts;
    var dt = Math.min(0.05, (ts - lastT) / 1000);
    lastT = ts;
    if (!level) return;
    syncRotateGate();
    if (state.running && !state.paused && !state.portrait) update(dt);
    draw(ts / 1000);
  }

  /* ---------------- 暂停 ---------------- */
  document.addEventListener('visibilitychange', function () {
    state.paused = document.hidden;
    if (document.hidden && stick.active) { stick.active = false; }
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        state.paused = !en.isIntersecting;
        if (state.paused && stick.active) stick.active = false;
      });
    }, { threshold: 0.12 }).observe(section);
  }

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!level) return;
      resize();
      centerCamera(true);
      syncRotateGate();
    }, 140);
  });
  window.addEventListener('orientationchange', function () {
    tilt.base = null;
    setTimeout(function () {
      if (!level) return;
      resize();
      centerCamera(true);
      syncRotateGate();
    }, 260);
  });
  if ('ResizeObserver' in window) {
    new ResizeObserver(function () {
      if (!level) return;
      if (!stage.getBoundingClientRect().width) return;
      resize();
      centerCamera(true);
    }).observe(stage);
  }

  /* ---------------- 体感 ---------------- */
  function setTiltHint(text) {
    if (tiltEl) tiltEl.textContent = text;
  }

  function tiltNorm(v) {
    var dead = 4, max = 22;
    var a = Math.abs(v) - dead;
    if (a <= 0) return 0;
    return (v < 0 ? -1 : 1) * Math.min(1, a / (max - dead));
  }

  function onOrientation(e) {
    if (e.beta == null && e.gamma == null) return;
    var angle = 0;
    if (screen.orientation && typeof screen.orientation.angle === 'number') angle = screen.orientation.angle;
    else if (typeof window.orientation === 'number') angle = window.orientation;

    var gx, gy;
    if (angle === 90) { gx = e.beta || 0; gy = -(e.gamma || 0); }
    else if (angle === -90 || angle === 270) { gx = -(e.beta || 0); gy = (e.gamma || 0); }
    else { gx = e.gamma || 0; gy = e.beta || 0; }

    if (!tilt.base) tilt.base = { x: gx, y: gy };
    tilt.seen = performance.now();
    tilt.x = tiltNorm(gx - tilt.base.x);
    tilt.y = tiltNorm(gy - tilt.base.y);
  }

  function enableTilt() {
    if (!isTouch || tilt.enabled) return;
    var DOE = window.DeviceOrientationEvent;
    if (!DOE) { setTiltHint('拖动移动'); return; }
    function attach() {
      window.addEventListener('deviceorientation', onOrientation);
      tilt.enabled = true;
      tilt.base = null;
      setTiltHint('体感移动');
    }
    if (typeof DOE.requestPermission === 'function') {
      DOE.requestPermission().then(function (res) {
        if (res === 'granted') attach();
        else setTiltHint('拖动移动');
      }).catch(function () { setTiltHint('拖动移动'); });
    } else {
      attach();
    }
  }

  /* ---------------- 触屏按钮 ---------------- */
  function bindTouch() {
    if (!touchEl) return;
    if (atkBtn) {
      atkBtn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        atkBtn.classList.add('is-down');
        attack();
      });
      var upA = function () { atkBtn.classList.remove('is-down'); };
      atkBtn.addEventListener('pointerup', upA);
      atkBtn.addEventListener('pointercancel', upA);
      atkBtn.addEventListener('pointerleave', upA);
      atkBtn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    }
    if (weaponBtn) {
      weaponBtn.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        setWeapon(state.weapon === 'melee' ? 'ranged' : 'melee');
      });
      weaponBtn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    }
  }

  /* ---------------- 横屏与全屏 ---------------- */
  function lockLandscape() {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(function () {});
    }
  }

  function goFullscreen() {
    if (document.fullscreenElement === section) return;
    var p = section.requestFullscreen ? section.requestFullscreen() : null;
    if (p && p.then) {
      p.then(function () {
        lockLandscape();
        setTimeout(function () {
          resize();
          centerCamera(true);
          syncRotateGate();
        }, 280);
      }).catch(function () {});
    }
  }

  function isPortrait() {
    return window.innerHeight > window.innerWidth + 40;
  }

  var lastRotateBlock = null;
  function syncRotateGate() {
    var block = !!(isTouch && state.running && isPortrait());
    state.portrait = block;
    if (rotateEl && block !== lastRotateBlock) {
      rotateEl.hidden = !block;
      lastRotateBlock = block;
    }
  }

  function setupFullscreen() {
    if (!fullBtn) return;
    fullBtn.addEventListener('click', function () {
      if (document.fullscreenElement === section) {
        if (document.exitFullscreen) document.exitFullscreen();
        return;
      }
      goFullscreen();
    });
    document.addEventListener('fullscreenchange', function () {
      var on = document.fullscreenElement === section;
      fullBtn.textContent = on ? '退出全屏' : '全屏';
      if (!on && screen.orientation && screen.orientation.unlock) {
        try { screen.orientation.unlock(); } catch (e) {}
      }
      setTimeout(function () {
        resize();
        centerCamera(true);
        syncRotateGate();
      }, 140);
    });
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    section.classList.toggle('is-touch', isTouch);
    resize();
    loadLevel(0);
    syncMeter(true);
    var btn = document.getElementById('fgStart');
    if (btn) btn.addEventListener('click', startRun);
    bindTouch();
    setupFullscreen();
    setWeapon('melee');
    syncRotateGate();
    if (rafId) cancelAnimationFrame(rafId);
    lastT = 0;
    rafId = requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
