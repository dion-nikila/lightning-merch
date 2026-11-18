const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox']});try{for(const [width,height] of [[320,480],[390,844],[667,375],[844,390],[768,1024],[1440,900]]){
const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.SHOP_URL||'http://localhost:8000');await page.waitForSelector('.item');
assert.equal(await page.locator('.item').count(),11);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
if(await page.locator('body[data-edition="sketch"]').count()){
 const obscured=await page.locator('.item').evaluateAll(items=>items.filter(item=>{
   const rect=item.querySelector('.art').getBoundingClientRect();
   const center=document.elementFromPoint((rect.left+rect.right)/2,(rect.top+rect.bottom)/2);
   return rect.left<0||rect.top<0||rect.right>innerWidth||rect.bottom>innerHeight||!item.contains(center);
 }).map(item=>item.getAttribute('aria-label')));
 assert.deepEqual(obscured,[], 'Every drawing must fit on screen and receive taps before scrolling');
 const drawing=await page.locator('#board h1').boundingBox();
 assert(Math.abs(drawing.x+drawing.width/2-width/2)<2);
 assert.equal(await page.locator('body > header').count(),0);
 assert(await page.locator('#board h1 img').evaluate(img=>img.complete&&img.naturalWidth&&img.src.endsWith('/ink/club-logo.jpg')));
 const expected=await page.evaluate(()=>matchMedia('(max-width:700px) and (orientation:portrait),(max-aspect-ratio:4/5)').matches?'tall-club.webp':'wide-club.webp');
 assert((await page.locator('#board').evaluate(el=>getComputedStyle(el).backgroundImage)).includes(expected));
 for(const [route,asset] of [['#LBN-001','detail-club.svg'],['#cart','cart-club.svg']]){
   await page.goto(new URL(route,page.url()).href);
   await page.waitForSelector(route==='#cart'?'dialog[open] .cart':'dialog[open] .detail');
   const url=await page.locator('dialog').evaluate(el=>getComputedStyle(el).backgroundImage.match(/url\("?(.*?)"?\)/)[1]);
   assert(url.endsWith(asset));assert((await page.request.get(url)).ok());
 }
 await page.goto(process.env.SHOP_URL||'http://localhost:8000');

 assert(await page.locator('.item .art').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth&&img.src.includes('/ink/'))));
}
for(let i=0;i<11;i++){let item=page.locator('.item').nth(i);await item.click();await page.waitForSelector('dialog[open] .hero');assert(await page.locator('.hero').evaluate(img=>img.complete&&img.naturalWidth>0));await page.getByRole('button',{name:'← Back'}).click();await page.waitForSelector('dialog[open]',{state:'hidden'})}
await page.locator('.item').first().click();await page.getByRole('button',{name:'M',exact:true}).click();await page.locator('.buy').click();await page.locator('dialog .cart-button').click();assert((await page.locator('.line').innerText()).toUpperCase().includes('/ M'));await page.locator('#back').click();await page.getByRole('button',{name:'Next item'}).click();assert.equal((await page.locator('#title').innerText()).toUpperCase(),'CLUB CAP');await page.keyboard.press('ArrowLeft');await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});assert.deepEqual(errors,[]);await page.close();console.log('PASS',width)}}
finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)})
