'use strict';

const products = new Map(boltCollection.map(product => [product.id, product]));
const board = document.querySelector('#board');
const dialog = document.querySelector('dialog');
const panel = document.querySelector('#panel');
const backButton = document.querySelector('#back');
const storageKey = 'lightning-merch-cart-v1';
const motionsOff = matchMedia('(prefers-reduced-motion: reduce)');
const currency = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' });
const chosenSizes = new Map();
const cartButtons = document.querySelectorAll('.cart-button');
let cart = [];
let returnFocus = null;
let productOnScreen = null;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(text, label, action) {
  const node = element('button', '', text);
  node.type = 'button';
  if (label) node.setAttribute('aria-label', label);
  node.addEventListener('click', action);
  return node;
}

function image(src, alt, className) {
  const node = element('img', className);
  node.alt = alt;
  node.draggable = false;
  node.src = src;
  return node;
}

function recoverCart(raw) {
  if (!raw) return [];
  let rows;
  try { rows = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(rows)) return [];
  const result = [];
  for (const row of rows) {
    if (!row || !products.get(row.id)?.sizes.includes(row.size) ||
        !Number.isSafeInteger(row.qty) || row.qty <= 0) continue;
    const existing = result.find(item => item.id === row.id && item.size === row.size);
    if (existing) existing.qty = Math.min(Number.MAX_SAFE_INTEGER, existing.qty + row.qty);
    else result.push({ id: row.id, size: row.size, qty: row.qty });
  }
  return result;
}

function readCart() {
  try { return recoverCart(localStorage.getItem(storageKey)); }
  catch { return cart; }
}

function showCount() {
  const count = cart.reduce((total, item) => total + item.qty, 0);
  for (const openCart of cartButtons) openCart.querySelector('b').textContent = '(' + count + ')';
}

let storageAvailable = true;
function changeQuantity(id, size, delta) {
  if (storageAvailable) cart = readCart();
  const existing = cart.find(item => item.id === id && item.size === size);
  if (existing) {
    existing.qty = delta === null ? 0 : Math.min(Number.MAX_SAFE_INTEGER, existing.qty + delta);
    if (existing.qty <= 0) cart = cart.filter(item => item !== existing);
  } else if (delta > 0) {
    cart.push({ id, size, qty: delta });
  }
  try {
    if (cart.length) localStorage.setItem(storageKey, JSON.stringify(cart));
    else localStorage.removeItem(storageKey);
  } catch { storageAvailable = false; }
  showCount();
}

function openPage(key) {
  if (location.hash === '#' + key) return;
  if (!dialog.open) returnFocus = document.activeElement;
  history.pushState({ bolt: true }, '', '#' + key);
  render();
}

function goBack() {
  if (history.state?.bolt) {
    history.back();
  } else {
    const url = new URL(location.href);
    url.hash = '';
    history.replaceState(null, '', url);
    render();
  }
}

function browseProduct(product, step) {
  const index = (boltCollection.indexOf(product) + step + boltCollection.length) % boltCollection.length;
  const next = boltCollection[index];
  history.replaceState(history.state, '', '#' + next.code);
  showProduct(next);
  panel.querySelector('[data-step="' + step + '"]').focus({ preventScroll: true });
}

function addGallery(stage, product) {
  const frame = element('figure', 'media-frame');
  const well = element('div', 'media-well');
  const hero = element('img', 'hero');
  hero.draggable = false;
  const caption = element('figcaption');
  const tabs = element('div', 'gallery-tabs');
  tabs.setAttribute('role', 'group');
  tabs.setAttribute('aria-label', 'Product photos');
  well.append(hero);
  frame.append(well, caption);
  stage.append(frame, tabs);
  const photos = (product.photos || []).filter(photo => photo.src && photo.alt);

  function select(index, keepFocus = false) {
    tabs.replaceChildren();
    tabs.hidden = photos.length < 2;
    if (!photos.length) {
      hero.onerror = null;
      hero.classList.add('illustration');
      hero.alt = 'Pixel illustration of the Lightning by Neesh ' + product.name.toLowerCase();
      hero.src = product.art;
      caption.textContent = 'Pixel illustration · product photos to follow';
      return;
    }
    const photo = photos[index];
    hero.classList.remove('illustration');
    hero.alt = photo.alt;
    hero.onerror = () => {
      photos.splice(index, 1);
      select(Math.max(0, Math.min(index, photos.length - 1)), keepFocus);
    };
    hero.src = photo.src;
    caption.textContent = photo.alt;
    if (photos.length < 2) return;
    photos.forEach((entry, i) => {
      const tab = button('', 'Show photo ' + (i + 1) + ': ' + entry.alt, () => select(i, true));
      tab.setAttribute('aria-pressed', String(i === index));
      tab.append(image(entry.src, '', ''));
      tabs.append(tab);
    });
    if (keepFocus) tabs.children[index].focus({ preventScroll: true });
  }
  select(0);
}

function addSizeGuide(order, product) {
  const guide = product.sizeGuide;
  if (!guide?.columns?.length || !guide.rows?.length) return;
  const details = element('details', 'fit-guide');
  details.append(element('summary', '', 'Size guide'));
  const table = element('table');
  table.append(element('caption', '', guide.caption || 'Garment measurements'));
  const head = table.createTHead().insertRow();
  for (const label of guide.columns) {
    const cell = element('th', '', label);
    cell.scope = 'col';
    head.append(cell);
  }
  const body = table.createTBody();
  for (const values of guide.rows) {
    const row = body.insertRow();
    values.forEach((value, i) => {
      const cell = element(i === 0 ? 'th' : 'td', '', value);
      if (i === 0) cell.scope = 'row';
      row.append(cell);
    });
  }
  details.append(table);
  order.append(details);
}

function animateSticker(product, from) {
  const hero = panel.querySelector('.hero.illustration');
  if (motionsOff.matches || !hero || !from?.width || from.bottom < 0 || from.top > innerHeight) return;
  const to = hero.getBoundingClientRect();
  if (!to.width || !to.height) return;
  const dx = from.x + from.width / 2 - to.x - to.width / 2;
  const dy = from.y + from.height / 2 - to.y - to.height / 2;
  const scale = Math.min(from.width / to.width, from.height / to.height);
  const art = board.querySelector('[data-product-id="' + product.id + '"]');
  const angle = getComputedStyle(art).getPropertyValue('--r');
  hero.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + angle + ') scale(' + scale + ')' },
    { transform: 'rotate(-6deg)' }], { duration: 310, easing: 'cubic-bezier(.2,.8,.18,1)' });
}

function showProduct(product, from) {
  productOnScreen = product;
  panel.className = 'detail';
  panel.replaceChildren();
  const stage = element('div', 'stage');
  addGallery(stage, product);
  const nav = element('nav', 'piece-nav');
  nav.setAttribute('aria-label', 'Browse the collection');
  const previous = button('←', 'Previous item', () => browseProduct(product, -1));
  const next = button('→', 'Next item', () => browseProduct(product, 1));
  previous.dataset.step = '-1';
  next.dataset.step = '1';
  nav.append(previous, element('span', '', (boltCollection.indexOf(product) + 1) + ' / ' + boltCollection.length), next);
  stage.append(nav);

  const info = element('div', 'info');
  const title = element('h1', '', product.name);
  title.id = 'title';
  info.append(element('div', 'code', product.code), title);
  if (product.description) info.append(element('p', '', product.description));
  const hasPrice = Number.isFinite(product.price);
  info.append(element('p', hasPrice ? 'price' : 'price-pending', hasPrice ? currency.format(product.price) : 'Pricing at launch.'));
  const order = element('div', 'order');
  order.append(element('div', 'size-label', 'Size preview'));
  const sizes = element('div', 'sizes');
  sizes.setAttribute('role', 'group');
  sizes.setAttribute('aria-label', 'Size');
  let size = chosenSizes.get(product.id) || product.sizes[0];
  for (const option of product.sizes) {
    if (product.sizes.length === 1) {
      sizes.append(element('span', '', option));
      continue;
    }
    const pick = button(option, '', () => {
      size = option;
      chosenSizes.set(product.id, option);
      for (const control of sizes.children) control.setAttribute('aria-pressed', String(control === pick));
    });
    pick.setAttribute('aria-pressed', String(option === size));
    sizes.append(pick);
  }
  order.append(sizes);
  addSizeGuide(order, product);
  const add = button('Add to cart', '', () => {
    changeQuantity(product.id, size, 1);
    add.textContent = 'Added ✓';
    add.disabled = true;
    setTimeout(() => { add.textContent = 'Add to cart'; add.disabled = false; }, 650);
  });
  add.className = 'buy';
  add.setAttribute('aria-live', 'polite');
  order.append(add, element('p', 'cart-note', 'Preview cart only. Orders open later.'));
  info.append(order);
  panel.append(stage, info);
  animateSticker(product, from);
}

function showCart() {
  productOnScreen = null;
  panel.className = 'cart';
  panel.replaceChildren();
  const title = element('h1', '', 'Your cart');
  title.id = 'title';
  panel.append(title);
  if (!cart.length) {
    panel.append(element('p', '', 'Your cart is empty.'));
    const shop = element('a', 'primary-link', 'Explore the collection');
    shop.href = './';
    panel.append(shop);
    return;
  }
  for (const [index, row] of cart.entries()) {
    const product = products.get(row.id);
    const line = element('div', 'line');
    const summary = element('div', 'line-summary');
    const name = product.name + ', ' + row.size;
    summary.append(element('div', 'line-name', product.name), element('small', '', 'Size / ' + row.size));
    if (Number.isFinite(product.price)) summary.append(element('small', '', currency.format(product.price * row.qty)));
    const actions = element('div', 'actions');
    function edit(delta, controlIndex) {
      changeQuantity(row.id, row.size, delta);
      showCart();
      const nearest = panel.querySelectorAll('.line')[Math.min(index, cart.length - 1)];
      (nearest?.querySelectorAll('button')[controlIndex] || panel.querySelector('.primary-link') || backButton).focus();
    }
    const quantity = element('span', '', row.qty);
    quantity.setAttribute('aria-label', 'Quantity ' + row.qty);
    actions.append(button('−', 'Decrease quantity for ' + name, () => edit(-1, 0)), quantity,
      button('+', 'Increase quantity for ' + name, () => edit(1, 1)),
      button('×', 'Remove ' + name, () => edit(null, 2)));
    line.append(image(product.art, '', ''), summary, actions);
    panel.append(line);
  }
  if (cart.every(row => Number.isFinite(products.get(row.id).price))) {
    const subtotal = cart.reduce((sum, row) => sum + products.get(row.id).price * row.qty, 0);
    panel.append(element('p', '', 'Subtotal · ' + currency.format(subtotal)));
  }
  panel.append(element('p', 'cart-note', 'This cart is saved in this browser. Ordering and payment open later.'));
}

function render() {
  const key = location.hash.slice(1);
  const product = boltCollection.find(item => item.code === key);
  if (!product && key !== 'cart') {
    productOnScreen = null;
    if (dialog.open) {
      dialog.close();
      (returnFocus?.isConnected ? returnFocus : board.querySelector('.item')).focus({ preventScroll: true });
    }
    return;
  }
  const sticker = product && !dialog.open ? board.querySelector('[data-product-id="' + product.id + '"] .art') : null;
  const from = sticker?.getBoundingClientRect();
  if (!dialog.open) dialog.showModal();
  dialog.querySelector('.cart-button').hidden = !product;
  if (product) showProduct(product, from);
  else showCart();
  dialog.scrollTop = 0;
  backButton.focus({ preventScroll: true });
}

for (const product of boltCollection) {
  const tile = button('', product.name, () => openPage(product.code));
  tile.className = 'item';
  tile.dataset.productId = product.id;
  tile.append(image(product.art, '', 'art'), element('span', 'item-name', product.name));
  tile.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || motionsOff.matches) return;
    const bounds = tile.getBoundingClientRect();
    tile.style.setProperty('--dx', ((event.clientX - bounds.left) / bounds.width - .5) * 8 + 'px');
  });
  tile.addEventListener('pointerleave', () => tile.style.removeProperty('--dx'));
  board.append(tile);
}

// The highlight snaps to the same crossing as the board's centred CSS tile.
const glint = element('span', 'grid-glint');
glint.setAttribute('aria-hidden', 'true');
glint.hidden = true;
board.prepend(glint);
board.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || motionsOff.matches || event.target.closest('.item')) {
    glint.hidden = true;
    return;
  }
  const rect = board.getBoundingClientRect();
  const snap = (value, size) => Math.round((value - size / 2) / 34) * 34 + size / 2 - 3;
  glint.style.left = snap(event.clientX - rect.left, rect.width) + 'px';
  glint.style.top = snap(event.clientY - rect.top, rect.height) + 'px';
  glint.hidden = false;
});
board.addEventListener('pointerleave', () => { glint.hidden = true; });

for (const child of document.querySelector('#store-footer').children) {
  dialog.querySelector('.dialog-foot').append(child.cloneNode(true));
}
backButton.addEventListener('click', goBack);
dialog.addEventListener('cancel', event => { event.preventDefault(); goBack(); });
dialog.addEventListener('keydown', event => {
  if (!productOnScreen || event.altKey || event.ctrlKey || event.metaKey ||
      event.target.closest('.gallery-tabs') || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  browseProduct(productOnScreen, event.key === 'ArrowLeft' ? -1 : 1);
});
for (const openCart of cartButtons) openCart.addEventListener('click', () => openPage('cart'));
window.addEventListener('hashchange', render);
window.addEventListener('storage', event => {
  if (event.key !== storageKey && event.key !== null) return;
  cart = readCart();
  showCount();
  if (dialog.open && location.hash === '#cart') showCart();
});
cart = readCart();
showCount();
render();
