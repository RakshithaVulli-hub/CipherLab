import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const PORT = 5178;
const DIST_DIR = path.resolve('dist');
const SCREENSHOTS_DIR = path.resolve('screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function startServer() {
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    let filePath = path.join(DIST_DIR, reqPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading ' + reqPath);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function captureAll() {
  const server = await startServer();

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });

  const page = await browser.newPage();

  // Suppress auto-tour on new documents
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('cipherlab_tour_seen', 'true');
  });

  const dismissTour = async () => {
    await page.evaluate(() => {
      localStorage.setItem('cipherlab_tour_seen', 'true');
    });
  };

  console.log('\n--- Capturing Desktop (1920x1080) Screenshots ---');
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const views = [
    { name: 'desktop_01_home', url: `http://localhost:${PORT}/?tab=home` },
    { name: 'desktop_02_lab_caesar', url: `http://localhost:${PORT}/?tab=lab&cipher=caesar` },
    { name: 'desktop_03_lab_vigenere', url: `http://localhost:${PORT}/?tab=lab&cipher=vigenere` },
    { name: 'desktop_04_rsa_classroom', url: `http://localhost:${PORT}/?tab=rsa` },
    { name: 'desktop_05_breakit_caesar', url: `http://localhost:${PORT}/?tab=breakit` },
    { name: 'desktop_06_story', url: `http://localhost:${PORT}/?tab=story` },
    { name: 'desktop_07_compare', url: `http://localhost:${PORT}/?tab=compare` },
    { name: 'desktop_08_quiz', url: `http://localhost:${PORT}/?tab=quiz` },
    { name: 'desktop_09_diffie_hellman', url: `http://localhost:${PORT}/?tab=dh` }
  ];

  for (const v of views) {
    await page.goto(v.url, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600)); // wait for transitions
    const outPath = path.join(SCREENSHOTS_DIR, `${v.name}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`Saved ${v.name}.png`);
  }

  // Desktop Tour modal
  console.log('Capturing Desktop Guided Tour...');
  await page.goto(`http://localhost:${PORT}/?tab=lab`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Start first-run guided tour"]');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 800)); // wait for tour popup
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'desktop_10_tour.png') });
  console.log('Saved desktop_10_tour.png');

  // Desktop Glossary modal
  console.log('Capturing Desktop Glossary Modal...');
  await page.goto(`http://localhost:${PORT}/?tab=lab`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('button[title*="Glossary"]', { timeout: 3000 });
  await page.click('button[title*="Glossary"]');
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'desktop_11_glossary.png') });
  console.log('Saved desktop_11_glossary.png');

  console.log('\n--- Capturing Mobile (390x844) Screenshots ---');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  const mobileViews = [
    { name: 'mobile_01_home', url: `http://localhost:${PORT}/?tab=home` },
    { name: 'mobile_02_lab', url: `http://localhost:${PORT}/?tab=lab` },
    { name: 'mobile_03_rsa', url: `http://localhost:${PORT}/?tab=rsa` },
    { name: 'mobile_04_breakit', url: `http://localhost:${PORT}/?tab=breakit` },
    { name: 'mobile_05_story', url: `http://localhost:${PORT}/?tab=story` },
    { name: 'mobile_06_compare', url: `http://localhost:${PORT}/?tab=compare` },
    { name: 'mobile_07_quiz', url: `http://localhost:${PORT}/?tab=quiz` },
    { name: 'mobile_08_diffie_hellman', url: `http://localhost:${PORT}/?tab=dh` }
  ];

  for (const v of mobileViews) {
    await page.goto(v.url, { waitUntil: 'networkidle0' });
    await dismissTour();
    await new Promise((r) => setTimeout(r, 600));
    const outPath = path.join(SCREENSHOTS_DIR, `${v.name}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`Saved ${v.name}.png`);
  }

  // Mobile Menu Open
  console.log('Capturing Mobile Navigation Menu...');
  await page.goto(`http://localhost:${PORT}/?tab=home`, { waitUntil: 'networkidle0' });
  await dismissTour();
  await page.waitForSelector('button[aria-label="Toggle navigation menu"]', { timeout: 3000 });
  await page.click('button[aria-label="Toggle navigation menu"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile_08_menu_open.png') });
  console.log('Saved mobile_08_menu_open.png');

  // Mobile Glossary
  console.log('Capturing Mobile Glossary Modal...');
  await page.goto(`http://localhost:${PORT}/?tab=lab`, { waitUntil: 'networkidle0' });
  await dismissTour();
  // Open mobile menu then click glossary, or click glossary if visible
  const glossaryInMenu = await page.$('button[aria-label="Toggle navigation menu"]');
  if (glossaryInMenu) {
    await glossaryInMenu.click();
    await new Promise((r) => setTimeout(r, 400));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const gl = btns.find((b) => b.textContent && b.textContent.includes('Glossary'));
      if (gl) gl.click();
    });
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile_09_glossary.png') });
    console.log('Saved mobile_09_glossary.png');
  }

  await browser.close();
  server.close();
  console.log('\nAll screenshots captured successfully!');
}

captureAll().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
