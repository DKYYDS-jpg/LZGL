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
      window.location.href = '/detail?id=' + encodeURIComponent(id);
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
      window.location.href = '/detail?id=' + encodeURIComponent(id);
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