const CURRENT_PRICES = {
  'BTC': 64120.00,
  'ETH': 3480.50,
  'BNB': 585.40,
  'SOL': 154.20,
  'XRP': 0.60,
  'ADA': 0.38,
  'DOGE': 0.16,
  'AVAX': 30.00,
  'LINK': 14.50,
  'DOT': 6.20,
  'MATIC': 0.70,
  'LTC': 85.00,
  'SHIB': 0.00002,
  'BCH': 450.00,
  'UNI': 7.80,
  'TRX': 0.11,
  'NEAR': 6.50,
  'APT': 8.20,
  'ARB': 1.10,
  'FIL': 5.80,
  'FET': 2.10,
  'RNDR': 9.50,
  'GRT': 0.30,
  'IMX': 2.20,
  'GALA': 0.04,
  'ENJ': 0.30,
  'PEPE': 0.000008
};

function getAssetPrice(symbol) {
  return CURRENT_PRICES[symbol.toUpperCase()] || 1.0;
}

module.exports = {
  CURRENT_PRICES,
  getAssetPrice
};
