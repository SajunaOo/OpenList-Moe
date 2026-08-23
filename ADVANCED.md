# ⚙️ OpenList Moe 高级配置

> 以下配置属于 **高级配置**，按需使用。基础配置请参考 **[README.md](README.md)**。

## 🎨 元素样式

如需深度定制特定元素样式，可参考 **[main.scss](src/styles/main.scss)** 中的 **全局变量定义** 部分。

**示例：修改复选框颜色**

```css
:root {
  /* 白天模式 */
  --moe-color-checkbox: #000;
}

.hope-ui-dark {
 /* 夜间模式 */
  --moe-color-checkbox: #fff;
}
```


## ⚙️ MOE_CONFIG 完整配置

```html
<script>
window.MOE_CONFIG = {
  /** 后台管理路径 */
  adminPath: "/@manage",

  /** 备案号配置 */
  beian: {
    enabled: true,                               /** 是否启用 */
    text: "豫 ICP 备 2025000000 号",              /** 备案号文本 */
    link: "https://beian.miit.gov.cn",           /** 备案号链接（可省略） */
    className: "hope-anchor hope-c-PJLV-idrWMwW-css", /** 链接样式类（可省略） */
    timeout: 3000,                               /** 超时时间 ms（可省略） */
  },

  /** 毛玻璃配置 */
  glass: {
    blur: 3,                                     /** 模糊强度 px（可省略） */
    container: ".obj-box",                       /** 容器选择器（可省略） */
    children: [                                  /** 目标子元素（可省略） */
      ".hope-c-PJLV-iiRelTQ-css",
      ".hope-c-PJLV-ibZqGFV-css",
    ],
    urlPollInterval: 1500,                       /** URL 轮询间隔 ms（可省略） */
    retryInterval: 100,                          /** 重试间隔 ms（可省略） */
    retryTimeoutMs: 3000,                        /** 重试总超时 ms（可省略） */
  },
};
</script>
<script src="https://cdn.jsdmirror.com/gh/SajunaOo/OpenList-Moe@dist/js/OpenList-Moe.min.js"></script>
```


## 📋 配置项说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `adminPath` | `string` | `"/@manage"` | 后台路径前缀，匹配时禁用所有功能 |
| `beian.enabled` | `boolean` | `true` | 是否启用备案号 |
| `beian.text` | `string` | `"豫 ICP 备 2025000000 号"` | 备案号显示文本 |
| `beian.link` | `string` | `"https://beian.miit.gov.cn"` | 备案号链接地址 |
| `beian.className` | `string` | `"hope-anchor hope-c-PJLV-idrWMwW-css"` | 备案号链接 CSS 类名 |
| `beian.timeout` | `number` | `3000` | 等待 `.footer` 超时时间（ms） |
| `glass.blur` | `number` | `3` | 毛玻璃模糊强度（px） |
| `glass.container` | `string` | `".obj-box"` | 容器选择器 |
| `glass.children` | `string｜string[]` | `[".hope-c-PJLV-iiRelTQ-css", ".hope-c-PJLV-ibZqGFV-css"]` | 命中时关闭毛玻璃的目标子元素 |
| `glass.urlPollInterval` | `number` | `1500` | URL 轮询间隔（ms） |
| `glass.retryInterval` | `number` | `100` | 容器重试间隔（ms） |
| `glass.retryTimeoutMs` | `number` | `3000` | 容器重试总超时（ms） |

<details>
<summary><b>📖 详细说明</b></summary>

#### `adminPath`

后台管理路径前缀。当 URL 路径以该值开头时，毛玻璃和备案号功能均被禁用。若后台路径不同，请修改为实际路径。

#### 备案号模块 `beian`

- **`enabled`**：总开关，设为 `false` 时备案号不插入，其他 `beian.*` 配置失效。
- **`text`**：备案号显示文本，展示在页面底部。**请替换为自己的备案号。**
- **`link`**：备案号跳转链接，一般无需修改。
- **`className`**：链接 CSS 类名，用于继承页脚样式。若自定义了页脚样式，需同步修改。
- **`timeout`**：等待 `.footer` 出现的超时时间。若页面加载慢，可调大（如 `5000`）。

#### 毛玻璃模块 `glass`

- **`blur`**：模糊强度（px），推荐 `3` ~ `10`。
- **`container`**：容器选择器，对应文件列表容器。若 OpenList 版本升级导致类名变化，需同步修改。
- **`children`**：目标子元素选择器。当容器下存在这些 **直接子元素** 时，毛玻璃自动关闭。支持数组或逗号分隔字符串。
- **`urlPollInterval`**：轮询检测 URL 变化的间隔，用于进入后台时销毁毛玻璃资源。间隔越小响应越快，CPU 占用越高，建议保持 `1500` 以上。
- **`retryInterval`**：容器重试间隔。一般无需修改。
- **`retryTimeoutMs`**：容器重试总超时。若 API 响应慢导致页面渲染延迟，可调大（如 `5000`）。

</details>


## ❓ 常见问题

### 备案号未显示

- 检查 `.footer` 是否在 `timeout` 内出现
- 若加载慢，调大 `beian.timeout`（如 `5000`）
- 确认当前路径未匹配 `adminPath`

### 毛玻璃未生效

- 检查 `.obj-box` 是否在 `retryTimeoutMs` 内出现
- 若 API 响应慢，调大 `glass.retryTimeoutMs`（如 `5000`）
- 检查容器下是否存在 `glass.children` 子元素（存在时自动关闭）
- 确认当前路径未匹配 `adminPath`
