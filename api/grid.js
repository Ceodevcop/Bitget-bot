const BitgetAPI = require('../lib/bitget');
const GridStrategy = require('../lib/grid-strategy');

module.exports = async (req, res) => {
  try {
    const { symbol, upper, lower, levels, investment } = req.body;
    const bitget = new BitgetAPI(
      process.env.BITGET_API_KEY,
      process.env.BITGET_SECRET,
      process.env.BITGET_PASSPHRASE
    );
    
    const grid = new GridStrategy(upper, lower, levels, investment);
    const currentPrice = await bitget.getPrice(symbol).then(d => parseFloat(d.close));
    const action = grid.getAction(currentPrice);
    
    if (action) {
      const order = await bitget.placeOrder({
        symbol,
        side: action.type,
        price: action.price,
        size: action.amount
      });
      return res.json({ action, order });
    }
    
    res.json({ message: 'No grid action triggered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
