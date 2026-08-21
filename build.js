const sass = require("sass");
const fs = require("fs");
const path = require("path");
const { minify: terserMinify } = require("terser");
const CleanCSS = require("clean-css");

/** 配置 */
const CONFIG = {
  outputDir: "dist",
  headerLines: 15, // 头部注释行数（不参与压缩编译）
  types: {
    css: {
      input: "src/styles/main.scss",
      devFile: "OpenList-Moe.css",
      prodFile: "OpenList-Moe.min.css",
      icon: "🎨",
    },
    js: {
      input: "src/script/main.js",
      devFile: "OpenList-Moe.js",
      prodFile: "OpenList-Moe.min.js",
      icon: "✨",
    },
  },
};

/** 时间戳（本地版本标识 / 发布头部展示） */
const timestampNow = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
};

/** 占位符变量 */
const getVariables = (isDev) => {
  const timestamp = timestampNow();

  // 本地开发：Moe 用时间戳标识，OpenList 为 latest
  if (isDev)
    return {
      MOE_VERSION_TAG: timestamp,
      MOE_VERSION: timestamp,
      OP_VERSION: "latest",
    };

  // 发布构建：两个环境变量必须同时存在
  const { MOE_VERSION, OP_VERSION } = process.env;
  const missing = [];
  if (!MOE_VERSION) missing.push("MOE_VERSION");
  if (!OP_VERSION) missing.push("OP_VERSION");
  if (missing.length)
    throw new Error(`缺少环境变量: ${missing.join("、")}，请检查工作流`);

  return {
    MOE_VERSION_TAG: `${MOE_VERSION} - ${timestamp}`,
    MOE_VERSION,
    OP_VERSION,
  };
};

/** 单次正则替换所有占位符（一次扫描，优于逐 key replaceAll） */
const replacePlaceholders = (content, vars) =>
  content.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key] ?? match);

/** 压缩率统计 */
const compressionStats = (original, compressed) => {
  const toKB = (buf) => (Buffer.byteLength(buf) / 1024).toFixed(1);
  const originalKB = toKB(original);
  const compressedKB = toKB(compressed);
  return {
    originalKB,
    compressedKB,
    ratio: (((originalKB - compressedKB) / originalKB) * 100).toFixed(1),
  };
};

/** 复用压缩器实例，避免每次构建重复构造 */
const cssMinifier = new CleanCSS({
  level: { 1: { all: true }, 2: { all: true } },
});

/** 编译源文件：整体替换占位符后，分离头部注释与主体 */
const compileSource = (type, vars) => {
  const content = replacePlaceholders(
    fs.readFileSync(CONFIG.types[type].input, "utf-8"),
    vars,
  );

  // 只拆分前 headerLines 行做头部，body 用 slice 保留剩余原文（避免 split 截断陷阱 & 大文件全量拆行）
  const header = content.split("\n", CONFIG.headerLines).join("\n");
  let body = content.slice(header.length + 1);

  if (type === "css") {
    body = sass
      .compileString(body, { style: "expanded", charset: false })
      .css.replace(/@charset\s+["']UTF-8["'];?\s*/gi, "");
  }
  return { header, body };
};

/** 压缩（参数与原有逻辑一致） */
const compressContent = async (content, type) => {
  if (type === "css") return cssMinifier.minify(content).styles;
  const result = await terserMinify(content);
  if (result.error) throw result.error;
  return result.code;
};

/** 构建单个类型：写文件并返回统计 */
const build = async (type, vars, isDev) => {
  const config = CONFIG.types[type];
  const startTime = Date.now();
  const { header, body } = compileSource(type, vars);

  const devContent = `${header}\n${body}`;
  const prodContent = `${header}\n\n${await compressContent(body, type)}`;
  const stats = compressionStats(devContent, prodContent);

  const outDir = path.join(CONFIG.outputDir, type);
  fs.mkdirSync(outDir, { recursive: true });

  // 发布：仅压缩版；开发：压缩版 + 未压缩版（按展示顺序写入）
  const written = [];
  const write = (file, content) => {
    const outPath = path.join(outDir, file);
    fs.writeFileSync(outPath, content);
    written.push(outPath);
  };
  if (isDev) write(config.devFile, devContent);
  write(config.prodFile, prodContent);

  return { type, stats, written, time: Date.now() - startTime };
};

/** 批量构建 */
const buildAll = async (vars, isDev) => {
  const startTime = Date.now();
  const results = await Promise.allSettled(
    Object.keys(CONFIG.types).map((type) => build(type, vars, isDev)),
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length)
    throw new Error(
      `请检查代码: ${failed.map((r) => r.reason.message).join("; ")}`,
    );

  // 按类型固定顺序（css → js）汇总输出
  console.log("");
  for (const {
    value: { type, stats, written, time },
  } of results) {
    const { icon } = CONFIG.types[type];
    const sizeInfo = `📊 ${stats.originalKB}KB → ${stats.compressedKB}KB (压缩率 ${stats.ratio}%)`;
    console.log(`${icon} ${type.toUpperCase()} 构建完成 (${time}ms)`);
    console.log(`   ${sizeInfo}`);
    written.forEach((file) => console.log(`   📄 ${file}`));
    console.log("");
  }

  console.log(`✅ 构建成功! 总耗时: ${Date.now() - startTime}ms`);
};

/** 主入口 */
const main = async () => {
  const mode = process.argv[2] || "dev";
  if (!["dev", "build"].includes(mode)) {
    console.log(`\n❌ 未知构建类型: ${mode}`);
    console.log("可用的构建类型: dev, build");
    process.exit(1);
  }

  const isDev = mode === "dev";
  console.log(`🚀 OpenList Moe 构建\n`);

  try {
    const vars = getVariables(isDev);
    console.log(
      `📌 版本: Moe ${vars.MOE_VERSION} | OpenList ${vars.OP_VERSION}`,
    );

    await buildAll(vars, isDev);
  } catch (error) {
    console.error(`💥 ${error.message}`);
    process.exit(1);
  }
};

main();
