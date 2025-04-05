const Bitget = require('../lib/bitget');
const GridStrategy = require('../lib/grid-strategy');
const db = require('../lib/db');

module.exports = async (req, res) => {
  try {
    const { symbol, upper, lower, levels, investment } = req.body;
    
    // Verify balance
    const balance = await Bitget.getBalance();
    if (balance < investment) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Initialize grid
    const grid = new GridStrategy(upper, lower, levels, investment);
    const currentPrice = await Bitget.getTicker(symbol).then(t => parseFloat(t.close));
    
    // Store in database
    const botId = await db.createBot({
      symbol,
      upper,
      lower,
      levels,
      investment,
      currentPrice,
      grids: grid.grids
    });

    res.json({ 
      botId,
      currentPrice,
      grids: grid.grids.map(g => ({
        price: g.price,
        type: g.type,
        amount: g.amount
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
