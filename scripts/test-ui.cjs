const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox']});try{for(const [width,height] of [[320,480],[390,844],[667,375],[844,390],[768,1024],[1440,900]]){
const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.SHOP_URL||'http://localhost:8000');await page.waitForSelector('.item');
const hand=await page.locator('body[data-edition="sketch"]').count();
const count=hand?11:3;assert.equal(await page.locator('.item').count(),count);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
if (!hand) {
  assert.deepEqual(await page.locator('.item').evaluateAll(items => items.map(item => item.getAttribute('aria-label'))), ['Tee', 'Tank', 'Socks']);
  assert.equal((await page.locator('#welcome').textContent()).trim(), 'you have entered bolt space');
  await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.querySelectorAll('.item img')].map(img => img.decode())]));
  const layout = await page.evaluate(() => {
    const board = document.querySelector('#board').getBoundingClientRect();
    const heading = document.querySelector('#welcome').getBoundingClientRect();
    const overlaps = a => a.left < heading.right && a.right > heading.left && a.top < heading.bottom && a.bottom > heading.top;
    const targets = [...document.querySelectorAll('.item')];
    return {
      centered: Math.abs(heading.left + heading.width / 2 - (board.left + board.width / 2)) < 2 &&
        Math.abs(heading.top + heading.height / 2 - (board.top + board.height / 2)) < 2,
      unreachable: targets.flatMap(target => {
        const rect = target.getBoundingClientRect();
        const hit = target.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
        return !overlaps(rect) && rect.top >= 0 && rect.bottom <= innerHeight && hit ? [] :
          [{piece: target.getAttribute('aria-label'), top: rect.top, bottom: rect.bottom, overlap: overlaps(rect), hit}];
      })
    };
  });
  assert(layout.centered, 'Welcome must be centred at ' + width);
  assert.deepEqual(layout.unreachable, [], 'Product targets must fit at ' + width);
}
if(hand){
 const obscured=await page.locator('.item').evaluateAll(items=>items.filter(item=>{
   const rect=item.querySelector('.art').getBoundingClientRect();
   const center=document.elementFromPoint((rect.left+rect.right)/2,(rect.top+rect.bottom)/2);
   return rect.left<0||rect.top<0||rect.right>innerWidth||rect.bottom>innerHeight||!item.contains(center);
 }).map(item=>item.getAttribute('aria-label')));
 assert.deepEqual(obscured,[], 'Every drawing must fit on screen and receive taps before scrolling');
 const drawing=await page.locator('#board h1').boundingBox();
 assert(Math.abs(drawing.x+drawing.width/2-width/2)<2);
 assert.equal(await page.locator('body > header').count(),0);
 assert(await page.locator('#board h1 img').evaluate(img=>img.complete&&img.naturalWidth&&img.src.endsWith('/ink/club-emblem.svg')));
 const expected=await page.evaluate(()=>matchMedia('(max-width:700px) and (orientation:portrait),(max-aspect-ratio:4/5)').matches?'tall-hand.webp':'wide-hand.webp');
 assert((await page.locator('#board').evaluate(el=>getComputedStyle(el).backgroundImage)).includes(expected));
 for(const [route,asset] of [['#LBN-003','detail-club.svg'],['#cart','cart-hand.svg']]){
   await page.goto(new URL(route,page.url()).href);
   await page.waitForSelector(route==='#cart'?'dialog[open] .cart':'dialog[open] .detail');
   const url=await page.locator('dialog').evaluate(el=>getComputedStyle(el).backgroundImage.match(/url\("?(.*?)"?\)/)[1]);
   assert(url.endsWith(asset));assert((await page.request.get(url)).ok());
 }
 await page.goto(process.env.SHOP_URL||'http://localhost:8000');

 assert(await page.locator('.item .art').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth&&img.src.includes('/hand/'))));
}
if(hand){
 const bandana=page.getByRole('button',{name:'Club bandana, Orange ink'});
 await bandana.click();assert.equal(await page.locator('#title').textContent(),'Club bandana');
 await page.locator('.buy').click();await page.locator('dialog .cart-button').click();
 assert.match(await page.locator('.line').innerText(),/One size/i);
 await page.getByRole('button',{name:'Remove item'}).click();
 await page.goto(process.env.SHOP_URL||'http://localhost:8000');
}
for(let i=0;i<count;i++){let item=page.locator('.item').nth(i);await item.click();await page.waitForSelector('dialog[open] .hero');await page.locator('.hero').evaluate(img=>img.decode());assert(await page.locator('.hero').evaluate(img=>img.naturalWidth>0));if(hand)assert((await page.locator('.hero').getAttribute('src')).endsWith('.svg'));await page.getByRole('button',{name:'← Back'}).click();await page.waitForSelector('dialog[open]',{state:'hidden'})}
await page.locator('.item').nth(hand?1:0).click();await page.getByRole('button',{name:'M',exact:true}).click();await page.locator('.buy').click();await page.locator('dialog .cart-button').click();assert((await page.locator('.line').innerText()).toUpperCase().includes('/ M'));await page.locator('#back').click();await page.getByRole('button',{name:'Next item'}).click();assert.equal((await page.locator('#title').innerText()).toUpperCase(),hand?'CREW SOCKS':'TANK');await page.keyboard.press('ArrowLeft');await page.keyboard.press('Escape');await page.waitForSelector('dialog[open]',{state:'hidden'});if (!hand && width === 390) await verifyPixelDetails(page);
assert.deepEqual(errors,[]);await page.close();console.log('PASS',width)}}
finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)})

async function verifyPixelDetails(page) {
  const root = new URL('./', page.url()).href;
  const key = 'lightning-merch-cart-v1';
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify([
    {id: 5, size: 'M', qty: 2}, {id: 1, size: 'One size', qty: 5}, {id: 0, size: 'invalid', qty: 2}
  ])), key);
  await page.goto(root + '#cart');
  await page.reload();
  assert.equal(await page.locator('.line').count(), 1);
  assert.match(await page.locator('.cart-note').innerText(), /payment open later/);
  await page.getByRole('button', {name: 'Increase quantity for Tee, M'}).click();
  await page.reload();
  assert.equal(await page.locator('.actions span').innerText(), '3');
  await page.getByRole('button', {name: 'Decrease quantity for Tee, M'}).click();
  await page.getByRole('button', {name: 'Remove Tee, M'}).click();
  assert.equal(await page.locator('.line').count(), 0);
  await page.getByRole('link', {name: 'Explore the collection'}).click();
  for (const [name, title] of [['Privacy', 'Privacy policy'], ['Terms', 'Terms & conditions'],
    ['Delivery & returns', 'Delivery & returns'], ['Contact', 'Contact the crew']]) {
    await page.locator('#store-footer').getByRole('link', {name, exact:true}).click();
    assert.equal(await page.locator('h1').textContent(), title);
    assert.equal(await page.locator('footer [aria-current="page"]').innerText(), name);
    await page.getByRole('link', {name:'← Collection'}).click();
  }
  // Fixture photos exercise the gallery before the client supplies photography.
  await page.route('**/collection.js*', async route => {
    const response = await route.fetch();
    await route.fulfill({response, body: await response.text() +
      ";boltCollection[0].photos = [{src:'products/06.png',alt:'Front fixture'}, {src:'products/01.png',alt:'Back fixture'}];" +
      "boltCollection[1].photos = [{src:'missing-fixture.webp',alt:'Missing fixture'}];"});
  });
  await page.route('**/missing-fixture.webp', route => route.fulfill({status:404, body:''}));
  await page.goto(root + '#LBN-006');
  await page.reload();
  assert.equal(await page.locator('.hero').getAttribute('alt'), 'Front fixture');
  await page.getByRole('button', {name:'Show photo 2: Back fixture'}).click();
  assert.equal(await page.locator('.hero').getAttribute('alt'), 'Back fixture');
  await page.getByRole('button', {name:'Next item'}).click();
  await page.waitForSelector('.hero.illustration');
  assert.match(await page.locator('.hero').getAttribute('alt'), /tank/);
  await page.keyboard.press('Escape');
}
