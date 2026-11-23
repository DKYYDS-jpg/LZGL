/* ============================================================
 * 听见古蔺 · 方言小考
 * 五段真人四川话，听音辨人
 * ============================================================ */
(function () {
  var root = document.getElementById('listenGame');
  if (!root) return;

  var audio = document.getElementById('lgAudio');
  var startPanel = document.getElementById('lgStartPanel');
  var playPanel = document.getElementById('lgPlayPanel');
  var endPanel = document.getElementById('lgEndPanel');
  var startBtn = document.getElementById('lgStartBtn');
  var againGameBtn = document.getElementById('lgAgainGame');
  var playBtn = document.getElementById('lgPlayBtn');
  var againBtn = document.getElementById('lgAgainBtn');
  var nextBtn = document.getElementById('lgNextBtn');
  var progressEl = document.getElementById('lgProgress');
  var dotsEl = document.getElementById('lgDots');
  var optionsEl = document.getElementById('lgOptions');
  var feedbackEl = document.getElementById('lgFeedback');
  var scoreEl = document.getElementById('lgScore');
  var barEl = document.getElementById('lgBar');
  var endScoreEl = document.getElementById('lgEndScore');
  var endTitleEl = document.getElementById('lgEndTitle');
  var endTextEl = document.getElementById('lgEndText');
  var smAudio = document.getElementById('smAudio');
  if (!audio || !optionsEl) return;

  var DATA = [
    { role: '船工的后人', place: '太平渡', src: 'audio/voices/p1.mp3',
      desc: '爷爷那辈人给红军摆渡，乡亲们拆下门板、楼板架起浮桥，从夜里撑到天亮。' },
    { role: '苗绣绣娘', place: '箭竹', src: 'audio/voices/p2.mp3',
      desc: '外婆一针一线传下来的绣样，蝴蝶、江河、迁徙的路都绣在衣襟上。' },
    { role: '甜橙果农', place: '马蹄', src: 'audio/voices/p3.mp3',
      desc: '赤水河谷日照足，甜橙皮薄多汁，如今坐上冷链车第二天就进城。' },
    { role: '赶黄草药农', place: '桂花', src: 'audio/voices/p4.mp3',
      desc: '山里长出来的赶黄草，过去只熬水喝，现在做成茶和饮料，一亩地多挣好几千。' },
    { role: '古镇讲解员', place: '二郎滩', src: 'audio/voices/p5.mp3',
      desc: '每天给游客讲当年红军怎样在夜里渡河，讲到动情处，只剩河水的声音。' }
  ];

  var order = [];
  var qi = 0;
  var score = 0;
  var answered = false;
  var curOptions = [];
  var finished = false;
  var history = [];

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function stopAudio() {
    try { audio.pause(); } catch (e) {}
    playBtn.textContent = '▶';
    playBtn.setAttribute('aria-label', '播放这段方言');
  }

  function setScore() {
    scoreEl.textContent = '★ ' + score + ' / 5';
  }

  function buildDots() {
    var html = '';
    for (var i = 0; i < 5; i++) html += '<i></i>';
    dotsEl.innerHTML = html;
  }

  function paintDots() {
    var list = dotsEl.querySelectorAll('i');
    for (var i = 0; i < list.length; i++) {
      list[i].className = '';
      if (i < qi || (i === qi && answered)) {
        list[i].className = history[i] === true ? 'is-ok' : 'is-bad';
      } else if (i === qi && !finished) {
        list[i].className = 'is-now';
      }
    }
  }

  function renderQuestion() {
    answered = false;
    finished = false;
    feedbackEl.hidden = true;
    nextBtn.hidden = true;
    barEl.style.width = '0%';
    playBtn.textContent = '▶';

    var di = order[qi];
    var d = DATA[di];
    progressEl.textContent = '第 ' + (qi + 1) + ' 题 · 共 5 题';

    /* 选项：正确答案 + 3 个干扰 */
    var others = [];
    for (var i = 0; i < DATA.length; i++) if (i !== di) others.push(i);
    shuffle(others);
    curOptions = shuffle([di, others[0], others[1], others[2]]);

    var html = '';
    for (var k = 0; k < curOptions.length; k++) {
      var oi = curOptions[k];
      html += '<button type="button" class="lg-option" data-i="' + oi + '">' +
        DATA[oi].role + '<span class="lg-option-place">' + DATA[oi].place + '</span></button>';
    }
    optionsEl.innerHTML = html;
    var btns = optionsEl.querySelectorAll('.lg-option');
    for (var b = 0; b < btns.length; b++) {
      btns[b].addEventListener('click', onChoose);
    }

    paintDots();
    audio.src = d.src;
    audio.currentTime = 0;
    audio.play().then(function () {
      playBtn.textContent = '⏸';
    }).catch(function () {
      playBtn.textContent = '▶';
    });
  }

  function onChoose(e) {
    if (answered) return;
    answered = true;
    stopAudio();

    var picked = parseInt(e.currentTarget.getAttribute('data-i'), 10);
    var di = order[qi];
    var correct = picked === di;
    var btns = optionsEl.querySelectorAll('.lg-option');
    for (var i = 0; i < btns.length; i++) {
      var oi = parseInt(btns[i].getAttribute('data-i'), 10);
      btns[i].disabled = true;
      if (oi === di) btns[i].classList.add('is-correct');
      else if (oi === picked) btns[i].classList.add('is-wrong');
    }

    if (correct) {
      score++;
      setScore();
    }
    history[qi] = correct;

    var d = DATA[di];
    feedbackEl.innerHTML =
      '<div class="lg-fb-top">' +
      '<span class="lg-fb-name">' + (correct ? '听对了 · ' : '不是他 · ') + d.role + '</span>' +
      '<span class="lg-fb-place">' + d.place + '</span>' +
      '</div>' +
      '<p class="lg-fb-desc">' + d.desc + '</p>';
    feedbackEl.hidden = false;
    nextBtn.textContent = qi >= 4 ? '看结果' : '下一题';
    nextBtn.hidden = false;
    paintDots();
  }

  function next() {
    if (qi >= 4) { finish(); return; }
    qi++;
    renderQuestion();
  }

  function finish() {
    finished = true;
    stopAudio();
    playPanel.hidden = true;
    endPanel.hidden = false;
    endScoreEl.textContent = score + ' / 5';
    var title, text;
    if (score === 5) { title = '古蔺通'; text = '五段方言全听对了，古蔺话难不倒你。'; }
    else if (score === 4) { title = '半个古蔺人'; text = '只差一句就全听懂了。'; }
    else if (score === 3) { title = '听出点门道'; text = '四川话的调子拐得急，再听一轮就熟络了。'; }
    else { title = '方言还得再练'; text = '把语速放慢一点，听关键词，再来一次。'; }
    endTitleEl.textContent = title;
    endTextEl.textContent = text;
  }

  function startGame() {
    stopAudio();
    order = shuffle([0, 1, 2, 3, 4]);
    qi = 0;
    score = 0;
    history = [];
    setScore();
    buildDots();
    startPanel.hidden = true;
    endPanel.hidden = true;
    playPanel.hidden = false;
    renderQuestion();
  }

  /* 播放 / 暂停 */
  playBtn.addEventListener('click', function () {
    if (audio.paused) {
      if (smAudio && !smAudio.paused) smAudio.pause();
      audio.play().then(function () { playBtn.textContent = '⏸'; })
        .catch(function () { playBtn.textContent = '▶'; });
    } else {
      stopAudio();
    }
  });

  againBtn.addEventListener('click', function () {
    audio.currentTime = 0;
    if (smAudio && !smAudio.paused) smAudio.pause();
    audio.play().then(function () { playBtn.textContent = '⏸'; })
      .catch(function () { playBtn.textContent = '▶'; });
  });

  audio.addEventListener('play', function () {
    playBtn.textContent = '⏸';
    playBtn.setAttribute('aria-label', '暂停');
  });
  audio.addEventListener('pause', function () {
    playBtn.textContent = '▶';
    playBtn.setAttribute('aria-label', '播放这段方言');
  });
  audio.addEventListener('timeupdate', function () {
    var d = audio.duration;
    if (!d || !isFinite(d)) return;
    barEl.style.width = Math.min(100, (audio.currentTime / d) * 100) + '%';
  });
  audio.addEventListener('ended', function () {
    barEl.style.width = '100%';
    playBtn.textContent = '▶';
  });

  /* 与声音地图互斥：地图开始播放时停掉小考 */
  if (smAudio) {
    smAudio.addEventListener('play', function () {
      if (!audio.paused) stopAudio();
    });
  }

  /* 离开可视区 / 切后台暂停 */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAudio();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) stopAudio(); });
    }, { threshold: 0.15 }).observe(root);
  }

  startBtn.addEventListener('click', startGame);
  againGameBtn.addEventListener('click', startGame);
  nextBtn.addEventListener('click', next);

  setScore();
})();
