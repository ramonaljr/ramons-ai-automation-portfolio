const { chromium } = require('playwright')
;(async () => {
  const [svg, out] = process.argv.slice(2)
  const b = await chromium.launch({ channel: 'chrome' })
  const p = await b.newPage({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 2 })
  await p.goto('file://' + svg); await p.waitForTimeout(600)
  await p.screenshot({ path: out }); await b.close()
})()
