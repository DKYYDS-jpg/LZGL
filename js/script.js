/* ==========================================================
   重走长征路 · 古蔺 | 交互脚本
   ========================================================== */

/* ==================== 0. 进入封面 → 音乐 → 加载动画 → 主页面 ==================== */
(function initEntryGate() {
  const gate = document.getElementById('entryGate');
  const loader = document.getElementById('loader');
  if (!gate) return;

  /* ---- 判断是否从详情页返回 ---- */
  const returning = sessionStorage.getItem('skip_entry') === 'true';
  if (returning) {
    sessionStorage.removeItem('skip_entry');

    // 直接跳过封面和加载动画
    gate.style.display = 'none';
    if (loader) loader.style.display = 'none';
    document.body.classList.remove('locked');

    // 恢复滚动位置
    const scrollPos = parseInt(sessionStorage.getItem('home_scroll') || '0', 10);
    if (scrollPos > 0) {
      const restore = () => window.scrollTo(0, scrollPos);
      restore();
      setTimeout(restore, 100);
      setTimeout(restore, 400);
      setTimeout(restore, 900);
    }

    // 恢复背景音乐的播放位置和状态
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
      const musicTime = parseFloat(sessionStorage.getItem('music_time') || '0');
      const musicWasPlaying = sessionStorage.getItem('music_playing') === 'true';
      bgMusic.currentTime = musicTime;
      bgMusic.volume = 0.35;
      if (musicWasPlaying) {
        bgMusic.play().catch(err => {
          console.warn('返回主页音乐恢复失败：', err);
        });
      }

      // 离开主页前保存音乐状态（跳转到详情页时已经保存过，这里是兜底）
      window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('music_time', bgMusic.currentTime);
        sessionStorage.setItem('music_playing', !bgMusic.paused);
      });
    }
    return;
  }

  /* ---- 首次进入的正常流程 ---- */
  let entered = false;

  function enter() {
    if (entered) return;
    entered = true;

    gate.classList.add('flash');

    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
      bgMusic.muted = false;
      bgMusic.volume = 0;
      bgMusic.play().then(() => {
        let vol = 0;
        const fade = setInterval(() => {
          vol = Math.min(vol + 0.02, 0.35);
          bgMusic.volume = vol;
          if (vol >= 0.35) clearInterval(fade);
        }, 60);
      }).catch(err => {
        console.warn('音乐播放失败：', err);
      });
    }

    setTimeout(() => {
      gate.classList.add('hide');
      document.body.classList.remove('locked');
      if (loader) loader.classList.add('show');
      setTimeout(() => {
        gate.style.display = 'none';
      }, 1000);
    }, 400);

    setTimeout(() => {
      if (loader) loader.classList.add('hide');
    }, 3000);
  }

  gate.addEventListener('click', enter);
  gate.addEventListener('touchstart', enter, { passive: true });
})();

/* ==================== 1. 粒子背景 ==================== */
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = 30;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 12) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
    p.style.opacity = 0.2 + Math.random() * 0.4;
    container.appendChild(p);
  }
})();

/* ==================== 2. 滚动 reveal ==================== */
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ==================== 3. 真视差滚动 ==================== */
(function initParallax() {
  const transitionSection = document.getElementById('transition');
  if (!transitionSection) return;
  const layers = transitionSection.querySelectorAll('.parallax-layer');
  let ticking = false;

  function update() {
    const rect = transitionSection.getBoundingClientRect();
    const windowH = window.innerHeight;
    if (rect.top < windowH && rect.bottom > 0) {
      const progress = (windowH - rect.top) / (windowH + rect.height);
      layers.forEach(layer => {
        const speed = parseFloat(layer.dataset.speed) || 1;
        const offset = (progress - 0.5) * 200 * speed;
        layer.style.transform = `translateY(${offset}px)`;
      });
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  });
  update();
})();

/* ==================== 4. 音效系统（Web Audio API） ==================== */
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('浏览器不支持 Web Audio API');
      return;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

document.addEventListener('click', initAudio);
document.addEventListener('touchstart', initAudio);

function playSound(type) {
  if (!audioCtx) {
    initAudio();
    if (!audioCtx) return;
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(() => actuallyPlay(type));
  } else {
    actuallyPlay(type);
  }
}

function actuallyPlay(type) {
  const now = audioCtx.currentTime;

  if (type === 'tap') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046, now);
    osc.frequency.exponentialRampToValueAtTime(1568, now + 0.08);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'score') {
    [523, 659, 784].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = now + i * 0.1;
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  } else if (type === 'adopt') {
    [392, 494, 587, 784].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = now + i * 0.05;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.0);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + 1.0);
    });
  } else if (type === 'popup') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

/* ==================== 5. 积分与认养系统 ==================== */
const STORAGE_KEY_SCORE = 'gulin_score';
const STORAGE_KEY_SITES = 'gulin_sites';
const STORAGE_KEY_ADOPT = 'gulin_adopt';
const SCORE_MAX = 5;
const TOTAL_SITES = 5;

let score = Math.min(parseInt(localStorage.getItem(STORAGE_KEY_SCORE) || '0', 10), SCORE_MAX);
let visitedSites = JSON.parse(localStorage.getItem(STORAGE_KEY_SITES) || '[]');
let adopted = localStorage.getItem(STORAGE_KEY_ADOPT) === 'true';

function updateScoreDisplay(bump) {
  const display = document.getElementById('scoreDisplay');
  if (!display) return;
  display.textContent = score;
  if (bump) {
    display.classList.add('bump');
    setTimeout(() => display.classList.remove('bump'), 300);
  }
}

function updateMapPoints() {
  document.querySelectorAll('.map-point').forEach(point => {
    const name = point.dataset.name;
    if (visitedSites.includes(name)) {
      point.classList.add('active');
      const circle = point.querySelector('circle');
      if (circle) circle.setAttribute('fill', '#d4a843');
    }
  });
}

/* ==================== 6. 弹窗控制 ==================== */
const infoPopup = document.getElementById('infoPopup');
const overlay = document.getElementById('overlay');

function showPopup(title, text) {
  playSound('popup');
  document.getElementById('popupTitle').textContent = title;
  const popupText = document.getElementById('popupText');

  if (text.includes('｜')) {
    const parts = text.split('｜');
    popupText.innerHTML = `
      <p style="margin-bottom:12px;">${parts[0]}</p>
      <div class="popup-stats">
        ${parts.slice(1).map(p => `<span class="popup-stat">${p}</span>`).join('')}
      </div>
    `;
  } else {
    popupText.textContent = text;
  }

  infoPopup.classList.add('show');
  overlay.classList.add('show');
}

function closePopup() {
  infoPopup.classList.remove('show');
  overlay.classList.remove('show');
}

document.getElementById('popupClose').addEventListener('click', closePopup);
overlay.addEventListener('click', closePopup);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePopup(); });

/* ==================== 7. 卡片点击 → 跳转详情页 ==================== */
document.querySelectorAll('.modern-card[data-id], .food-card[data-id]').forEach(card => {
  card.addEventListener('click', function () {
    const id = this.dataset.id;
    if (id) {
      // 记录当前滚动位置
      sessionStorage.setItem('home_scroll', window.scrollY);
      // 标记"从详情页返回时跳过封面和加载"
      sessionStorage.setItem('skip_entry', 'true');
      // 记录音乐播放位置和状态
      const bgMusic = document.getElementById('bgMusic');
      if (bgMusic) {
        sessionStorage.setItem('music_time', bgMusic.currentTime);
        sessionStorage.setItem('music_playing', !bgMusic.paused);
      }
      window.location.href = __localLink('/detail?id=' + encodeURIComponent(id));
    }
  });
});

/* ==================== 8. 地图点击 ==================== */
document.querySelectorAll('.map-point').forEach(point => {
  point.addEventListener('click', function () {
    const name = this.dataset.name;
    const desc = this.dataset.desc;
    const pointScore = parseInt(this.dataset.score || '1', 10);

    if (visitedSites.includes(name)) {
      showPopup('✅ 已点亮 · ' + name, desc + '\n\n（该地标已点亮，不重复计分）');
      return;
    }

    showPopup(name, desc);
    playSound('tap');
    createRipple(this);

    if (score >= SCORE_MAX) {
      visitedSites.push(name);
      localStorage.setItem(STORAGE_KEY_SITES, JSON.stringify(visitedSites));
      updateMapPoints();
      return;
    }

    visitedSites.push(name);
    score = Math.min(score + pointScore, SCORE_MAX);
    localStorage.setItem(STORAGE_KEY_SCORE, score);
    localStorage.setItem(STORAGE_KEY_SITES, JSON.stringify(visitedSites));

    updateScoreDisplay(true);
    updateMapPoints();
    updateAdoptButton();
    playSound('score');
  });
});

function createRipple(el) {
  const svg = el.closest('svg');
  if (!svg) return;
  const rect = el.getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();
  const cx = rect.left + rect.width / 2 - svgRect.left;
  const cy = rect.top + rect.height / 2 - svgRect.top;

  const ripple = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ripple.setAttribute('cx', cx);
  ripple.setAttribute('cy', cy);
  ripple.setAttribute('r', 0);
  ripple.setAttribute('fill', 'none');
  ripple.setAttribute('stroke', '#d4a843');
  ripple.setAttribute('stroke-width', '3');
  ripple.setAttribute('opacity', '0.9');
  svg.appendChild(ripple);

  let r = 0;
  const anim = setInterval(() => {
    r += 4;
    ripple.setAttribute('r', r);
    ripple.setAttribute('opacity', 0.9 - r / 80);
    if (r > 80) {
      clearInterval(anim);
      ripple.remove();
    }
  }, 20);
}

/* ==================== 9. 云认养 ==================== */
const btnAdopt = document.getElementById('btnAdopt');
const adoptStatus = document.getElementById('adoptStatus');
const treeProgress = document.getElementById('treeProgress');
const treeProgressText = document.getElementById('treeProgressText');

function updateAdoptButton() {
  if (adopted) {
    btnAdopt.disabled = true;
    btnAdopt.textContent = '已认养 · 查看生长进度';
    adoptStatus.innerHTML = `
      <div class="adopt-icon">🍊</div>
      <div class="adopt-title">已认养</div>
      <div class="adopt-desc">你的甜橙树正在赤水河畔茁壮成长</div>
    `;
    treeProgress.style.width = '65%';
    treeProgressText.textContent = '生长中 · 预计2026年11月成熟';
  } else if (score >= SCORE_MAX) {
    btnAdopt.disabled = false;
    btnAdopt.textContent = '认养一棵甜橙树（消耗5积分）';
  } else {
    btnAdopt.disabled = true;
    btnAdopt.textContent = `积分不足（当前 ${score}/${SCORE_MAX}）`;
  }
}

btnAdopt.addEventListener('click', () => {
  if (adopted) return;
  if (score < SCORE_MAX) {
    alert('积分不足，请先点亮5个地标！');
    return;
  }

  score -= SCORE_MAX;
  adopted = true;
  localStorage.setItem(STORAGE_KEY_SCORE, score);
  localStorage.setItem(STORAGE_KEY_ADOPT, 'true');

  updateScoreDisplay(true);
  updateAdoptButton();
  playSound('adopt');

  setTimeout(() => {
    treeProgress.style.width = '65%';
    treeProgressText.textContent = '生长中 · 预计2026年11月成熟';
  }, 300);

  showPopup('🎉 认养成功', '你已成功认养一棵古蔺甜橙树！\n\n认养编号：GL-2026-0827\n预计收获：2026年11月\n收获权益：5斤古蔺甜橙 + 生长照片 + 认养证书');

  setTimeout(() => {
    closePopup();
    showCertificate();
  }, 2500);
});

function showCertificate() {
  const cert = document.createElement('div');
  cert.className = 'certificate-modal';
  cert.innerHTML = `
    <div class="certificate-inner">
      <div class="cert-header">
        <div class="cert-star">★</div>
        <div class="cert-title">古蔺甜橙认养证书</div>
      </div>
      <div class="cert-body">
        <div class="cert-row"><span>认养编号</span><strong>GL-2026-0827</strong></div>
        <div class="cert-row"><span>认养时间</span><strong>${new Date().toLocaleDateString('zh-CN')}</strong></div>
        <div class="cert-row"><span>果树位置</span><strong>赤水河畔 · 古蔺</strong></div>
        <div class="cert-row"><span>预计收获</span><strong>2026年11月</strong></div>
      </div>
      <div class="cert-foot">
        <div class="cert-seal">★</div>
        <div class="cert-sign">红韵云游 · 古蔺</div>
      </div>
    </div>
  `;
  document.body.appendChild(cert);
  setTimeout(() => cert.classList.add('show'), 50);
  cert.addEventListener('click', (e) => {
    if (e.target === cert) {
      cert.classList.remove('show');
      setTimeout(() => cert.remove(), 400);
    }
  });
}

/* ==================== 10. 生成海报 ==================== */
const btnGenerate = document.getElementById('btnGenerate');
btnGenerate.addEventListener('click', generatePoster);

function generatePoster() {
  if (!adopted && visitedSites.length < TOTAL_SITES) {
    alert(`请先点亮至少 ${TOTAL_SITES} 个地标！\n当前已点亮：${visitedSites.length} 个`);
    return;
  }

  document.getElementById('posterScore').textContent = visitedSites.length;
  document.getElementById('posterSites').textContent = visitedSites.length;
  document.getElementById('posterAdopt').textContent = adopted ? '是' : '否';

  const preview = document.getElementById('posterPreview');
  preview.classList.add('show');
  preview.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ==================== 11. 保存海报 ==================== */
const btnDownload = document.getElementById('btnDownload');
btnDownload.addEventListener('click', () => {
  const posterCard = document.getElementById('posterCard');
  if (typeof html2canvas === 'undefined') {
    alert('海报生成库未加载，请检查网络后重试');
    return;
  }
  btnDownload.textContent = '生成中...';
  btnDownload.disabled = true;

  html2canvas(posterCard, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
    logging: false
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = '重走长征路·我的古蔺红色记忆.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    btnDownload.textContent = '保存成功 ✓';
    setTimeout(() => {
      btnDownload.textContent = '保存海报';
      btnDownload.disabled = false;
    }, 2000);
  }).catch(err => {
    console.error(err);
    btnDownload.textContent = '保存海报';
    btnDownload.disabled = false;
    alert('生成失败，请重试');
  });
});

/* ==================== 12. 序章箭头 ==================== */
const scrollHintEl = document.getElementById('scrollHint');
if (scrollHintEl) {
  scrollHintEl.addEventListener('click', () => {
    document.getElementById('chapter-red').scrollIntoView({ behavior: 'smooth' });
  });
}

/* ==================== 13. 初始化 ==================== */
(function init() {
  updateScoreDisplay(false);
  updateMapPoints();
  updateAdoptButton();

  if (visitedSites.length >= TOTAL_SITES || adopted) {
    document.getElementById('posterScore').textContent = visitedSites.length;
    document.getElementById('posterSites').textContent = visitedSites.length;
    document.getElementById('posterAdopt').textContent = adopted ? '是' : '否';
  }
})();

/* ==================== 14. 数据可视化增强 ==================== */
(function initDataAnimations() {
  const dataSection = document.querySelector('.data-section');
  if (!dataSection) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateAll();
      }
    });
  }, { threshold: 0.25 });

  observer.observe(dataSection);

  function animateAll() {
    document.querySelectorAll('.stat-number').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 50));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = current + (current === target ? suffix : '');
      }, 30);
    });

    const bars = document.querySelectorAll('.bar-group .bar');
    const maxBarValue = Math.max(...Array.from(bars).map(b => parseFloat(b.dataset.value || 0)));
    bars.forEach((bar, i) => {
      const value = parseFloat(bar.dataset.value || 0);
      const heightPercent = (value / maxBarValue) * 100;
      setTimeout(() => {
        bar.style.height = heightPercent + '%';
      }, i * 140);
    });

    document.querySelectorAll('.pie-segment').forEach((seg, i) => {
      const dash = seg.dataset.dash;
      const offset = seg.dataset.offset;
      setTimeout(() => {
        seg.setAttribute('stroke-dasharray', dash + ' 251');
        seg.setAttribute('stroke-dashoffset', offset);
      }, i * 220);
    });

    document.querySelectorAll('.h-bar-fill').forEach((fill, i) => {
      const value = parseFloat(fill.dataset.value || 0);
      const max = parseFloat(fill.dataset.max || 10);
      const widthPercent = (value / max) * 100;
      setTimeout(() => {
        fill.style.width = widthPercent + '%';
      }, i * 130);
    });
  }
})();

/* ==================== 15. 图表 hover / touch 交互 ==================== */
(function initChartInteraction() {
  const tooltip = document.getElementById('chartTooltip');
  if (!tooltip) return;

  const tooltipLabel = tooltip.querySelector('.tooltip-label');
  const tooltipValue = tooltip.querySelector('.tooltip-value');

  function showTooltip(x, y, label, value) {
    tooltipLabel.textContent = label || '';
    tooltipValue.textContent = value || '';

    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
    tooltip.style.left = '0px';
    tooltip.style.top = '0px';
    tooltip.classList.add('show');

    const rect = tooltip.getBoundingClientRect();

    let left = x + 14;
    let top = y - rect.height - 14;

    if (left + rect.width > window.innerWidth - 10) {
      left = x - rect.width - 14;
    }
    if (left < 10) {
      left = 10;
    }
    if (top < 10) {
      top = y + 22;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.style.visibility = '';
    tooltip.style.opacity = '';
  }

  function hideTooltip() {
    tooltip.classList.remove('show');
  }

  function bindInteractive(el, getLabel, getValue) {
    el.addEventListener('mouseenter', (e) => {
      showTooltip(e.clientX, e.clientY, getLabel(), getValue());
    });
    el.addEventListener('mousemove', (e) => {
      showTooltip(e.clientX, e.clientY, getLabel(), getValue());
    });
    el.addEventListener('mouseleave', hideTooltip);

    el.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      showTooltip(t.clientX, t.clientY, getLabel(), getValue());
    }, { passive: true });
    el.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      showTooltip(t.clientX, t.clientY, getLabel(), getValue());
    }, { passive: true });
    el.addEventListener('touchend', () => {
      setTimeout(hideTooltip, 900);
    });
  }

  document.querySelectorAll('.bar-group .bar').forEach(el => {
    const year = el.querySelector('span')?.textContent || '';
    const value = el.dataset.value || '0';
    bindInteractive(el, () => year + ' 年', () => value + ' 万人次');
  });

  document.querySelectorAll('.pie-segment').forEach(el => {
    bindInteractive(el, () => el.dataset.label || '', () => el.dataset.value || '');
  });

  document.querySelectorAll('.h-bar-row').forEach(el => {
    bindInteractive(el, () => el.dataset.label || '', () => el.dataset.value || '');
  });

  document.querySelectorAll('.stat-highlight').forEach(el => {
    const numEl = el.querySelector('.stat-number');
    const labelEl = el.querySelector('.stat-label');
    bindInteractive(el,
      () => labelEl ? labelEl.textContent : '',
      () => numEl ? numEl.textContent : ''
    );
  });

  window.addEventListener('scroll', hideTooltip, { passive: true });

  document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.bar, .pie-segment, .h-bar-row, .stat-highlight')) {
      hideTooltip();
    }
  }, { passive: true });
})();


// /* ==================== 16. 留言板（纯前端演示 + localStorage） ==================== */
// (function initContactForm() {
//   const form = document.getElementById('contact-form');
//   if (!form) return;

//   const btnSubmit = document.getElementById('btnSubmit');
//   const formStatus = document.getElementById('formStatus');
//   const messageList = document.getElementById('messageList');
//   const messageCount = document.getElementById('messageCount');

//   const STORAGE_KEY = 'gulin_messages';

//   /* ---- 读取所有留言 ---- */
//   function loadMessages() {
//     try {
//       return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
//     } catch (e) {
//       return [];
//     }
//   }

//   /* ---- 保存留言 ---- */
//   function saveMessages(list) {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
//   }

//   /* ---- 渲染留言列表 ---- */
//   function renderMessages() {
//     const list = loadMessages();

//     if (list.length === 0) {
//       messageList.innerHTML = `
//         <div class="message-empty">
//           <div class="message-empty-icon">📭</div>
//           <div class="message-empty-text">还没有留言，来做第一个吧～</div>
//         </div>
//       `;
//       messageCount.textContent = '0 条';
//       return;
//     }

//     // 按时间倒序（最新在上）
//     const sorted = [...list].sort((a, b) => b.time - a.time);

//     messageList.innerHTML = sorted.map(msg => `
//       <div class="message-item">
//         <div class="message-avatar">${msg.name.charAt(0).toUpperCase()}</div>
//         <div class="message-content">
//           <div class="message-head">
//             <span class="message-name">${escapeHtml(msg.name)}</span>
//             <span class="message-time">${formatTime(msg.time)}</span>
//           </div>
//           <div class="message-text">${escapeHtml(msg.text)}</div>
//         </div>
//       </div>
//     `).join('');

//     messageCount.textContent = list.length + ' 条';
//   }

//   /* ---- 防 XSS ---- */
//   function escapeHtml(str) {
//     const div = document.createElement('div');
//     div.textContent = str;
//     return div.innerHTML;
//   }

//   /* ---- 时间格式化 ---- */
//   function formatTime(timestamp) {
//     const now = Date.now();
//     const diff = now - timestamp;
//     const minute = 60 * 1000;
//     const hour = 60 * minute;
//     const day = 24 * hour;

//     if (diff < minute) return '刚刚';
//     if (diff < hour) return Math.floor(diff / minute) + ' 分钟前';
//     if (diff < day) return Math.floor(diff / hour) + ' 小时前';
//     if (diff < 7 * day) return Math.floor(diff / day) + ' 天前';

//     const d = new Date(timestamp);
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
//   }

//   /* ---- 提交留言 ---- */
//   form.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const nameInput = form.querySelector('[name="name"]');
//     const messageInput = form.querySelector('[name="message"]');

//     const name = nameInput.value.trim() || '匿名访客';
//     const message = messageInput.value.trim();

//     if (!message) {
//       formStatus.textContent = '❌ 请填写留言内容';
//       formStatus.className = 'form-status error';
//       return;
//     }

//     btnSubmit.disabled = true;
//     btnSubmit.textContent = '发送中...';

//     setTimeout(() => {
//       // 保存留言
//       const list = loadMessages();
//       list.push({
//         name: name,
//         text: message,
//         time: Date.now()
//       });
//       saveMessages(list);

//       // 重新渲染
//       renderMessages();

//       // 状态提示
//       formStatus.textContent = `✅ 感谢 ${name} 的留言，已收到你的反馈！`;
//       formStatus.className = 'form-status success';
//       btnSubmit.textContent = '已发送 ✓';
//       form.reset();

//       setTimeout(() => {
//         btnSubmit.textContent = '发送留言';
//         btnSubmit.disabled = false;
//       }, 3000);
//     }, 600);
//   });

//   /* ---- 初始化 ---- */
//   renderMessages();
// })();

/* ==================== 16. Waline 评论系统初始化 ==================== */
(function initWaline() {
  if (!document.getElementById('waline')) return;

  const script = document.createElement('script');
  script.type = 'module';
  script.textContent = `
    import { init } from 'https://registry.npmmirror.com/@waline/client/v3/files/dist/waline.js';
    init({
      el: '#waline',
      serverURL: 'https://app-production-b050.up.railway.app',
      lang: 'zh-CN',
      path: '/',              // ← 加这一行，把所有页面的评论都归到一个路径下
      turnstileKey: '0x4AAAAAAFVQk0eqrO1L9-WI',   // ← 加这一行
      locale: {
        placeholder: '写下你的留言...',
      },
      dark: 'html[data-theme="dark"]',
      requiredMeta: ['nick'],
      login: 'enable',
    });
  `;
  document.body.appendChild(script);
})();

/* ==================== 17. 标签云点击 → 跳转详情页 ==================== */
document.querySelectorAll('.cloud-tag[data-id]').forEach(tag => {
  tag.addEventListener('click', function () {
    const id = this.dataset.id;
    if (id) {
      sessionStorage.setItem('home_scroll', window.scrollY);
      sessionStorage.setItem('skip_entry', 'true');
      const bgMusic = document.getElementById('bgMusic');
      if (bgMusic) {
        sessionStorage.setItem('music_time', bgMusic.currentTime);
        sessionStorage.setItem('music_playing', !bgMusic.paused);
      }
      window.location.href = __localLink('/detail?id=' + encodeURIComponent(id));
    }
  });
});

/* ==================== 18. 3D 展厅入口 · 记录返回位置 ==================== */
(function init3DEntry() {
  const btnEnter = document.getElementById('btnEnter3D');
  if (!btnEnter) return;

  btnEnter.addEventListener('click', function () {
    // 记录当前滚动位置
    sessionStorage.setItem('home_scroll', window.scrollY);
    // 标记"返回时跳过封面和加载动画"
    sessionStorage.setItem('skip_entry', 'true');
    // 记录音乐播放位置，让展厅里也能续播
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
      sessionStorage.setItem('music_time', bgMusic.currentTime);
      sessionStorage.setItem('music_playing', !bgMusic.paused);
    }
    // 不阻止默认跳转，继续走 href
  });
})();

/* ==================== 19. 云游全景入口 · 记录返回位置 ==================== */
(function initTourEntry() {
  const btnEnter = document.getElementById('btnEnterTour');
  if (!btnEnter) return;

  btnEnter.addEventListener('click', function () {
    // 记录当前滚动位置，返回首页时直接落回本板块（跳过封面和加载动画）
    sessionStorage.setItem('home_scroll', window.scrollY);
    sessionStorage.setItem('skip_entry', 'true');
    // 记录音乐播放位置，让全景页返回后续播
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
      sessionStorage.setItem('music_time', bgMusic.currentTime);
      sessionStorage.setItem('music_playing', !bgMusic.paused);
    }
    // 不阻止默认跳转，继续走 href
  });
})();

/* ==================== 17. 长征时间线（拖动浏览 + 节点详情弹窗） ==================== */
(function initCMTimeline() {
  const box = document.getElementById('cmTimeline');
  if (!box) return;
  const progress = document.getElementById('cmProgress');
  const modal = document.getElementById('cmModal');

  /* 滚动进度线（红星随进度前进） */
  function updateProgress() {
    const max = box.scrollWidth - box.clientWidth;
    progress.style.width = (max > 0 ? (box.scrollLeft / max) * 100 : 100) + '%';
  }
  box.addEventListener('scroll', updateProgress);
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* 鼠标拖拽滚动（触屏走原生滑动） */
  let down = false, startX = 0, startLeft = 0, moved = false;
  box.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false;
    startX = e.clientX; startLeft = box.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) moved = true;
    box.scrollLeft = startLeft - dx;
  });
  window.addEventListener('pointerup', () => { down = false; });

  /* 节点点击 → 详情弹窗（拖拽后不触发） */
  const mDate = document.getElementById('cmModalDate');
  const mTitle = document.getElementById('cmModalTitle');
  const mText = document.getElementById('cmModalText');
  box.querySelectorAll('.cm-node').forEach((node) => {
    node.addEventListener('click', () => {
      if (moved) return;
      mDate.textContent = node.querySelector('.cm-node-date').textContent;
      mTitle.textContent = node.querySelector('.cm-node-title').textContent;
      mText.textContent = node.dataset.full || '';
      modal.classList.add('show');
    });
  });

  /* 关闭弹窗：× 按钮 / 点背景 / ESC */
  function closeModal() { modal.classList.remove('show'); }
  document.getElementById('cmModalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
})();

/* ==================== 18. 长征知识闯关（答题赢积分） ==================== */
(function initQuiz() {
  const entry = document.querySelector('.quiz-entry');
  const modal = document.getElementById('quizModal');
  if (!entry || !modal) return;

  const STORAGE_KEY_BEST = 'gulin_quiz_best';
  const OPTION_TAGS = ['A', 'B', 'C', 'D'];

  const QUESTIONS = [
    {
      q: '1935年1月，红军一渡赤水后，进入了哪个地区？',
      options: ['川南古蔺、叙永地区', '黔北遵义地区', '云南扎西地区', '川西懋功地区'],
      answer: 0,
      explain: '1月29日，红军从土城、元厚场西渡赤水河，进入川南古蔺、叙永地区。'
    },
    {
      q: '「门板浮桥」的佳话发生在哪个渡口？',
      options: ['土城渡口', '太平渡', '茅台渡口', '九溪口'],
      answer: 1,
      explain: '二渡赤水时，太平渡乡亲拆下自家门板、献出木船，帮红军架起浮桥。'
    },
    {
      q: '二郎滩背水一战，红军以不足一个团的兵力击溃了敌军几个团？',
      options: ['一个团', '三个团', '两个团', '五个团'],
      answer: 2,
      explain: '二郎滩背水战以少胜多，击溃敌军两个团，随后开仓分盐，留下「红军盐」的美谈。'
    },
    {
      q: '红军总司令部在古蔺哪个镇驻扎了7天？',
      options: ['太平镇', '二郎镇', '茅溪镇', '双沙镇'],
      answer: 3,
      explain: '总司令部驻扎双沙镇7天，留下大量标语与文献。'
    },
    {
      q: '红军三渡赤水的渡口是哪里？',
      options: ['太平渡', '茅台镇', '二郎滩', '土城'],
      answer: 1,
      explain: '3月16日，红军从茅台镇三渡赤水，三进古蔺，佯装北渡长江诱敌。'
    },
    {
      q: '四渡赤水后，红军南渡哪条江、威逼贵阳，跳出了包围圈？',
      options: ['金沙江', '大渡河', '赤水河', '乌江'],
      answer: 3,
      explain: '四渡赤水后红军南渡乌江、威逼贵阳，彻底跳出数十万敌军的围追堵截。'
    }
  ];

  const elBest = document.getElementById('quizBest');
  const elPlay = document.getElementById('quizPlay');
  const elResult = document.getElementById('quizResult');
  const elProgress = document.getElementById('quizProgress');
  const elScoreLive = document.getElementById('quizScoreLive');
  const elQuestion = document.getElementById('quizQuestion');
  const elOptions = document.getElementById('quizOptions');
  const elFeedback = document.getElementById('quizFeedback');
  const elResultScore = document.getElementById('quizResultScore');
  const elResultTitle = document.getElementById('quizResultTitle');
  const elResultText = document.getElementById('quizResultText');

  let current = 0;
  let correctCount = 0;
  let answered = false;
  let advanceTimer = null;

  /* 入口卡片最佳成绩展示 */
  function renderBest() {
    const best = localStorage.getItem(STORAGE_KEY_BEST);
    elBest.textContent = best === null
      ? '最佳成绩：尚未挑战'
      : `最佳成绩：答对 ${best} / ${QUESTIONS.length} 题`;
  }
  renderBest();

  function openQuiz() {
    playSound('popup');
    current = 0;
    correctCount = 0;
    elResult.style.display = 'none';
    elPlay.style.display = '';
    renderQuestion();
    modal.classList.add('show');
  }

  function closeQuiz() {
    modal.classList.remove('show');
    if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
    renderBest();
  }

  function renderQuestion() {
    answered = false;
    const item = QUESTIONS[current];
    elProgress.textContent = `第 ${current + 1} / ${QUESTIONS.length} 题`;
    elScoreLive.textContent = `本轮答对 ${correctCount} 题`;
    elQuestion.textContent = item.q;
    elFeedback.textContent = '';
    elFeedback.className = 'quiz-feedback';
    elOptions.innerHTML = '';

    item.options.forEach((text, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt';
      btn.dataset.tag = OPTION_TAGS[idx];
      btn.textContent = text;
      btn.addEventListener('click', () => answer(idx, btn));
      elOptions.appendChild(btn);
    });
  }

  function answer(idx, btn) {
    if (answered) return;
    answered = true;

    const item = QUESTIONS[current];
    const optionBtns = elOptions.querySelectorAll('.quiz-opt');
    optionBtns.forEach(b => { b.disabled = true; });

    if (idx === item.answer) {
      btn.classList.add('correct');
      correctCount++;
      elFeedback.textContent = '回答正确！' + item.explain;
      elFeedback.classList.add('good');
      /* 接入现有积分系统（上限 SCORE_MAX） */
      if (score < SCORE_MAX) {
        score++;
        localStorage.setItem(STORAGE_KEY_SCORE, String(score));
        updateScoreDisplay(true);
      }
      playSound('score');
    } else {
      btn.classList.add('wrong');
      optionBtns[item.answer].classList.add('correct');
      elFeedback.textContent = '答错了。' + item.explain;
      elFeedback.classList.add('bad');
      playSound('tap');
    }
    elScoreLive.textContent = `本轮答对 ${correctCount} 题`;

    advanceTimer = setTimeout(() => {
      advanceTimer = null;
      current++;
      if (current < QUESTIONS.length) {
        renderQuestion();
      } else {
        showResult();
      }
    }, 2200);
  }

  function showResult() {
    elPlay.style.display = 'none';
    elResult.style.display = '';

    /* 保存最佳成绩 */
    const prevBest = parseInt(localStorage.getItem(STORAGE_KEY_BEST) || '-1', 10);
    if (correctCount > prevBest) {
      localStorage.setItem(STORAGE_KEY_BEST, String(correctCount));
    }

    elResultScore.textContent = `答对 ${correctCount} / ${QUESTIONS.length} 题`;

    let title, text;
    if (correctCount === QUESTIONS.length) {
      title = '长征知识达人';
      text = '满分通关！四渡赤水的每一段史实你都了然于胸，红色基因已深植心中。';
      playSound('adopt');
    } else if (correctCount >= 4) {
      title = '红色传人';
      text = '很棒！大部分史实都已掌握，再回看一遍时间线，满分就在眼前。';
      playSound('score');
    } else {
      title = '继续加油';
      text = '别灰心，回到上方的时间线再走一遍长征路，答案都藏在史实节点里。';
      playSound('popup');
    }
    elResultTitle.textContent = title;
    elResultText.textContent = text;
  }

  /* 事件绑定 */
  document.getElementById('quizStart').addEventListener('click', openQuiz);
  document.getElementById('quizRetry').addEventListener('click', openQuiz);
  document.getElementById('quizDone').addEventListener('click', closeQuiz);
  document.getElementById('quizClose').addEventListener('click', closeQuiz);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeQuiz(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeQuiz(); });
})();

/* ==================== 19. 每日长征语录 / 历史上的今天 ==================== */
(function initDailyQuote() {
  const box = document.getElementById('dailyQuote');
  if (!box) return;
  const elBadge = document.getElementById('dqBadge');
  const elText = document.getElementById('dqText');
  const elSource = document.getElementById('dqSource');
  const elRefresh = document.getElementById('dqRefresh');

  const QUOTES = [
    { text: '红军不怕远征难，万水千山只等闲。', source: '毛泽东《七律 · 长征》' },
    { text: '雄关漫道真如铁，而今迈步从头越。', source: '毛泽东《忆秦娥 · 娄山关》' },
    { text: '从头越，苍山如海，残阳如血。', source: '毛泽东《忆秦娥 · 娄山关》' },
    { text: '金沙水拍云崖暖，大渡桥横铁索寒。', source: '毛泽东《七律 · 长征》' },
    { text: '更喜岷山千里雪，三军过后尽开颜。', source: '毛泽东《七律 · 长征》' },
    { text: '长征是宣言书，长征是宣传队，长征是播种机。', source: '毛泽东' },
    { text: '四渡赤水出奇兵，毛主席用兵真如神。', source: '《长征组歌》' },
    { text: '战士双脚走天下，四渡赤水出奇兵。', source: '《长征组歌》' },
    { text: '乌江天险重飞渡，兵临贵阳逼昆明。', source: '《长征组歌》' },
    { text: '横断山，路难行。敌重兵，压黔境。', source: '《长征组歌》' },
    { text: '敌人弃甲丢烟枪，我军乘胜赶路程。', source: '《长征组歌》' },
    { text: '调虎离山袭金沙，毛主席用兵真如神。', source: '《长征组歌》' },
    { text: '长征是以我们胜利、敌人失败的结果而告结束。', source: '毛泽东' },
    { text: '我们开动了每人的两只脚，长驱二万余里，纵横十一个省。', source: '毛泽东' },
    { text: '苦不苦，想想长征两万五；累不累，想想革命老前辈。', source: '民间谚语' }
  ];

  /* 历史上的今天（键：月-日） */
  const EVENTS = {
    '1-15': { text: '1935年1月15日至17日，遵义会议召开，在危急关头挽救了党、挽救了红军、挽救了中国革命。', source: '长征史实 · 遵义会议' },
    '1-19': { text: '1935年1月19日，遵义会议后，红军兵分三路挥师北进，向土城、赤水方向挺进。', source: '长征史实 · 四渡赤水' },
    '1-29': { text: '1935年1月29日，红军从土城、元厚场一渡赤水河，进入川南古蔺、叙永地区。', source: '长征史实 · 一渡赤水' },
    '2-18': { text: '1935年2月18日起，红军从太平渡、九溪口、二郎滩二渡赤水，重入贵州。太平渡乡亲拆门板、献木船，帮红军架起浮桥。', source: '长征史实 · 二渡赤水' },
    '2-28': { text: '1935年2月28日，红军再占遵义，取得长征以来最大胜利。毛泽东写下「雄关漫道真如铁，而今迈步从头越」。', source: '长征史实 · 娄山关大捷' },
    '3-16': { text: '1935年3月16日至17日，红军从茅台镇三渡赤水，三进古蔺，佯装北渡长江诱敌。', source: '长征史实 · 三渡赤水' },
    '3-21': { text: '1935年3月21日至22日，红军从太平渡、九溪口、二郎滩四渡赤水，随后南渡乌江、威逼贵阳，跳出数十万敌军的围追堵截。', source: '长征史实 · 四渡赤水' },
    '10-17': { text: '1934年10月17日，中央红军从江西于都出发，踏上漫漫长征路。', source: '长征史实 · 长征出发' },
    '10-22': { text: '1936年10月22日，红军三大主力胜利会师，伟大的长征宣告结束。', source: '长征史实 · 胜利会师' }
  };

  /* 今日语录索引：按一年中的第几天轮换 */
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - startOfYear) / 86400000);
  let quoteIndex = dayOfYear % QUOTES.length;

  function renderQuote(animate) {
    const item = QUOTES[quoteIndex];
    elBadge.textContent = '每日长征语录';
    elBadge.classList.remove('history');
    elText.textContent = '「' + item.text + '」';
    elSource.textContent = '—— ' + item.source;
    if (animate) {
      box.classList.remove('dq-swap');
      void box.offsetWidth;
      box.classList.add('dq-swap');
    }
  }

  /* 优先展示「历史上的今天」 */
  const todayKey = (now.getMonth() + 1) + '-' + now.getDate();
  const todayEvent = EVENTS[todayKey];
  if (todayEvent) {
    elBadge.textContent = '历史上的今天';
    elBadge.classList.add('history');
    elText.textContent = todayEvent.text;
    elSource.textContent = '—— ' + todayEvent.source;
  } else {
    renderQuote(false);
  }

  /* 换一句：切换到语录轮换模式 */
  elRefresh.addEventListener('click', () => {
    playSound('tap');
    quoteIndex = (quoteIndex + 1) % QUOTES.length;
    renderQuote(true);
  });
})();