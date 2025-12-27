const sass = require('sass');
const fs = require('fs');
const https = require('https');
const path = require('path');

const CONFIG = {
  headerLines: 15,
  css: {
    input: 'src/styles/main.scss',
    outputDir: 'dist/css',
    devFile: 'OpenList-Moe.css',
    prodFile: 'OpenList-Moe.min.css',
    minifyApi: '/developers/cssminifier/api/raw',
    icon: '🎨'
  },
  js: {
    input: 'src/script/main.js',
    outputDir: 'dist/js',
    devFile: 'OpenList-Moe.js',
    prodFile: 'OpenList-Moe.min.js',
    minifyApi: '/developers/javascript-minifier/api/raw',
    icon: '⚡'
  }
};

// 工具函数
function getBuildInfo(isCI) {
  if (isCI) {
    const { MOE_VERSION, OP_VERSION } = process.env;
    if (!MOE_VERSION || !OP_VERSION) {
      throw new Error(`CI构建失败: ${!MOE_VERSION ? 'MOE_VERSION' : 'OP_VERSION'} 环境变量未设置`);
    }
    return { MOE_VERSION, OP_VERSION, isCI: true, timestamp: getCurrentTimestamp() };
  }
  return { MOE_VERSION: 'Test', OP_VERSION: 'Test', isCI: false, timestamp: getCurrentTimestamp() };
}

function getCurrentTimestamp() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const date = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  return `${year}${month}${date}${hours}${minutes}`;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function extractHeader(content, lines) {
  return content.split('\n').slice(0, lines).join('\n');
}

function compressWithAPI(content, apiPath) {
  return new Promise((resolve, reject) => {
    const postData = 'input=' + encodeURIComponent(content);
    const req = https.request({
      hostname: 'www.toptal.com',
      path: apiPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => res.statusCode === 200 ? resolve(data) : reject(`API错误 ${res.statusCode}`));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject('请求超时(15秒)'); });
    req.write(postData);
    req.end();
  });
}

function calculateCompression(original, compressed) {
  const originalSize = Buffer.byteLength(original, 'utf-8');
  const compressedSize = Buffer.byteLength(compressed, 'utf-8');
  const ratio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
  return {
    originalKB: (originalSize / 1024).toFixed(1),
    compressedKB: (compressedSize / 1024).toFixed(1),
    ratio
  };
}

function replacePlaceholders(content, buildInfo) {
  const { MOE_VERSION, OP_VERSION, timestamp, isCI } = buildInfo;
  const replacements = {
    '{{MOE_VERSION}}': MOE_VERSION,
    '{{TIMESTAMP}}': timestamp,
    '{{OP_VERSION}}': OP_VERSION,
    '{{MOE_VERSION_LOG}}': isCI ? MOE_VERSION : timestamp
  };
  return Object.entries(replacements).reduce(
    (str, [key, value]) => str.replace(new RegExp(key, 'g'), value),
    content
  );
}

// 编译源文件
function compileSource(type, buildInfo) {
  try {
    const config = CONFIG[type];
    const content = readFile(config.input);
    const processed = replacePlaceholders(content, buildInfo);
    
    if (type === 'css') {
      const result = sass.compileString(processed, { style: 'expanded', charset: false });
      return result.css.replace(/@charset\s+["']UTF-8["'];?\s*/gi, '');
    }
    return processed;
  } catch (error) {
    throw new Error(`${type.toUpperCase()}编译失败: ${error.message}`);
  }
}

// 统一构建函数
async function build(type, buildInfo, isProd = true) {
  const config = CONFIG[type];
  const mode = isProd ? '生产版' : '开发版';
  console.log(`\n${config.icon} 构建${mode} ${type.toUpperCase()}...`);
  
  const content = compileSource(type, buildInfo);
  if (!content) return false;

  ensureDir(config.outputDir);
  const fileName = isProd ? config.prodFile : config.devFile;
  const outputPath = path.join(config.outputDir, fileName);

  // 开发版：直接写入
  if (!isProd) {
    fs.writeFileSync(outputPath, content);
    console.log(`✅ 开发版${type.toUpperCase()}: ${outputPath}`);
    return true;
  }

  // 生产版：压缩并添加文件头
  try {
    const compressed = await compressWithAPI(content, config.minifyApi);
    const sourceContent = readFile(config.input);
    const header = replacePlaceholders(extractHeader(sourceContent, CONFIG.headerLines), buildInfo);
    const finalContent = `${header}\n\n${compressed}`;
    
    fs.writeFileSync(outputPath, finalContent);
    const stats = calculateCompression(content, finalContent);
    console.log(`✅ 生产版${type.toUpperCase()}: ${outputPath}`);
    console.log(`📊 压缩率: ${stats.ratio}% (${stats.originalKB}KB → ${stats.compressedKB}KB)`);
    return true;
  } catch (error) {
    throw new Error(`${type.toUpperCase()}压缩失败: ${error}`);
  }
}

// 命令处理器
const COMMAND_HANDLERS = {
  ci: async () => {
    const buildInfo = getBuildInfo(true);
    console.log('📦 CI生产构建');
    console.log(`📌 版本: Moe ${buildInfo.MOE_VERSION}, OpenList ${buildInfo.OP_VERSION}, 时间戳: ${buildInfo.timestamp}`);
    return await buildAll(buildInfo, true);
  },
  build: async () => {
    const buildInfo = getBuildInfo(false);
    console.log('📦 本地生产构建');
    console.log(`📌 版本: Moe ${buildInfo.timestamp}`);
    return await buildAll(buildInfo, true);
  },
  css: async () => buildSingle('css', false, true),
  'css:dev': async () => buildSingle('css', false, false),
  js: async () => buildSingle('js', false, true),
  'js:dev': async () => buildSingle('js', false, false)
};

// 辅助函数
async function buildAll(buildInfo, isProd) {
  const results = await Promise.all([
    build('css', buildInfo, isProd),
    build('js', buildInfo, isProd)
  ]);
  return results.every(Boolean);
}

async function buildSingle(type, isCI, isProd) {
  const buildInfo = getBuildInfo(isCI);
  const mode = isProd ? '生产' : '未压缩';
  console.log(`${CONFIG[type].icon} 本地${mode}${type.toUpperCase()}构建`);
  console.log(`📌 版本: Moe ${buildInfo.timestamp}`);
  return await build(type, buildInfo, isProd);
}

// 主函数
async function main() {
  console.log('🚀 OpenList Moe构建系统\n' + '='.repeat(50));
  const command = process.argv[2] || 'build';
  const handler = COMMAND_HANDLERS[command];
  if (!handler) {
    console.log(`❌ 未知命令: ${command}\n\n可用命令:`);
    const descriptions = {
      'ci': 'CI生产构建',
      'build': '本地生产构建',
      'css': '本地生产CSS构建',
      'css:dev': '本地未压缩CSS构建',
      'js': '本地生产JS构建',
      'js:dev': '本地未压缩JS构建'
    };
    Object.entries(descriptions).forEach(([cmd, desc]) => console.log(`  ${cmd.padEnd(10)} ${desc}`));
    process.exit(1);
  }
  try {
    const success = await handler();
    console.log(success ? `\n🎉 ${command === 'ci' ? 'CI ' : ''}构建完成！` : '\n⚠️ 构建过程中出现错误');
    if (!success) process.exit(1);
  } catch (error) {
    console.error(`\n💥 构建过程异常: ${error.message}`);
    process.exit(1);
  }
}

main();