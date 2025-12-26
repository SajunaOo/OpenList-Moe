const sass = require('sass');
const fs = require('fs');
const https = require('https');
const path = require('path');

const CONFIG = {
  css: {
    input: 'src/styles/main.scss',
    outputDir: 'dist/css',
    devFile: 'OpenList-Moe.css',
    prodFile: 'OpenList-Moe.min.css',
    headerLines: 15
  },
  js: {
    input: 'src/script/main.js',
    outputDir: 'dist/js',
    prodFile: 'OpenList-Moe.min.js',
    headerLines: 15
  }
};

// 工具函数
function getPackageInfo() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    return {
      version: packageJson.version,
      opversion: 'v' + packageJson.opversion
    };
  } catch (error) {
    console.error('❌ 读取 package.json 失败:', error.message);
    process.exit(1);
  }
}

function getBuildTimestamp() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readSourceFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function readHeader(sourcePath, headerLines) {
  const content = readSourceFile(sourcePath);
  const lines = content.split('\n');
  return lines.slice(0, headerLines).join('\n');
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
      res.on('end', () => res.statusCode === 200 ? resolve(data) : reject(`API 错误 ${res.statusCode}`));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject('请求超时 (15秒)');
    });

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

function replaceVersionPlaceholders(content, versionInfo, timestamp) {
  return content
    .replace(/{{VERSION}}/g, `v${versionInfo.version}`)
    .replace(/{{TIMESTAMP}}/g, timestamp)
    .replace(/{{OPVERSION}}/g, versionInfo.opversion);
}

// CSS 处理
function compileCSS(versionInfo, timestamp) {
  try {
    const scssContent = readSourceFile(CONFIG.css.input);
    const scssWithVersion = replaceVersionPlaceholders(scssContent, versionInfo, timestamp);
    const result = sass.compileString(scssWithVersion, { style: 'expanded', charset: false });
    return result.css.replace(/@charset\s+["']UTF-8["'];?\s*/gi, '');
  } catch (error) {
    console.error('❌ CSS 编译失败:', error.message);
    return null;
  }
}

async function buildDevCSS(versionInfo, timestamp) {
  console.log('\n🎨 构建开发版 CSS...');
  const cssContent = compileCSS(versionInfo, timestamp);
  if (!cssContent) return false;
  
  ensureDir(CONFIG.css.outputDir);
  const outputPath = path.join(CONFIG.css.outputDir, CONFIG.css.devFile);
  fs.writeFileSync(outputPath, cssContent);
  console.log(`✅ 开发版 CSS: ${outputPath}`);
  return true;
}

async function buildProdCSS(versionInfo, timestamp) {
  console.log('\n🎨 构建生产版 CSS...');
  const cssContent = compileCSS(versionInfo, timestamp);
  if (!cssContent) return false;
  
  try {
    const compressedCSS = await compressWithAPI(cssContent, '/developers/cssminifier/api/raw');
    const header = replaceVersionPlaceholders(
      readHeader(CONFIG.css.input, CONFIG.css.headerLines),
      versionInfo,
      timestamp
    );
    const finalContent = header + '\n\n' + compressedCSS;
    
    ensureDir(CONFIG.css.outputDir);
    const outputPath = path.join(CONFIG.css.outputDir, CONFIG.css.prodFile);
    fs.writeFileSync(outputPath, finalContent);
    
    const stats = calculateCompression(cssContent, finalContent);
    console.log(`✅ 生产版 CSS: ${outputPath}`);
    console.log(`📊 压缩率: ${stats.ratio}% (${stats.originalKB}KB → ${stats.compressedKB}KB)`);
    return true;
  } catch (error) {
    console.error('❌ CSS 压缩失败:', error);
    return false;
  }
}

// JS 处理
async function buildProdJS(versionInfo, timestamp) {
  console.log('\n⚡ 构建生产版 JS...');
  const jsContent = readSourceFile(CONFIG.js.input);
  const jsWithVersion = replaceVersionPlaceholders(jsContent, versionInfo, timestamp)
    .replace(/MOE_VERSION/g, `"${versionInfo.version}"`);
  
  try {
    const compressedJS = await compressWithAPI(jsWithVersion, '/developers/javascript-minifier/api/raw');
    const header = replaceVersionPlaceholders(
      readHeader(CONFIG.js.input, CONFIG.js.headerLines),
      versionInfo,
      timestamp
    );
    const finalContent = header + '\n\n' + compressedJS;
    
    ensureDir(CONFIG.js.outputDir);
    const outputPath = path.join(CONFIG.js.outputDir, CONFIG.js.prodFile);
    fs.writeFileSync(outputPath, finalContent);
    
    const stats = calculateCompression(jsContent, finalContent);
    console.log(`✅ 生产版 JS: ${outputPath}`);
    console.log(`📊 压缩率: ${stats.ratio}% (${stats.originalKB}KB → ${stats.compressedKB}KB)`);
    return true;
  } catch (error) {
    console.error('❌ JS 压缩失败:', error);
    return false;
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  console.log('🚀 OpenList Moe 构建系统');
  console.log('='.repeat(50));
  
  const versionInfo = getPackageInfo();
  const timestamp = getBuildTimestamp();
  
  console.log(`📌 构建版本: v${versionInfo.version} (${timestamp}), OpenList: ${versionInfo.opversion}`);
  
  if (args.length === 0) {
    console.log('📦 默认模式: 只构建生产版');
    const cssSuccess = await buildProdCSS(versionInfo, timestamp);
    const jsSuccess = await buildProdJS(versionInfo, timestamp);
    
    if (cssSuccess && jsSuccess) {
      console.log('\n🎉 默认构建完成！');
    } else {
      console.log('\n⚠️  构建过程中出现错误');
      process.exit(1);
    }
    return;
  }
  
  const devCSS = args.includes('--dev-css');
  const prodCSS = args.includes('--prod-css');
  const prodJS = args.includes('--prod-js');
  
  if (devCSS || prodCSS || prodJS) {
    const results = [];
    if (devCSS) results.push(await buildDevCSS(versionInfo, timestamp));
    if (prodCSS) results.push(await buildProdCSS(versionInfo, timestamp));
    if (prodJS) results.push(await buildProdJS(versionInfo, timestamp));
    
    if (results.every(r => r !== false)) {
      console.log('\n🎉 指定任务完成！');
    } else {
      console.log('\n⚠️  部分任务执行失败');
    }
    return;
  }
  
  console.log('❓ 未知参数，使用默认模式');
  console.log('\n可用参数:');
  console.log('  --dev-css   构建开发版 CSS (未压缩)');
  console.log('  --prod-css  构建生产版 CSS (压缩)');
  console.log('  --prod-js   构建生产版 JS (压缩)');
  console.log('\n示例:');
  console.log('  npm run build          # 默认构建生产版');
  console.log('  npm run dev:css        # 构建未压缩CSS');
  console.log('  npm run prod:css       # 构建压缩CSS');
  console.log('  npm run prod:js        # 构建压缩JS');
}

main().catch(error => {
  console.error('\n💥 构建过程异常:', error);
  process.exit(1);
});