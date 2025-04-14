const BitgetAPI = require('../lib/bitget');

module.exports = async (req, res) => {
  try {
    // Initialize with runtime environment variables
    const bitget = new BitgetAPI(
      process.env.BITGET_API_KEY,
      process.env.BITGET_API_SECRET, 
      process.env.BITGET_PASSPHRASE
    );

    const { symbol } = req.query;
    const ticker = await bitget.getTicker(symbol);
    
    res.json({
      success: true,
      price: parseFloat(ticker.close),
      high: parseFloat(ticker.high24h),
      low: parseFloat(ticker.low24h),
      volume: parseFloat(ticker.quoteVol)
    });
    
  } catch (error) {
    console.error('Price API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
