const BitgetAPI = require('../lib/bitget');

module.exports = async (req, res) => {
  try {
    const { symbol, side, price, size } = req.body;
    const bitget = new BitgetAPI(
      process.env.BITGET_API_KEY,
      process.env.BITGET_SECRET,
      process.env.BITGET_PASSPHRASE
    );
    
    const order = await bitget.placeOrder({ symbol, side, price, size });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
