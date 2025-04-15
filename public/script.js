const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const buyAmountInput = document.getElementById('buy-amount');
const sellPercentageInput = document.getElementById('sell-percentage');
const logList = document.getElementById('log-list');

let isTradingActive = false;

// Handle Trading Start and Stop
startButton.addEventListener('click', startTrading);
stopButton.addEventListener('click', stopTrading);

// Start Trading Function
async function startTrading() {
  const buyAmount = parseFloat(buyAmountInput.value);
  const sellPercentage = parseFloat(sellPercentageInput.value);

  if (buyAmount && sellPercentage) {
    const response = await fetch('/api/start-trading', {
      method: 'POST',
      body: JSON.stringify({ buyAmount, sellPercentage }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      isTradingActive = true;
      toggleButtons();
      addLog('Trading Started');
    } else {
      addLog('Error starting trading');
    }
  }
}

// Stop Trading Function
async function stopTrading() {
  const response = await fetch('/api/stop-trading', { method: 'POST' });

  const data = await response.json();

  if (data.success) {
    isTradingActive = false;
    toggleButtons();
    addLog('Trading Stopped');
  } else {
    addLog('Error stopping trading');
  }
}

// Toggle Start/Stop buttons
function toggleButtons() {
  startButton.disabled = isTradingActive;
  stopButton.disabled = !isTradingActive;
}

// Add Log Entry
function addLog(message) {
  const logItem = document.createElement('li');
  logItem.textContent = message;
  logList.appendChild(logItem);
}

// TradingView Chart
const chart = new TradingView.widget({
  autosize: true,
  symbol: 'BITGET:BTCUSD',  // Example chart symbol
  interval: '1',
  container_id: 'chart-container',
  datafeed: new TradingView.Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
  library_path: 'charting_library/',
  locale: 'en',
  disabled_features: ['use_localstorage_for_settings'],
});
