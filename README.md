# MarDani Luxe Store — starter website package

This is the first deployable storefront foundation for MarDani Luxe.

## Included
- Responsive luxury-inspired storefront
- Category filters and product search
- Shopping bag with quantity controls
- WhatsApp order enquiry handoff
- Netlify-ready static site

## Important before public launch
This is a **front-end starter**, not yet a complete production e-commerce system.
- `products.js` currently contains demonstration product names and prices. Replace them with verified live inventory and prices.
- `config.js` contains the WhatsApp contact number currently configured for the store. Confirm it before launch.
- Product images are CSS-generated placeholders. Replace with approved product photography.
- Orders are handed to WhatsApp; they are not yet saved in a database.
- No online card payment or automated bank-transfer verification is implemented.
- No staff admin dashboard or stock/expiry management is included yet.

The next development phase should connect a secure backend (for example Supabase) for product management, order records, stock controls and staff access. Payment integration should be added only after choosing and configuring a suitable payment provider. Never place secret API keys in browser-side files.

## Deploy on Netlify
1. Upload this folder to a GitHub repository, preserving the file structure.
2. In Netlify, choose **Add new project** → **Import an existing project**.
3. Connect GitHub and select `mardaniluxe-store`.
4. Build command: leave blank.
5. Publish directory: `.` (the repository root).
6. Deploy.

Netlify will publish a temporary `*.netlify.app` address. Connect the custom domain after the domain registration is completed.

## Editing products
Open `products.js`. Each product has:
- `id`: unique short identifier
- `name`: product name
- `category`: Skincare, Cosmetics, Fragrance, or Accessories
- `description`: short product description
- `price`: price in Nigerian naira, as a number
- `label`: short label shown on the product artwork

Use verified current prices and availability before launch.
