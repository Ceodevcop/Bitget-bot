class GridStrategy {
  constructor(upper, lower, levels, investment) {
    this.upper = parseFloat(upper);
    this.lower = parseFloat(lower);
    this.levels = parseInt(levels);
    this.investment = parseFloat(investment);
    this.grids = this._calculateGrids();
  }

  _calculateGrids() {
    const step = (this.upper - this.lower) / this.levels;
    const amountPerGrid = this.investment / this.levels;
    
    return Array.from({ length: this.levels + 1 }, (_, i) => ({
      price: parseFloat((this.lower + (i * step)).toFixed(8)),
      type: i % 2 === 0 ? 'buy' : 'sell',
      amount: parseFloat((amountPerGrid / (this.lower + (i * step))).toFixed(8))
    }));
  }

  getAction(currentPrice, thresholdPct = 0.005) {
    return this.grids.find(grid => {
      const threshold = grid.price * thresholdPct;
      return Math.abs(grid.price - currentPrice) <= threshold;
    });
  }
}

module.exports = GridStrategy;
