class GridStrategy {
  constructor(upperPrice, lowerPrice, levels, investment) {
    this.upperPrice = upperPrice;
    this.lowerPrice = lowerPrice;
    this.levels = levels;
    this.investment = investment;
    this.grids = this._calculateGrids();
  }

  _calculateGrids() {
    const priceStep = (this.upperPrice - this.lowerPrice) / this.levels;
    const amountPerGrid = this.investment / this.levels;
    
    return Array.from({ length: this.levels + 1 }, (_, i) => {
      const price = this.lowerPrice + (i * priceStep);
      return {
        price: parseFloat(price.toFixed(8)),
        type: i % 2 === 0 ? 'buy' : 'sell',
        amount: parseFloat((amountPerGrid / price).toFixed(8))
      };
    });
  }

  getAction(currentPrice) {
    const threshold = 0.005; // 0.5% threshold
    return this.grids.find(grid => 
      Math.abs(grid.price - currentPrice) < (grid.price * threshold)
    );
  }
}

module.exports = GridStrategy;
