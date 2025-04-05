class TradingBot {
  constructor() {
    this.botId = null;
    this.interval = null;
    this.currentPrice = 0;
    
    // DOM Elements
    this.startBtn = document.getElementById('start-btn');
    this.stopBtn = document.getElementById('stop-btn');
    this.statusEl = document.getElementById('bot-status');
    this.tradeLog = document.querySelector('#trade-log tbody');

    // Event listeners
    this.startBtn.addEventListener('click', () => this.start());
    this.stopBtn.addEventListener('click', () => this.stop());
  }

  async start() {
    const config = {
      symbol: document.getElementById('symbol').value,
      upper: document.getElementById('upper-price').value,
      lower: document.getElementById('lower-price').value,
      levels: document.getElementById('grid-levels').value,
      investment: document.getElementById('investment').value
    };

    try {
      const response = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      this.botId = data.botId;
      this.currentPrice = data.currentPrice;

      // Initialize chart
      initChart(data.grids, this.currentPrice);

      // Start polling
      this.interval = setInterval(() => this.checkGrid(), 10000);
      
      // Update UI
      this.statusEl.textContent = 'Running';
      this.startBtn.disabled = true;
      this.stopBtn.disabled = false;

    } catch (error) {
      console.error('Failed to start bot:', error);
      alert('Failed to start bot: ' + error.message);
    }
  }

  async checkGrid() {
    try {
      const response = await fetch(`/api/grid?botId=${this.botId}`);
      const result = await response.json();
      
      if (result.action) {
        this.addTrade(result.action, result.order);
      }

      // Update chart
      updatePrice(result.currentPrice);

    } catch (error) {
      console.error('Grid check failed:', error);
    }
  }

  addTrade(action, order) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date().toLocaleTimeString()}</td>
      <td class="${action.type}">${action.type.toUpperCase()}</td>
      <td>${parseFloat(action.price).toFixed(2)}</td>
      <td>${parseFloat(action.amount).toFixed(6)}</td>
      <td>Pending</td>
    `;
    this.tradeLog.prepend(row);
  }

  stop() {
    clearInterval(this.interval);
    this.statusEl.textContent = 'Stopped';
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;
  }
}

// Initialize bot when page loads
window.addEventListener('DOMContentLoaded', () => {
  new TradingBot();
});
