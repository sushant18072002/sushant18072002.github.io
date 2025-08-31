const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RUB: '₽',
  BRL: 'R$',
  MXN: '$',
  ARS: '$',
  CLP: '$',
  COP: '$',
  PEN: 'S/',
  KRW: '₩',
  THB: '฿',
  SGD: 'S$',
  MYR: 'RM',
  IDR: 'Rp',
  PHP: '₱',
  VND: '₫',
  AED: 'د.إ',
  SAR: '﷼',
  QAR: '﷼',
  KWD: 'د.ك',
  BHD: '.د.ب',
  OMR: '﷼',
  JOD: 'د.ا',
  LBP: '£',
  EGP: '£',
  MAD: 'د.م.',
  TND: 'د.ت',
  DZD: 'د.ج',
  ZAR: 'R',
  NGN: '₦',
  KES: 'KSh',
  GHS: '₵',
  XOF: 'CFA',
  XAF: 'FCFA',
  ETB: 'Br',
  UGX: 'USh',
  TZS: 'TSh',
  RWF: 'RF',
  MWK: 'MK',
  ZMW: 'ZK',
  BWP: 'P',
  SZL: 'L',
  LSL: 'L',
  NAD: 'N$',
  MZN: 'MT',
  AOA: 'Kz',
  CVE: '$',
  GMD: 'D',
  GNF: 'FG',
  LRD: 'L$',
  SLL: 'Le',
  STD: 'Db'
};

const CURRENCY_NAMES = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  SEK: 'Swedish Krona',
  NOK: 'Norwegian Krone',
  DKK: 'Danish Krone',
  PLN: 'Polish Zloty',
  CZK: 'Czech Koruna',
  HUF: 'Hungarian Forint',
  RUB: 'Russian Ruble',
  BRL: 'Brazilian Real',
  MXN: 'Mexican Peso',
  ARS: 'Argentine Peso',
  CLP: 'Chilean Peso',
  COP: 'Colombian Peso',
  PEN: 'Peruvian Sol',
  KRW: 'South Korean Won',
  THB: 'Thai Baht',
  SGD: 'Singapore Dollar',
  MYR: 'Malaysian Ringgit',
  IDR: 'Indonesian Rupiah',
  PHP: 'Philippine Peso',
  VND: 'Vietnamese Dong',
  AED: 'UAE Dirham',
  SAR: 'Saudi Riyal',
  QAR: 'Qatari Riyal',
  KWD: 'Kuwaiti Dinar',
  BHD: 'Bahraini Dinar',
  OMR: 'Omani Rial',
  JOD: 'Jordanian Dinar',
  LBP: 'Lebanese Pound',
  EGP: 'Egyptian Pound',
  MAD: 'Moroccan Dirham',
  TND: 'Tunisian Dinar',
  DZD: 'Algerian Dinar',
  ZAR: 'South African Rand',
  NGN: 'Nigerian Naira',
  KES: 'Kenyan Shilling',
  GHS: 'Ghanaian Cedi',
  XOF: 'West African CFA Franc',
  XAF: 'Central African CFA Franc',
  ETB: 'Ethiopian Birr',
  UGX: 'Ugandan Shilling',
  TZS: 'Tanzanian Shilling',
  RWF: 'Rwandan Franc',
  MWK: 'Malawian Kwacha',
  ZMW: 'Zambian Kwacha',
  BWP: 'Botswana Pula',
  SZL: 'Swazi Lilangeni',
  LSL: 'Lesotho Loti',
  NAD: 'Namibian Dollar',
  MZN: 'Mozambican Metical',
  AOA: 'Angolan Kwanza',
  CVE: 'Cape Verdean Escudo',
  GMD: 'Gambian Dalasi',
  GNF: 'Guinean Franc',
  LRD: 'Liberian Dollar',
  SLL: 'Sierra Leonean Leone',
  STD: 'São Tomé and Príncipe Dobra'
};

/**
 * Get currency symbol for a given currency code
 * @param {string} currencyCode - ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @returns {string} Currency symbol
 */
const getCurrencySymbol = (currencyCode) => {
  if (!currencyCode || typeof currencyCode !== 'string') {
    return '$'; // Default to USD symbol
  }
  
  const upperCode = currencyCode.toUpperCase();
  return CURRENCY_SYMBOLS[upperCode] || currencyCode;
};

/**
 * Get currency name for a given currency code
 * @param {string} currencyCode - ISO 4217 currency code
 * @returns {string} Currency name
 */
const getCurrencyName = (currencyCode) => {
  if (!currencyCode || typeof currencyCode !== 'string') {
    return 'US Dollar';
  }
  
  const upperCode = currencyCode.toUpperCase();
  return CURRENCY_NAMES[upperCode] || currencyCode;
};

/**
 * Format price with currency symbol
 * @param {number} amount - Price amount
 * @param {string} currencyCode - Currency code
 * @param {object} options - Formatting options
 * @returns {string} Formatted price string
 */
const formatPrice = (amount, currencyCode = 'USD', options = {}) => {
  const {
    showSymbol = true,
    showCode = false,
    decimals = 0,
    locale = 'en-US'
  } = options;
  
  if (!amount || isNaN(amount)) {
    return showSymbol ? `${getCurrencySymbol(currencyCode)}0` : '0';
  }
  
  const symbol = getCurrencySymbol(currencyCode);
  const formattedAmount = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(Math.round(amount));
  
  let result = '';
  if (showSymbol) {
    result = `${symbol}${formattedAmount}`;
  } else {
    result = formattedAmount;
  }
  
  if (showCode) {
    result += ` ${currencyCode.toUpperCase()}`;
  }
  
  return result;
};

/**
 * Get all supported currencies
 * @returns {Array} Array of currency objects with code, symbol, and name
 */
const getSupportedCurrencies = () => {
  return Object.keys(CURRENCY_SYMBOLS).map(code => ({
    code,
    symbol: CURRENCY_SYMBOLS[code],
    name: CURRENCY_NAMES[code]
  }));
};

/**
 * Validate currency code
 * @param {string} currencyCode - Currency code to validate
 * @returns {boolean} True if valid currency code
 */
const isValidCurrency = (currencyCode) => {
  if (!currencyCode || typeof currencyCode !== 'string') {
    return false;
  }
  return CURRENCY_SYMBOLS.hasOwnProperty(currencyCode.toUpperCase());
};

module.exports = {
  getCurrencySymbol,
  getCurrencyName,
  formatPrice,
  getSupportedCurrencies,
  isValidCurrency,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES
};