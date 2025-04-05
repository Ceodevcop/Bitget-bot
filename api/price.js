const BitgetAPI = require('../lib/bitget');

module.exports = async (req, res) => {
  try {
    // Verify API key
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.APP_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { symbol } = req.query;
    const bitget = new BitgetAPI(
      process.env.BITGET_API_KEY,
      process.env.BITGET_SECRET,
      process.env.BITGET_PASSPHRASE
    );
    
    const priceData = await bitget.getTicker(symbol);
    res.json({ 
      symbol,
      price: parseFloat(priceData.close),
      high: parseFloat(priceData.high24h),
      low: parseFloat(priceData.low24h),
      volume: parseFloat(priceData.baseVol)
    });
  } catch (error) {
    console.error('Price API error:', error);
    res.status(500).json({ error: error.message });
  }
};
