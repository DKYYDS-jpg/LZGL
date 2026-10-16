/* ==========================================================
 * 本地预览链接兼容
 * 线上平台（maozi.io）使用无后缀链接（/exhibit、/detail?id=…），
 * 平台会自动把 .html 308 跳转到无后缀地址；
 * 但本地预览（file:// 双击打开、python http.server、Live Server）
 * 无法识别无后缀链接，点击会 404 空白。
 * 本脚本仅在本地环境生效：把根绝对链接重写到对应的 .html 文件，
 * 线上环境不做任何改动。
 * ========================================================== */
(function () {
  var isLocal = location.protocol === 'file:'
    || location.hostname === 'localhost'
    || location.hostname === '127.0.0.1';

  /* 供 JS 跳转使用：window.location.href = __localLink('/detail?id=xx') */
  window.__localLink = function (url) {
    if (!isLocal) return url;
    if (url === '/') return 'index.html';
    var m = url.match(/^\/(exhibit|detail|index)([?#].*)?$/);
    if (m) return m[1] + '.html' + (m[2] || '');
    return url;
  };

  if (!isLocal) return;

  /* 修正页面中静态的 <a href="/..."> */
  function rewriteAnchors() {
    document.querySelectorAll('a[href^="/"]').forEach(function (a) {
      var fixed = window.__localLink(a.getAttribute('href'));
      if (fixed !== a.getAttribute('href')) a.setAttribute('href', fixed);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rewriteAnchors);
  } else {
    rewriteAnchors();
  }
})();
