/**
 * OpenList Moe {{MOE_VERSION_TAG}}
 * Repository: https://github.com/SajunaOo/OpenList-Moe
 * Author: 朱茱 (https://www.isajuna.com)
 * (C) 2025 朱茱 - AGPL-3.0 Licensed
 *
 * Beautification component crafted for:
 * OpenList {{OP_VERSION}} - (C) OpenListTeam - AGPL-3.0 Licensed
 */

/**
 * Transforms OpenList with modern glassmorphism design using semi-transparent layers and backdrop blur.
 * Features comprehensive light/dark mode variables and refined component styling.
 * Maintains optimal readability and usability through clean, minimal aesthetics.
 */

// ============================================================
//  全局配置
// ============================================================
const config = window.MOE_CONFIG || {};

/** 全屏背景图加载完成淡入 */
function OpenList_Loaded() {
  document.body.classList.add('loaded');
}

window.addEventListener('load', OpenList_Loaded);

/** 主题色设置 */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

document.documentElement.style.setProperty(
  '--moe-color-theme',
  hexToRgb(window.OPENLIST_CONFIG?.main_color)
);

// ============================================================
//  毛玻璃模块
// ============================================================
(function () {
  // ---------- 配置 ----------
  const BLUR_PX = config.glass?.blur ?? 3;
  const ADMIN_PATH = config.adminPath || "/@manage";
  const CONTAINER_SELECTOR = config.glass?.container || ".obj-box";
  const URL_POLL_INTERVAL_MS = config.glass?.urlPollInterval ?? 1500;
  const RETRY_INTERVAL_MS = config.glass?.retryInterval ?? 100;
  const RETRY_TIMEOUT_MS = config.glass?.retryTimeoutMs ?? 3000;
  const MAX_RETRY_ATTEMPTS = Math.ceil(RETRY_TIMEOUT_MS / RETRY_INTERVAL_MS);

  let children = config.glass?.children;
  if (typeof children === "string") {
    children = children
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (!Array.isArray(children) || children.length === 0) {
    children = [".hope-c-PJLV-iiRelTQ-css", ".hope-c-PJLV-ibZqGFV-css"];
  }
  const CHILD_SELECTORS = children;

  // ---------- 状态 ----------
  let container = null;
  let observer = null;
  let isActive = false;
  let isGlassOn = false;
  let isUpdatePending = false;
  let retryCount = 0;
  let lastUrl = window.location.href;
  let urlPollId = null;
  let retryTimeoutId = null;
  let initTimeoutId = null;

  // ---------- 路径检测 ----------
  function isFrontPage() {
    return !window.location.pathname.startsWith(ADMIN_PATH);
  }

  // ---------- 玻璃控制 ----------
  function setGlass(enable) {
    if (!isActive || !container || enable === isGlassOn) return;
    container.style.backdropFilter = enable ? `blur(${BLUR_PX}px)` : "none";
    isGlassOn = enable;
  }

  function hasDirectChild(parent) {
    if (!parent) return false;
    const combinedSelector = CHILD_SELECTORS.map((s) => `:scope > ${s}`).join(", ");
    return parent.querySelector(combinedSelector) !== null;
  }

  // ---------- 核心更新 ----------
  function updateGlass() {
    if (!isActive) return;
    if (!container || !document.body.contains(container)) {
      container = document.querySelector(CONTAINER_SELECTOR);
      if (!container) {
        setGlass(false);
        return;
      }
      if (observer) observer.disconnect();
      observer = new MutationObserver(() => {
        if (!isUpdatePending) {
          isUpdatePending = true;
          requestAnimationFrame(() => {
            isUpdatePending = false;
            updateGlass();
          });
        }
      });
      observer.observe(container, { childList: true, subtree: false });
    }
    setGlass(!hasDirectChild(container));
  }

  // ---------- 初始化 ----------
  function init() {
    if (isActive) return;
    container = document.querySelector(CONTAINER_SELECTOR);
    if (!container) {
      if (retryCount >= MAX_RETRY_ATTEMPTS) return;
      retryCount++;
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      retryTimeoutId = setTimeout(init, RETRY_INTERVAL_MS);
      return;
    }
    retryCount = 0;
    isActive = true;
    observer = new MutationObserver(() => {
      if (!isUpdatePending) {
        isUpdatePending = true;
        requestAnimationFrame(() => {
          isUpdatePending = false;
          updateGlass();
        });
      }
    });
    observer.observe(container, { childList: true, subtree: false });
    updateGlass();
    if (initTimeoutId) clearTimeout(initTimeoutId);
    initTimeoutId = setTimeout(updateGlass, 50);
  }

  // ---------- 销毁 ----------
  function destroy() {
    isActive = false;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (urlPollId) {
      clearInterval(urlPollId);
      urlPollId = null;
    }
    if (retryTimeoutId) {
      clearTimeout(retryTimeoutId);
      retryTimeoutId = null;
    }
    if (initTimeoutId) {
      clearTimeout(initTimeoutId);
      initTimeoutId = null;
    }
    isGlassOn = false;
    container = null;
    retryCount = 0;
    isUpdatePending = false;
  }

  // ---------- URL 变化处理 ----------
  function onUrlChange() {
    const current = window.location.href;
    if (current === lastUrl) return;
    lastUrl = current;
    if (!isFrontPage()) {
      if (isActive) destroy();
    } else {
      if (!isActive) init();
    }
  }

  // ---------- 启动 ----------
  function start() {
    lastUrl = window.location.href;
    if (isFrontPage()) {
      init();
    } else {
      destroy();
    }
    if (urlPollId) clearInterval(urlPollId);
    urlPollId = setInterval(onUrlChange, URL_POLL_INTERVAL_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

/** 控制台输出 */
console.log(
  '\n %c OpenList Moe %c {{MOE_VERSION}} ',
  'padding: 5px 0; border-radius: 3px 0 0 3px; color: #fff; background: #FF6699; font-weight: bold;',
  'padding: 5px 0; border-radius: 0 3px 3px 0; color: #fff; background: #FF9999; font-weight: bold;'
);

console.log(
  '\n %c 适用于 OpenList {{OP_VERSION}} ',
  'padding: 5px 0; border-radius: 3px; color: #fff; background: linear-gradient(90deg, #134E4A 0%, #0D9488 50%, #14B8A6 100%); font-weight: bold;'
);

console.log(
  '\n %c Beautified by 朱茱 %c www.isajuna.com ',
  'padding: 5px 0; border-radius: 3px 0 0 3px; color: #777777; background: linear-gradient(to right,#ebf2ed,#e5ebee,#f0e5c7,#f8eef0); font-weight: bold;',
  'padding: 5px 0; border-radius: 0 3px 3px 0; color: #fff; background: #f8f8f8; font-weight: bold;'
);

console.log(
  '\n %c %c SajunaOo/OpenList-Moe ',
  `padding:5px 10px; border-radius:3px 0 0 3px; background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16' fill='%2324292E'%3E%3Cpath d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z'/%3E%3C/svg%3E") center no-repeat; background-size:16px 16px; background-color:#fff;`,
  'padding:5px 0; border-radius:0 3px 3px 0; color:#fff; background:#24292E; font-weight:bold;'
);
