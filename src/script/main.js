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
