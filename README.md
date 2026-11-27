# Bolt Space · Lightning by Neesh

Bolt Space is the pixel storefront at the root of this repository. Serve the root with `python3 -m http.server 8000`. Open `http://localhost:8000/`. The shop has no build step or external runtime dependencies. The separate drawing collection lives at `/sketch/`.

## Updating the collection

Edit `collection.js`. The board shows the three original sticker identities. `#LBN-006` opens the tee, `#LBN-001` the tank and `#LBN-004` the socks. These IDs also preserve valid selections made in earlier versions. The browser ignores discontinued items. The artwork uses club blue `#1b46c2` and red `#c62e2e`.

To add photographs, put the files in the repository, for example in `products/photos/`. Set each product’s `photos` list to objects like the following, using real paths and accurate descriptions.

```js
photos: [
  { src: 'products/photos/tee-front.webp', alt: 'Front view of the Lightning tee' },
  { src: 'products/photos/tee-back.webp', alt: 'Back view of the Lightning tee' }
]
```

Photos appear inside the product view. Multiple photos get individual controls. The pixel sticker is the fallback when the list is empty or an image fails. The board and cart always use sticker art. Enter a numeric `price` in rupees when approved. The UI can display a unit price and cart subtotal. `null` displays the pre-launch pricing message. Add an optional factual `description`. To display measurements, supply `sizeGuide` with a `caption` that states the unit and measurement method, a `columns` array and a `rows` array of corresponding values. Replace preview sizes with confirmed variants at launch.

The pixel interface uses `bolt-shop.js` and `bolt.css`. The drawing edition uses `shop.js` and `style.css`. The original sticker generator is `scripts/make_art.py` (Pillow). The self-hosted display font license is in `assets/Bitcount-LICENSE.txt`.

## Before taking orders

The public pages describe the working, browser-only preview. The club has not supplied final sale terms or authorised payment collection. Complete the following for a Sri Lanka launch.

| Owner | What to settle | Where it belongs |
| --- | --- | --- |
| Neesh | Identify the actual seller and provide its trading/legal name, business or service address, monitored support email and phone, registration details where applicable, and a complaints contact. The existing club Instagram is the preview contact. | Contact page, sale terms, receipts and privacy notice |
| Neesh | Confirm the three final products, photos, colours, materials, care/safety guidance where relevant, fit measurements, sellable sizes, SKU stock, LKR prices and applicable taxes. | Product views and server-side catalogue |
| Neesh and courier | Decide delivery areas, charges, dispatch and delivery estimates, tracking or delay support, and responsibility for failed or damaged deliveries. | Delivery page and checkout summary |
| Neesh | Decide cancellation and practical withdrawal, change-of-mind returns, size exchanges, time limits, item condition, return postage and handling of faulty, damaged or incorrect goods. Confirm refund method, timing, any warranties and escalation route. Review any hygiene rule for socks against consumer rights. | Terms, delivery & returns, support procedure and receipt |
| Store operator | Select a host that permits commercial storefronts, the production domain, payment gateway, courier and transactional email provider. Verify the payment provider’s onboarding and policy rules. The GitHub Pages URL serves the non-transactional design preview. A new origin starts a new browser cart. | Hosting, support details and merchant onboarding |
| Store operator | Document each personal data field, purpose and lawful basis, who receives it, overseas processing and safeguards where applicable, retention/deletion periods and who handles privacy requests and incidents. Agree processor terms and access controls. Give the privacy notice when details are collected. Offer profile review/editing if accounts are introduced. | Privacy notice, checkout forms, processor arrangements and support |
| Backend | Validate variants, inventory, prices and delivery on the server. Present an editable order review with all charges, delivery and current terms before explicit confirmation. Use a provider-hosted payment flow and authenticated server notifications. Handle retries, duplicate callbacks and stock changes without charging or fulfilling twice. | Cart-to-order flow and payment backend |
| Backend and operations | Send a durable order record and itemised receipt with the actual total, payment, delivery, relevant policy terms and redress information. Support cancellation, fulfilment, refund and complaints. Test a successful order, a decline, a retry, an out-of-stock variant and a full refund before taking a payment from a customer. | Confirmation email, operations and end-to-end testing |

The browser cart stores product IDs, sizes and quantities on the device. It sends no buyer details or payments. A sale launch also requires replacing the preview messages and policies with the agreed live terms. Expose only the current terms at checkout and retain the accepted version with the order. If marketing messages are introduced, give customers a genuine opt-in/out choice. If reviews are offered, handle positive and negative feedback fairly and disclose incentives.

## Research notes · 27 November 2026

- Sri Lanka’s Consumer Affairs Authority Direction 91 applies to goods sold on a merchant’s own website. It covers clear offers and prices, a customer contact route, a privacy statement at data collection, a review before order confirmation, costs and delivery, a durable transaction record, and cancellation where appropriate and practicable. Its schedule also addresses after-sales terms, redress and product safety. [Official Gazette, 17 May 2023](https://documents.gov.lk/view/extra-gazettes/2023/5/2332-15_E.pdf)
- Gazette 2498/16 sets 1 January 2027 for sections 2 and 3 and Parts I and III of Sri Lanka’s Personal Data Protection Act. Check commencement notices again on the actual sale date. Map checkout data collection and contractors before switching them on. [Data Protection Authority commencement notice and downloads](https://www.dpa.gov.lk/) · [Official Gazette, 22 July 2026](https://documents.gov.lk/api/content-file-proxy?file=%2Fextra-gazette-content%2F2498-16_E_1785745588.pdf)
- The CAA offers a consumer complaints channel. [Complaints and hotline](https://www.caa.gov.lk/web/index.php?id=114&lang=en&option=com_content&view=article)
- GitHub Pages restricts hosting commercial storefronts and records visitor IP addresses for security. Review the host disclosure again when production moves. [Hosting limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) · [Hosting data collection](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection)
- If the club chooses PayHere, its merchant guidance asks for visible refund, privacy and terms pages. Merchant approval depends on the actual business and its final policies. [PayHere policy requirements](https://support.payhere.lk/policy-samples)
