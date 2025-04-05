const BitgetAPI = require('../lib/bitget');

module.exports = async (req, res) => {
  try {
    const { symbol } = req.query;
    const bitget = new BitgetAPI(
      process.env.BITGET_API_KEY,
      process.env.BITGET_SECRET,
      process.env.BITGET_PASSPHRASE
    );
    
    const priceData = await bitget.getPrice(symbol);
    res.json({ price: parseFloat(priceData.close) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
