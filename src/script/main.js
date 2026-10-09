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
const ADMIN_PATH = config.adminPath || "/@manage";

// ============================================================
//  主题色与背景图
// ============================================================
window.addEventListener("load", () => document.body.classList.add("loaded"));

function applyThemeColor() {
  const color = window.OPENLIST_CONFIG?.main_color;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  document.documentElement.style.setProperty(
    "--moe-color-theme",
    `${r} ${g} ${b}`,
  );
}
applyThemeColor();

// ============================================================
//  毛玻璃模块
// ============================================================
(function () {
  // ---------- 配置 ----------
  const BLUR_PX = config.glass?.blur ?? 3;
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

  // 预编译组合选择器
  const COMBINED_SELECTOR = CHILD_SELECTORS.map((s) => `:scope > ${s}`).join(
    ", ",
  );

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

  // ---------- 工具函数 ----------
  function isFrontPage() {
    return !window.location.pathname.startsWith(ADMIN_PATH);
  }

  // ---------- 通用防抖更新 ----------
  function scheduleUpdate() {
    if (isUpdatePending) return;
    isUpdatePending = true;
    requestAnimationFrame(() => {
      isUpdatePending = false;
      updateGlass();
    });
  }

  // ---------- 玻璃控制 ----------
  function setGlass(enable) {
    if (!isActive || !container || enable === isGlassOn) return;
    container.style.backdropFilter = enable ? `blur(${BLUR_PX}px)` : "none";
    isGlassOn = enable;
  }

  function hasDirectChild(parent) {
    if (!parent) return false;
    return parent.querySelector(COMBINED_SELECTOR) !== null;
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
      observer = new MutationObserver(scheduleUpdate);
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
    observer = new MutationObserver(scheduleUpdate);
    observer.observe(container, { childList: true, subtree: false });
    updateGlass();

    if (initTimeoutId) clearTimeout(initTimeoutId);
    initTimeoutId = setTimeout(updateGlass, 50);
  }

  // ---------- 重置 ----------
  function reset() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    container = null;
    isActive = false;
    isGlassOn = false;
    retryCount = 0;
    isUpdatePending = false;
    if (retryTimeoutId) {
      clearTimeout(retryTimeoutId);
      retryTimeoutId = null;
    }
    if (initTimeoutId) {
      clearTimeout(initTimeoutId);
      initTimeoutId = null;
    }
    init();
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
  function handleUrlChange() {
    const current = window.location.href;
    if (current === lastUrl) return;
    lastUrl = current;

    if (!isFrontPage()) {
      if (isActive) destroy();
      return;
    }

    if (!isActive) {
      init();
    } else {
      reset();
      window.dispatchEvent(new CustomEvent("moe:glass:reset"));
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
    urlPollId = setInterval(handleUrlChange, URL_POLL_INTERVAL_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

// ============================================================
//  备案号模块
// ============================================================
(function () {
  // ---------- 配置 ----------
  const BEIAN_TEXT = config.beian?.text || "豫 ICP 备 2025000000 号";
  const BEIAN_LINK = config.beian?.link || "https://beian.miit.gov.cn";
  const BEIAN_CLASS_NAME =
    config.beian?.className || "hope-anchor hope-c-PJLV-idrWMwW-css";
  const BEIAN_TIMEOUT_MS = config.beian?.timeout ?? 3000;

  // ---------- 状态 ----------
  let observer = null;
  let beianTimeoutId = null;
  let isInserted = false;
  let root = null;

  // ---------- 工具函数 ----------
  function getRoot() {
    if (!root || !document.body.contains(root)) {
      root = document.querySelector("#root");
    }
    return root;
  }

  function cleanup() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (beianTimeoutId) {
      clearTimeout(beianTimeoutId);
      beianTimeoutId = null;
    }
  }

  // ---------- 插入 ----------
  function insert(footer) {
    if (footer.querySelector(".beian-container")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "beian-container";
    wrapper.style.textAlign = "center";
    wrapper.hidden = true;

    const anchor = document.createElement("a");
    anchor.className = BEIAN_CLASS_NAME;
    anchor.href = BEIAN_LINK;
    anchor.target = "_blank";
    anchor.rel = "noopener";
    anchor.style.fontSize = "14px";
    anchor.textContent = BEIAN_TEXT;

    wrapper.appendChild(anchor);
    footer.appendChild(wrapper);
    wrapper.hidden = false;

    isInserted = true;
    cleanup();
  }

  // ---------- 检查并插入 ----------
  function checkAndInsert() {
    const currentRoot = getRoot();
    if (!currentRoot) return false;
    const footer = currentRoot.querySelector(":scope > .footer");
    if (footer) {
      insert(footer);
      return true;
    }
    return false;
  }

  // ---------- 启动 ----------
  function start() {
    if (config.beian?.enabled !== true) return;
    if (window.location.pathname.startsWith(ADMIN_PATH)) return;

    const currentRoot = getRoot();
    if (!currentRoot) return;

    if (checkAndInsert()) return;

    observer = new MutationObserver(() => {
      if (checkAndInsert()) cleanup();
    });
    observer.observe(currentRoot, { childList: true, subtree: false });
    beianTimeoutId = setTimeout(cleanup, BEIAN_TIMEOUT_MS);
  }

  // ---------- 重置 ----------
  function reset() {
    cleanup();

    if (isInserted) {
      const currentRoot = getRoot();
      if (currentRoot && currentRoot.querySelector(":scope > .footer")) {
        return;
      }
      isInserted = false;
    }

    start();
  }

  // ---------- 事件监听 ----------
  window.addEventListener("moe:glass:reset", reset);

  start();
})();

// ============================================================
//  控制台信息
// ============================================================
console.log(
  "\n %c OpenList Moe %c {{MOE_VERSION}} ",
  "padding: 5px 0; border-radius: 3px 0 0 3px; color: #fff; background: #FF6699; font-weight: bold;",
  "padding: 5px 0; border-radius: 0 3px 3px 0; color: #fff; background: #FF9999; font-weight: bold;",
);

console.log(
  "\n %c 适用于 OpenList {{OP_VERSION}} ",
  "padding: 5px 0; border-radius: 3px; color: #fff; background: linear-gradient(90deg, #134E4A 0%, #0D9488 50%, #14B8A6 100%); font-weight: bold;",
);

console.log(
  "\n %c Beautified by 朱茱 %c www.isajuna.com ",
  "padding: 5px 0; border-radius: 3px 0 0 3px; color: #777777; background: linear-gradient(to right,#ebf2ed,#e5ebee,#f0e5c7,#f8eef0); font-weight: bold;",
  "padding: 5px 0; border-radius: 0 3px 3px 0; color: #fff; background: #f8f8f8; font-weight: bold;",
);

console.log(
  "\n %c %c SajunaOo/OpenList-Moe ",
  `padding:5px 10px; border-radius:3px 0 0 3px; background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' width='16' height='16' fill='%2324292E'%3E%3Cpath d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z'/%3E%3C/svg%3E") center no-repeat; background-size:16px 16px; background-color:#fff;`,
  "padding:5px 0; border-radius:0 3px 3px 0; color:#fff; background:#24292E; font-weight:bold;",
);
