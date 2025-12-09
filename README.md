## 🎨 OpenList Moe

**为OpenList全局注入半透明模糊效果，支持日夜切换，覆盖文件列表/预览/后台等全组件**

> 一个基于文件列表程序OpenList的美化

## ✨ 特性

#### 🌓 兼容日/夜间模式 - 不同背景与配色

#### 🪟 全元素毛玻璃效果 - 半透明元素结合背景模糊

#### 🎨 多层次透明度调校 - 完美的视觉层次

## 🖼️ 截图

![桌面端首页](screenshot/desktop/screenshot-7984646497959.webp)

<table>
  <tr>
    <td><img alt="桌面端首页" src="screenshot\desktop\screenshot-7941649794196.webp"></td>
    <td><img alt="桌面端登录" src="screenshot\desktop\screenshot-5347525587747.webp"></td>
  <tr>
    <tr>
    <td><img alt="桌面端存储管理" src="screenshot\desktop\screenshot-9734164764113.webp"></td>
    <td><img alt="桌面端管理首页" src="screenshot\desktop\screenshot-8147104157344.webp"></td>
  <tr>
</table>

<table>
  <tr>
    <td><img alt="移动端首页" src="screenshot\mobile\screenshot-5497841311752.webp"></td>
    <td><img alt="移动端登录" src="screenshot\mobile\screenshot-5792856295526.webp"></td>
    <td><img alt="移动端管理首页" src="screenshot\mobile\screenshot-9785664317984.webp"></td>
  <tr>
  <tr>
    <td><img alt="移动端用户管理" src="screenshot\mobile\screenshot-7416137946139.webp"></td>
    <td><img alt="移动端存储管理" src="screenshot\mobile\screenshot-6497941389741.webp"></td>
    <td><img alt="移动端任务管理" src="screenshot\mobile\screenshot-2141794613317.webp"></td>
  <tr>
</table>

## 🚀 使用

### 自定义头部
```
<!-- 更改href和font-family以更改字体，删除本<link>和字体css则使用OpenList默认字体 -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600&display=swap" rel="stylesheet">
<link href="https://cdn.jsdmirror.com/gh/SajunaOo/OpenList-Moe/dist/css/OpenList-Moe.min.css" rel="stylesheet">
<style>
/** 更改url以更改背景图，删除本css或留空url将调用默认背景图 */
:root {
  --moe-color-theme: 248, 179, 78; /** 必填 */
  --moe-bg-image-desktop: url("https://cdn.jsdmirror.com/gh/SajunaOo/OpenList-Moe-Image/light_desktop/早秋_2.webp");/** 默认白天模式背景图 */
  --moe-bg-image-mobile: url("https://cdn.jsdmirror.com/gh/SajunaOo/OpenList-Moe-Image/light_mobile/沉浸感_3.webp");/** 默认白天模式移动端背景图 */
}

.hope-ui-dark {
  --moe-bg-image-desktop: url("https://cdn.jsdmirror.com/gh/SajunaOo/OpenList-Moe-Image/dark_desktop/新春快乐_5.webp");/** 默认夜间模式背景图 */
  --moe-bg-image-mobile: url("https://cdn.jsdmirror.com/gh/SajunaOo/OpenList-Moe-Image/dark_mobile/沉浸感_6.webp");/** 默认夜间模式移动端背景图 */
}

/** 字体 */
body, .markdown-body, .aplayer {
  font-family: 'Noto Serif SC' !important;
}
</style>
```

### 自定义内容

```
<script src="https://cdn.jsdmirror.com/gh/SajunaOo/OpenList-Moe/dist/js/OpenList-Moe.min.js"></script>

<!-- 如果您不需要添加备案号，请删除以下代码 -->
<div id="beian-container" hidden>
  <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener" class="beian-link ">
    豫 ICP 备 2025000000 号</a>
</div>

<script>
// 备案信息加载
(()=>{const targetNode=document.documentElement;const insertElement=()=>{const footer=document.querySelector('.footer');if(footer){const container=document.getElementById('beian-container');footer.append(container);container.hidden=false;return true}return false};const observer=new MutationObserver(()=>{if(insertElement()){observer.disconnect()}});observer.observe(document,{childList:true,subtree:true})})();
</script>
```