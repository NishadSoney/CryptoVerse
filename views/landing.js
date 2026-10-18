const fs = require('fs');
const path = require('path');

let landingHtmlCache = null;

function renderLanding() {
  if (!landingHtmlCache) {
    const indexPath = path.join(__dirname, '..', 'index.php');
    if (fs.existsSync(indexPath)) {
      landingHtmlCache = fs.readFileSync(indexPath, 'utf-8');
    } else {
      landingHtmlCache = '<h1>CryptoVerse Landing</h1>';
    }
  }
  return landingHtmlCache;
}

module.exports = {
  renderLanding
};
