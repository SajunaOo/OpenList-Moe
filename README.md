## 🎨 OpenList Moe

**为OpenList全局注入半透明模糊效果，支持日夜切换，覆盖文件列表/预览/后台等全组件**

> 一个基于文件列表程序OpenList的美化

## ✨ 特性

#### 🌓 兼容日/夜间模式 - 不同背景与配色

#### 🪟 全元素毛玻璃效果 - 半透明元素结合背景模糊

#### 🎨 多层次透明度调校 - 完美的视觉层次

## 🖼️ 截图

![PC首页](screenshot\screenshot-9846678436679.png)
![PC登录](screenshot\screenshot-3131276984557.png)
![PC管理](screenshot\screenshot-4237987659876.png)

<p align="center">
  <img src="screenshot\screenshot-4234325673769.png" alt="移动端首页" width="49%"/>
  <img src="screenshot\screenshot-1754234234234.png" alt="移动端管理" width="49%"/>
</p>

## 🚀 使用

### 自定义头部
```
<!-- 更改href和font-family以更改字体，删除本<link>和字体css则使用OpenList默认字体 -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600&display=swap" rel="stylesheet">
<link href="https://gcore.jsdelivr.net/gh/SajunaOo/OpenList-Moe/dist/css/OpenList-Moe.min.css" rel="stylesheet">
<style>
/** 更改url以更改背景图，删除本css或留空url将调用默认背景图 */
:root {
  --moe-theme-color: 248, 179, 78; /** 必填 该主题色用于视图切换按钮修复和边框高亮 */
  --moe-bg-image: url("https://gcore.jsdelivr.net/gh/SajunaOo/OpenList-Moe-Image/light_desktop/早秋_2.webp");/** 默认白天模式背景图 */
  --moe-bg-image-small: url("https://gcore.jsdelivr.net/gh/SajunaOo/OpenList-Moe-Image/light_small/沉浸感_3.webp");/** 默认白天模式移动端背景图 */
}

.hope-ui-dark {
  --moe-bg-image: url("https://gcore.jsdelivr.net/gh/SajunaOo/OpenList-Moe-Image/dark_desktop/新春快乐_5.webp");/** 默认夜间模式背景图 */
  --moe-bg-image-small: url("https://gcore.jsdelivr.net/gh/SajunaOo/OpenList-Moe-Image/dark_small/沉浸感_6.webp");/** 默认夜间模式移动端背景图 */
}

/** 字体 */
body {
  font-family: 'Noto Serif SC' !important;
}
div.markdown-body {
  font-family: inherit;
}
</style>
```

### 自定义内容

```
<script src="https://gcore.jsdelivr.net/gh/SajunaOo/OpenList-Moe/dist/js/OpenList-Moe.min.js"></script>

<div id="beian-container" hidden>
  <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener" class="beian-link ">
    豫 ICP 备 2025000000 号</a>
</div>

<script>
// 备案信息加载
(()=>{const targetNode=document.documentElement;const insertElement=()=>{const footer=document.querySelector('.footer');if(footer){const container=document.getElementById('beian-container');footer.append(container);container.hidden=false;return true}return false};const observer=new MutationObserver(()=>{if(insertElement()){observer.disconnect()}});observer.observe(document,{childList:true,subtree:true})})();
</script>
```