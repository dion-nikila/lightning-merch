'use strict';

// IDs and codes also identify existing saved carts and product bookmarks.
// Photos belong only to the detail view. See README for an example.
const topSizes = ['S', 'M', 'L', 'XL'];
const boltCollection = [
  { id: 5, name: 'Tee', sizes: topSizes, price: null, photos: [] },
  { id: 0, name: 'Tank', sizes: topSizes, price: null, photos: [] },
  { id: 3, name: 'Socks', sizes: ['One size'], price: null, photos: [] }
].map(product => {
  const number = String(product.id + 1);
  return {
    ...product,
    code: 'LBN-' + number.padStart(3, '0'),
    art: 'products/' + number.padStart(2, '0') + '.png?v=bolt1'
  };
});
