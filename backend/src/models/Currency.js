const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, // ISO 4217
  name: { type: String, required: true },
  symbol: String,
  countries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Country' }],
  exchangeRates: [{
    baseCurrency: { type: String, default: 'USD' },
    rate: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now }
  }],
  formatting: {
    decimalPlaces: { type: Number, default: 2 },
    thousandsSeparator: { type: String, default: ',' },
    decimalSeparator: { type: String, default: '.' },
    symbolPosition: { type: String, enum: ['before', 'after'], default: 'before' }
  },
  status: { type: String, enum: ['active', 'inactive', 'deprecated'], default: 'active' },
  metadata: {
    centralBank: String,
    inflationRate: Number,
    isDigital: { type: Boolean, default: false },
    isCryptocurrency: { type: Boolean, default: false }
  }
}, { timestamps: true });

currencySchema.index({ code: 1 });
currencySchema.index({ status: 1 });

// Method to get exchange rate for a specific base currency
currencySchema.methods.getExchangeRate = function(baseCurrency = 'USD') {
  const rate = this.exchangeRates.find(r => r.baseCurrency === baseCurrency);
  return rate ? rate.rate : null;
};

// Method to convert amount from this currency to another
currencySchema.methods.convertTo = function(amount, targetCurrencyRate, baseCurrency = 'USD') {
  const fromRate = this.getExchangeRate(baseCurrency);
  if (!fromRate || !targetCurrencyRate) return null;
  
  // Convert to base currency first, then to target currency
  const baseAmount = amount / fromRate;
  return baseAmount * targetCurrencyRate;
};

module.exports = mongoose.model('Currency', currencySchema);