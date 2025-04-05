class TradingBot {
  constructor() {
    this.apiKey = localStorage.getItem('apiKey') || '';
    this.botInterval = null;
    this.gridLevels = [];
    
    // Initialize UI
    document.getElementById('api-key').value = this.apiKey;
    this.initEventListeners();
  }

  initEventListeners() {
    document.getElementById('start-bot').addEventListener('click', () => this.startBot());
    document.getElementById('stop-bot').addEventListener('click', () => this.stopBot());
  }

  async startBot() {
    const upper = parseFloat(document.getElementById('upper-price').value);
    const lower = parseFloat(document.getElementById('lower-price').value);
    const levels = parseInt(document.getElementById('grid-levels').value);
    const investment = parseFloat(document.getElementById('investment').value);
    const symbol = document.getElementById('symbol').value;
    
    this.botInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/grid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol, upper, lower, levels, investment })
        });
        
        const result = await response.json();
        if (result.action) {
          this.addTradeToLog(result.action, result.order);
        }
      } catch (error) {
        console.error('Bot error:', error);
      }
    }, 10000); // Check every 10 seconds
    
    document.getElementById('bot-status').textContent = 'Running';
  }

  stopBot() {
    clearInterval(this.botInterval);
    document.getElementById('bot-status').textContent = 'Stopped';
  }

  addTradeToLog(action, order) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date().toLocaleTimeString()}</td>
      <td class="${action.type}">${action.type.toUpperCase()}</td>
      <td>${action.price.toFixed(2)}</td>
      <td>${action.amount.toFixed(4)}</td>
      <td>Pending</td>
    `;
    document.getElementById('trade-log').prepend(row);
  }
}

new TradingBot()
