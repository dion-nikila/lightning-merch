const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox']});try{for(const width of [320,390,768,1440]){
const page=await browser.newPage({viewport:{width,height:850},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.SHOP_URL||'http://localhost:8000');await page.waitForSelector('.item');
assert.equal(await page.locator('.item').count(),11);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
for(let i=0;i<11;i++){let item=page.locator('.item').nth(i);await item.click();await page.waitForSelector('dialog[open] .hero');assert(await page.locator('.hero').evaluate(img=>img.complete&&img.naturalWidth>0));await page.getByRole('button',{name:'← Back'}).click();await page.waitForSelector('dialog[open]',{state:'hidden'})}
await page.locator('.item').first().click();await page.getByRole('button',{name:'M',exact:true}).click();await page.locator('.buy').click();await page.locator('dialog .cart-button').click();assert((await page.locator('.line').innerText()).toUpperCase().includes('/ M'));await page.locator('#back').click();await page.getByRole('button',{name:'Next item'}).click();assert.equal((await page.locator('#title').innerText()).toUpperCase(),'CLUB CAP');await page.keyboard.press('ArrowLeft');await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});assert.deepEqual(errors,[]);await page.close();console.log('PASS',width)}}
finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)})
