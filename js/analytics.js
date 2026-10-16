/* ============================================================
 * 访问统计（51LA 免费统计）
 * 使用方法：
 *   1. 打开 https://v6.51.la/ 注册账号，创建应用（域名填 lzgl-38yl31m.maozi.io）
 *   2. 在「应用管理 → 代码安装」里找到官方安装代码，形如：
 *        LA.init({id: "你的ID", ck: "你的CK"})
 *   3. 把这两个值填入下方，重新部署即可
 * 留空时本脚本自动跳过，不会产生任何请求或报错；本地预览不参与统计。
 * ============================================================ */
(function () {
  var LA_ID = '3RWgn5XyBawXIVh8'; // ← 填 LA.init 里的 id
  var LA_CK = '3RWgn5XyBawXIVh8'; // ← 填 LA.init 里的 ck

  if (!LA_ID) return;
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;

  var s = document.createElement('script');
  s.id = 'LA_COLLECT';
  s.charset = 'UTF-8';
  s.src = 'https://sdk.51.la/js-sdk-pro.min.js';
  s.defer = true;
  s.onload = function () {
    try { if (window.LA) window.LA.init({ id: LA_ID, ck: LA_CK }); } catch (e) {}
  };
  s.onerror = function () { /* 统计加载失败不影响网站 */ };
  document.head.appendChild(s);
})();
