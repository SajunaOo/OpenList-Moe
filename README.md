<div align="center">
  
<!-- 项目头像 -->
<a href="https://github.com/SajunaOo/OpenList-Moe" target="_blank">
  <img style="width: 160px; border-radius: 50%;" src="https://cdn.jsdmirror.com/gh/SajunaOo/Image/OpenList-Moe/avatar.webp" alt="OpenList Moe" >
</a>

<!-- 项目标题 -->
<h1 style="font-family: 'SF Mono', 'Fira Code'; font-weight: 600; letter-spacing: -0.5px;">OpenList Moe</h1>

<!-- 徽标区 -->
<p style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
  <!-- 版本 -->
  <a href="https://github.com/SajunaOo/OpenList-Moe/releases"><img src="https://img.shields.io/github/v/release/SajunaOo/OpenList-Moe?label=版本&style=flat-square&color=4A90E2" alt="版本"></a>
  <!-- 下载量 -->
  <a href="https://github.com/SajunaOo/OpenList-Moe/releases"><img src="https://img.shields.io/github/downloads/SajunaOo/OpenList-Moe/total?style=flat-square&label=下载量&color=7ED321" alt="下载量"></a>
  <!-- 构建状态 -->
  <a href="https://github.com/SajunaOo/OpenList-Moe/actions/workflows/build-pr-release.yml"><img src="https://img.shields.io/github/actions/workflow/status/SajunaOo/OpenList-Moe/build-pr-release.yml?style=flat-square&label=构建" alt="构建状态"></a>
  <!-- 许可证 -->
  <a href="LICENSE"><img src="https://img.shields.io/github/license/SajunaOo/OpenList-Moe?style=flat-square&color=9013FE&label=许可证" alt="许可证"></a>
  <!-- 星标 -->
  <a href="https://github.com/SajunaOo/OpenList-Moe/stargazers"><img src="https://img.shields.io/github/stars/SajunaOo/OpenList-Moe?style=flat-square&label=星标&color=F5A623" alt="星标"></a>
  <!-- OpenList -->
  <a href="https://github.com/OpenListTeam/OpenList"><img src="https://img.shields.io/badge/适配-OpenList-D53941?style=flat-square" alt="适配OpenList"></a>
</p>

<!-- 项目简介 -->
<p style="font-size: 16px; line-height: 30px;">
  <strong>为 OpenList 全局注入半透明模糊效果<br>支持日夜切换，覆盖文件列表/预览/后台等全组件</strong>
</p>

</div>

## ✨ 特性

🌓 **兼容日/夜间模式** - 自动适配不同背景与配色方案

🪟 **全元素毛玻璃效果** - 半透明元素结合背景模糊

🎨 **多层次透明度调校** - 完美的视觉层次感

📱 **响应式设计** - 完美适配桌面端和移动端

## 🖼️ 截图

### 桌面端
![桌面端首页](screenshot/desktop/screenshot-7984646497959.webp)

<table>
  <tr>
    <td><img alt="桌面端首页" src="screenshot/desktop/screenshot-7941649794196.webp"></td>
    <td><img alt="桌面端登录" src="screenshot/desktop/screenshot-5347525587747.webp"></td>
  </tr>
  <tr>
    <td><img alt="桌面端存储管理" src="screenshot/desktop/screenshot-9734164764113.webp"></td>
    <td><img alt="桌面端管理首页" src="screenshot/desktop/screenshot-8147104157344.webp"></td>
  </tr>
</table>

### 移动端
<table>
  <tr>
    <td><img alt="移动端首页" src="screenshot/mobile/screenshot-5497841311752.webp"></td>
    <td><img alt="移动端登录" src="screenshot/mobile/screenshot-5792856295526.webp"></td>
    <td><img alt="移动端管理首页" src="screenshot/mobile/screenshot-9785664317984.webp"></td>
  </tr>
  <tr>
    <td><img alt="移动端用户管理" src="screenshot/mobile/screenshot-7416137946139.webp"></td>
    <td><img alt="移动端存储管理" src="screenshot/mobile/screenshot-6497941389741.webp"></td>
    <td><img alt="移动端任务管理" src="screenshot/mobile/screenshot-2141794613317.webp"></td>
  </tr>
</table>

## 🚀 快速开始

### 基础样式

在 OpenList 的 **自定义头部** 添加以下代码：

```html
<!-- 修改 href 和 font-family 以自定义字体，删除字体 <link> 和字体 CSS 则使用 OpenList 默认字体 -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600&display=swap" rel="stylesheet">
<link href="https://cdn.jsdmirror.com/gh/SajunaOo/OpenList-Moe/dist/css/OpenList-Moe.min.css" rel="stylesheet">

<style>
/** 修改 URL 以自定义背景，删除背景 CSS 则使用 OpenList Moe 默认背景 */
:root {
  --moe-color-theme: 248 179 78; /** 主题色（必填） */
  --moe-bg-image-desktop: url("https://cdn.jsdmirror.com/gh/SajunaOo/OpenList-Moe-Image/light_desktop/早秋_2.webp"); /** 默认白天模式桌面端背景图 */
  --moe-bg-image-mobile: url("https://cdn.jsdmirror.com/gh/SajunaOo/OpenList-Moe-Image/light_mobile/沉浸感_3.webp"); /** 默认白天模式移动端背景图 */
}

.hope-ui-dark {
  --moe-bg-image-desktop: url("https://cdn.jsdmirror.com/gh/SajunaOo/OpenList-Moe-Image/dark_desktop/新春快乐_5.webp"); /** 默认夜间模式桌面端背景图 */
  --moe-bg-image-mobile: url("https://cdn.jsdmirror.com/gh/SajunaOo/OpenList-Moe-Image/dark_mobile/沉浸感_6.webp"); /** 默认夜间模式移动端背景图 */
}

/** 字体设置 */
body, .markdown-body, .aplayer {
  font-family: 'Noto Serif SC' !important;
}
</style>
```

### JavaScript 和备案信息

在 OpenList 的 **自定义内容** 添加以下代码：

```html
<script src="https://cdn.jsdmirror.com/gh/SajunaOo/OpenList-Moe/dist/js/OpenList-Moe.min.js"></script>

<!-- 如果你不需要添加备案号，请删除以下代码 -->
<div class="beian-container" style="text-align: center;" hidden>
  <a class="hope-anchor hope-c-PJLV-idrWMwW-css" href="https://beian.miit.gov.cn" target="_blank" rel="noopener" style="font-size: 14px;">
    豫 ICP 备 2025000000 号</a>
</div>

<script>
// 备案信息加载
(()=>{let _o;const _f=()=>{const e=document.querySelector('.footer'),t=document.querySelector('.beian-container');return e&&t&&(e.append(t),t.hidden=!1,_o?.disconnect(),_o=null,!0)};_f()||(_o=new MutationObserver(_f), _o.observe(document,{childList:1,subtree:1}))})();
</script>
```

## 🎨 自定义配置

### 查看源码变量

如果你需要深度定制特定元素的样式，可以参考 [main.scss](https://github.com/SajunaOo/OpenList-Moe/blob/main/src/styles/main.scss) 中的 **全局变量定义** 部分。

### 示例：修改复选框颜色

```css
:root {
  --moe-color-checkbox: #f8b34e; /* 白天模式复选框颜色 */
}

.hope-ui-dark {
  --moe-color-checkbox: #f8b34e; /* 夜间模式复选框颜色 */
}
```

## 📁 项目结构

```
OpenList-Moe/
├── src/
│   ├── styles/
│   │   └── main.scss     # 样式文件
│   └── script/
│       └── main.js       # 脚本文件
├── dist/                 # 构建输出目录
├── screenshot/           # 截图目录
├── build.js              # 构建脚本
└── README.md             # 项目文档
```

## 📄 许可证

本项目采用 **AGPL-3.0** 许可证。详见 [LICENSE](LICENSE) 文件。
