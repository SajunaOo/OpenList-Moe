const sass = require('sass');
const fs = require('fs');
const path = require('path');
const { minify: terserMinify } = require('terser');
const CleanCSS = require('clean-css');

// 配置对象
const CONFIG = {
  headerLines: 15,
  outputDir: 'dist',
  css: {
    input: 'src/styles/main.scss',
    prodFile: 'OpenList-Moe.min.css',
    devFile: 'OpenList-Moe.css',
    icon: '🎨',
  },
  js: {
    input: 'src/script/main.js',
    prodFile: 'OpenList-Moe.min.js',
    devFile: 'OpenList-Moe.js',
    icon: '✨',
  },
};

// 工具函数
const utils = {
  getBuildInfo: async (isLocalBuild = true) => {
    const TIMESTAMP = utils.getCurrentTimestamp();
    
    // 本地构建直接使用硬编码值
    if (isLocalBuild) {
      return {
        MOE_VERSION: 'Test',
        MOE_VERSION_LOG: TIMESTAMP, // 本地构建时MOE_VERSION_LOG等于TIMESTAMP
        OP_VERSION: 'Test',
        TIMESTAMP,
      };
    }
    
    // CI构建使用环境变量
    const { MOE_VERSION, OP_VERSION } = process.env;
    
    if (!MOE_VERSION || !OP_VERSION) {
      throw new Error('CI模式下缺少必要的环境变量 MOE_VERSION 或 OP_VERSION');
    }

    return {
      MOE_VERSION,
      MOE_VERSION_LOG: MOE_VERSION, // CI构建时MOE_VERSION_LOG等于MOE_VERSION
      OP_VERSION,
      TIMESTAMP,
    };
  },

  getCurrentTimestamp: () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(
      now.getHours()
    )}${pad(now.getMinutes())}`;
  },

  ensureDir: (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  },

  readFile: (filePath) => {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`读取文件失败 ${filePath}: ${error.message}`);
    }
  },

  replacePlaceholders: (content, buildInfo) => {
    const { MOE_VERSION, OP_VERSION, TIMESTAMP, MOE_VERSION_LOG } = buildInfo;

    const replacements = {
      '{{MOE_VERSION}}': MOE_VERSION,
      '{{MOE_VERSION_LOG}}': MOE_VERSION_LOG,
      '{{OP_VERSION}}': OP_VERSION,
      '{{TIMESTAMP}}': TIMESTAMP,
    };

    return Object.entries(replacements).reduce(
      (str, [key, value]) => str.replace(new RegExp(key, 'g'), value),
      content
    );
  },

  calculateCompression: (original, compressed) => {
    const originalSize = Buffer.byteLength(original, 'utf-8');
    const compressedSize = Buffer.byteLength(compressed, 'utf-8');
    const ratio = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);
    return {
      originalKB: (originalSize / 1024).toFixed(1),
      compressedKB: (compressedSize / 1024).toFixed(1),
      ratio,
    };
  },
};

// 核心处理函数
const processors = {
  // 编译源文件
  compileSource: (type, buildInfo) => {
    const config = CONFIG[type];
    const content = utils.readFile(config.input);

    // 分离头文件和主体
    const lines = content.split('\n');
    const headerLines = lines.slice(0, CONFIG.headerLines);
    const bodyLines = lines.slice(CONFIG.headerLines);

    // 分别替换占位符
    const header = utils.replacePlaceholders(headerLines.join('\n'), buildInfo);
    let body = utils.replacePlaceholders(bodyLines.join('\n'), buildInfo);

    // 编译 - 将SCSS编译为CSS
    if (type === 'css') {
      const result = sass.compileString(body, {
        style: 'expanded',
        charset: false,
      });
      body = result.css.replace(/@charset\s+["']UTF-8["'];?\s*/gi, '');
    }

    return { header, body };
  },

  // 压缩内容
  compressContent: async (content, type) => {
    if (type === 'css') {
      return new CleanCSS({
        level: { 1: { all: true }, 2: { all: true } },
      }).minify(content).styles;
    }
    // JS 类型
    const result = await terserMinify(content);
    if (result.error) throw result.error;
    return result.code;
  },
};

// 构建函数
const build = async (type, buildInfo, isDevBuild = false) => {
  const config = CONFIG[type];
  const startTime = Date.now();
  console.log(`${config.icon} 构建${isDevBuild ? '开发版' : '生产版'} ${type.toUpperCase()}...`);

  const { header, body } = processors.compileSource(type, buildInfo);

  const outputDir = `${CONFIG.outputDir}/${type}`;
  utils.ensureDir(outputDir);

  // 根据构建类型选择文件名
  const fileName = isDevBuild ? config.devFile : config.prodFile;
  const outputPath = path.join(outputDir, fileName);

  try {
    let outputContent;
    if (isDevBuild) {
      // 开发版本 - 不压缩
      outputContent = `${header}\n${body}`;
      // 直接计算开发版本文件大小
      const devSize = Buffer.byteLength(outputContent, 'utf-8');
      const devSizeKB = (devSize / 1024).toFixed(1);
      console.log(`📊 文件大小: ${devSizeKB}KB (未压缩)`);
    } else {
      // 生产版本 - 压缩
      const compressed = await processors.compressContent(body, type);
      outputContent = `${header}\n\n${compressed}`;
      const devContent = `${header}\n${body}`; // 开发版整体内容用于正确比较压缩率
      const stats = utils.calculateCompression(devContent, outputContent);
      console.log(`📊 压缩率: ${stats.ratio}% (${stats.originalKB}KB → ${stats.compressedKB}KB)`);
    }

    fs.writeFileSync(outputPath, outputContent);
    const buildTime = Date.now() - startTime;
    console.log(`${config.icon} ${outputPath} (${buildTime}ms)`);

    return true;
  } catch (error) {
    const buildTime = Date.now() - startTime;
    throw new Error(`${type.toUpperCase()}构建失败: ${error.message} (耗时: ${buildTime}ms)`);
  }
};

// 批量构建
const buildAll = async (buildInfo, isDevBuild = false) => {
  const startTime = Date.now();
  console.log('\n🚀 并行构建开始...');

  const results = await Promise.allSettled([
    build('css', buildInfo, isDevBuild),
    build('js', buildInfo, isDevBuild),
  ]);

  const completed = results.map((result, index) => ({
    type: ['css', 'js'][index],
    success: result.status === 'fulfilled' && result.value,
    error: result.status === 'rejected' ? result.reason : null,
  }));

  const totalBuildTime = Date.now() - startTime;

  // 输出构建结果摘要
  const successful = completed.filter((item) => item.success);
  const failed = completed.filter((item) => !item.success);

  if (failed.length > 0) {
    console.log(`\n❌ 构建失败: ${failed.map((item) => item.type).join(', ')}`);
    failed.forEach(
      (item) =>
        item.error && console.error(`   ${item.type.toUpperCase()}错误:`, item.error.message)
    );
    return false;
  } else {
    console.log(`\n✅ 构建成功! 总耗时: ${totalBuildTime}ms`);
    if (successful.length > 0) {
      console.log(
        `📁 输出文件: ${successful
          .map((item) => path.basename(CONFIG[item.type][isDevBuild ? 'devFile' : 'prodFile']))
          .join(', ')}`
      );
    }
    return true;
  }
};

// 主入口函数
const main = async () => {
  const args = process.argv.slice(2);
  const buildType = args[0] || 'prod'; // 默认生产构建

  if (!['ci', 'prod', 'dev'].includes(buildType)) {
    console.log(`\n❌ 未知构建类型: ${buildType}`);
    console.log('可用的构建类型: ci, prod, dev');
    process.exit(1);
  }

  console.log(`🚀 OpenList Moe ${buildType === 'ci' ? 'CI ' : '本地'}构建系统\n` + '='.repeat(50));

  try {
    const isCIBuild = buildType === 'ci';
    const buildInfo = await utils.getBuildInfo(!isCIBuild); // CI构建时传入false，本地构建时传入true
    const buildTypeName = isCIBuild ? 'CI 生产' : buildType === 'dev' ? '本地开发' : '本地生产';
    console.log(`${buildType === 'dev' ? '🔧' : '📦'} ${buildTypeName}构建`);
    console.log(
      `📌 版本: Moe ${buildInfo.MOE_VERSION}, OpenList ${buildInfo.OP_VERSION}, 时间戳: ${buildInfo.TIMESTAMP}`
    );

    const isDevBuild = buildType === 'dev';
    const success = await buildAll(buildInfo, isDevBuild);
    if (!success) process.exit(1);
  } catch (error) {
    console.error(`\n💥 构建过程异常: ${error.message}`);
    process.exit(1);
  }
};

// 运行主程序
main();
