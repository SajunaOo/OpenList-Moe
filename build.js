const sass = require('sass');
const fs = require('fs');
const https = require('https');
const path = require('path');

// ================== 配置 ==================
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

// ================== 工具函数 ==================

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 读取头部注释
function readHeader(sourcePath, headerLines) {
  try {
    if (!fs.existsSync(sourcePath)) {
      console.warn(`⚠️  源文件不存在: ${sourcePath}`);
      return '';
    }
    
    const content = fs.readFileSync(sourcePath, 'utf-8');
    const lines = content.split('\n');
    return lines.slice(0, headerLines).join('\n');
  } catch (error) {
    console.error(`❌ 读取文件失败 ${sourcePath}:`, error.message);
    return '';
  }
}

// 通用压缩函数
function compressWithAPI(content, apiPath) {
  return new Promise((resolve, reject) => {
    const postData = 'input=' + encodeURIComponent(content);
    
    const options = {
      hostname: 'www.toptal.com',
      path: apiPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(`API 错误 ${res.statusCode}: ${data.substring(0, 100)}`);
        }
      });
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

// 计算压缩率
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

// ================== CSS 处理 ==================

// 编译 CSS（去除 @charset）
function compileCSS() {
  try {
    const result = sass.compile(CONFIG.css.input, { 
      style: 'expanded',
      charset: false
    });
    
    return result.css.replace(/@charset\s+["']UTF-8["'];?\s*/gi, '');
  } catch (error) {
    console.error(`❌ CSS 编译失败:`, error.message);
    return null;
  }
}

// 构建开发版 CSS（非压缩）
async function buildDevCSS() {
  console.log('\n🎨 构建开发版 CSS (未压缩)...');
  
  const cssContent = compileCSS();
  if (!cssContent) return false;
  
  ensureDir(CONFIG.css.outputDir);
  const outputPath = path.join(CONFIG.css.outputDir, CONFIG.css.devFile);
  
  fs.writeFileSync(outputPath, cssContent);
  console.log(`✅ 开发版 CSS: ${outputPath}`);
  
  return true;
}

// 构建生产版 CSS（压缩）
async function buildProdCSS() {
  console.log('\n🎨 构建生产版 CSS (压缩)...');
  
  console.log('🔨 编译 CSS...');
  const cssContent = compileCSS();
  if (!cssContent) return false;
  
  const header = readHeader(CONFIG.css.input, CONFIG.css.headerLines);
  
  console.log('📡 调用 CSS Minifier API...');
  try {
    const compressedCSS = await compressWithAPI(cssContent, '/developers/cssminifier/api/raw');
    const finalContent = header + '\n\n' + compressedCSS;
    
    ensureDir(CONFIG.css.outputDir);
    const outputPath = path.join(CONFIG.css.outputDir, CONFIG.css.prodFile);
    fs.writeFileSync(outputPath, finalContent);
    
    const stats = calculateCompression(cssContent, finalContent);
    console.log(`✅ 生产版 CSS: ${outputPath}`);
    console.log(`📊 压缩率: ${stats.ratio}% (${stats.originalKB}KB → ${stats.compressedKB}KB)`);
    
    return true;
  } catch (error) {
    console.error(`❌ CSS 压缩失败: ${error}`);
    return false;
  }
}

// ================== JS 处理 ==================

// 读取 JS 文件
function readJSFile() {
  try {
    if (!fs.existsSync(CONFIG.js.input)) {
      console.log(`⚠️  JS 文件不存在: ${CONFIG.js.input}`);
      return null;
    }
    return fs.readFileSync(CONFIG.js.input, 'utf-8');
  } catch (error) {
    console.error(`❌ 读取 JS 文件失败:`, error.message);
    return null;
  }
}

// 构建生产版 JS（压缩）
async function buildProdJS() {
  console.log('\n⚡ 构建生产版 JS (压缩)...');
  
  console.log('📄 读取 JS...');
  const jsContent = readJSFile();
  if (!jsContent) {
    console.log('⏭️  跳过 JS 处理');
    return false;
  }
  
  const header = readHeader(CONFIG.js.input, CONFIG.js.headerLines);
  
  console.log('📡 调用 JavaScript Minifier API...');
  try {
    const compressedJS = await compressWithAPI(jsContent, '/developers/javascript-minifier/api/raw');
    const finalContent = header + '\n\n' + compressedJS;
    
    ensureDir(CONFIG.js.outputDir);
    const outputPath = path.join(CONFIG.js.outputDir, CONFIG.js.prodFile);
    fs.writeFileSync(outputPath, finalContent);
    
    const stats = calculateCompression(jsContent, finalContent);
    console.log(`✅ 生产版 JS: ${outputPath}`);
    console.log(`📊 压缩率: ${stats.ratio}% (${stats.originalKB}KB → ${stats.compressedKB}KB)`);
    
    return true;
  } catch (error) {
    console.error(`❌ JS 压缩失败: ${error}`);
    return false;
  }
}

// ================== 命令行解析 ==================

async function main() {
  const args = process.argv.slice(2);
  
  console.log('🚀 OpenList Moe 构建系统');
  console.log('='.repeat(50));
  
  // 如果没有参数，默认只构建生产版 CSS 和 JS
  if (args.length === 0) {
    console.log('📦 默认模式: 只构建生产版');
    
    const cssSuccess = await buildProdCSS();
    const jsSuccess = await buildProdJS();
    
    if (cssSuccess && jsSuccess) {
      console.log('\n🎉 默认构建完成！');
    } else {
      console.log('\n⚠️  构建过程中出现错误');
      process.exit(1);
    }
    return;
  }
  
  // 处理特定模式
  let devCSS = args.includes('--dev-css');
  let prodCSS = args.includes('--prod-css');
  let prodJS = args.includes('--prod-js');
  
  // 如果指定了特定任务
  if (devCSS || prodCSS || prodJS) {
    const results = [];
    
    if (devCSS) {
      results.push(await buildDevCSS());
    }
    
    if (prodCSS) {
      results.push(await buildProdCSS());
    }
    
    if (prodJS) {
      results.push(await buildProdJS());
    }
    
    if (results.every(r => r !== false)) {
      console.log('\n🎉 指定任务完成！');
    } else {
      console.log('\n⚠️  部分任务执行失败');
    }
    return;
  }
  
  // 显示帮助信息
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

// ================== 启动 ==================

main().catch(error => {
  console.error('\n💥 构建过程异常:', error);
  process.exit(1);
});