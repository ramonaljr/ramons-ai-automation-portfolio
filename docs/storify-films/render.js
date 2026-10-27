// Renders one built film to MP4. From the storify skill's "MP4 rendering"
// section, with begin(1) so the site's films come out at 720p (the default
// 1.5 gives 1080p).
//
// Needs Playwright and ffmpeg, kept out of the site's dependencies on purpose:
//   cd <scratch> && npm i playwright && npx playwright install chromium
//   node build.js <slug>                       (in this folder first)
//   node render.js out/<slug>.html <slug>.mp4
// Then make the web copy: two-pass x264 -b:v 380k, AAC 96k, and the poster
// from the frame at t=15s (-q:v 3). See docs/storify-film-plans.md.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const [,, film, out, maxArg, fontDir] = process.argv;
const FPS = 30, MAX = maxArg ? +maxArg : 600, TAIL = 2;
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } });
  page.on('pageerror', e => console.error('pageerror', e.message));
  await page.goto('file://' + path.resolve(film));
  if (fontDir) { // local font files, for environments that can't reach Google Fonts
    const faces = fs.readdirSync(fontDir).filter(f => /\.(ttf|otf|woff2?)$/.test(f)).map(f => {
      const fam = /patrick/i.test(f) ? 'Patrick Hand' : /plex/i.test(f) ? 'IBM Plex Mono' : null;
      const wt = /semibold/i.test(f) ? 600 : /medium/i.test(f) ? 500 : 400;
      return fam && `@font-face{font-family:"${fam}";font-weight:${wt};src:url("file://${path.resolve(fontDir, f)}");}`;
    }).filter(Boolean).join('\n');
    await page.addStyleTag({ content: faces });
  }
  await page.evaluate(async () => { try { await document.fonts.load('26px "Patrick Hand"'); await document.fonts.load('600 12px "IBM Plex Mono"'); } catch (e) {} });
  await page.waitForTimeout(800);
  const tmpV = out.replace(/\.mp4$/, '.video.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-crf', '20', tmpV]);
  ff.stderr.on('data', d => process.stderr.write(d));
  await page.evaluate(() => window.__storify.begin(1));
  let frames = 0, endAt = null; const t0 = Date.now();
  while (true) {
    const done = await page.evaluate(ms => window.__storify.step(ms), 1000 / FPS);
    const b64 = await page.evaluate(() => window.__storify.frame(.9));
    const buf = Buffer.from(b64, 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    frames++;
    if (done && endAt === null) endAt = frames + TAIL * FPS;
    if ((endAt !== null && frames >= endAt) || frames >= MAX * FPS) break;
    if (frames % 300 === 0) console.log(`${frames / FPS}s rendered (${((Date.now() - t0) / 1000).toFixed(0)}s wall)`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  const dur = frames / FPS;
  console.log('video frames', frames, 'duration', dur.toFixed(2));
  const wav = await page.evaluate(d => window.__storify.audio(d), dur);
  const tmpA = out.replace(/\.mp4$/, '.wav'); fs.writeFileSync(tmpA, Buffer.from(wav, 'base64'));
  await browser.close();
  await new Promise((res, rej) => { const m = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmpV, '-i', tmpA, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out]);
    m.stderr.on('data', d => process.stderr.write(d)); m.on('close', c => c ? rej(new Error('mux failed')) : res()); });
  fs.unlinkSync(tmpV); fs.unlinkSync(tmpA);
  console.log('wrote', out, 'in', ((Date.now() - t0) / 1000).toFixed(0), 's');
})().catch(e => { console.error(e); process.exit(1); });
