# Cypht Config Generator
This little script generates a utility website for [Cypht](https://github.com/cypht-org/cypht) using Eleventy:
- It downloads the latest version of Cypht config files and parses them *([index.11tydata.mjs](index.11tydata.mjs))*
- That data is turned into an easy to fill out HTML form with the correct defaults set *([index.html](index.html))*
- Hides form parts when logical (e.g. `IMAP_AUTH_*` settings are only shown if `AUTH_TYPE == "IMAP"`) *([form.js](form.js))*
- Generates a complete .env configuration based on that form in one click 

Basically, a rather self-updatable site to help you configure Cypht instances.

## How-to
### Build locally
This requires git & Node.js to be installed on your system.

```bash
git clone https://github.com/Denperidge/cypht-config-generator.git
cd cypht-config-generator
npm install
npm start  # Run live server

npm run build  # Build to dist/
```

