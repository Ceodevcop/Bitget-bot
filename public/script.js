document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const symbolSelect = document.getElementById('symbol');
    const buyPriceInput = document.getElementById('buyPrice');
    const sellPriceInput = document.getElementById('sellPrice');
    const quantityInput = document.getElementById('quantity');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const logOutput = document.getElementById('logOutput');
    const priceChartCtx = document.getElementById('priceChart').getContext('2d');
    
    // Chart setup
    let priceChart = new Chart(priceChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
    
    // State variables
    let tradingActive = false;
    let currentSymbol = '';
    let priceCheckInterval;
    let priceHistory = [];
    let maxHistoryLength = 50;
    
    // Initialize the app
    async function init() {
        await loadSymbols();
        updateChart();
        
        startBtn.addEventListener('click', startTrading);
        stopBtn.addEventListener('click', stopTrading);
    }
    
    // Load available symbols from Bitget
    async function loadSymbols() {
        try {
            const response = await fetch('/api/trade?action=getSymbols');
            const data = await response.json();
            
            if (data.success) {
                data.data.forEach(symbol => {
                    const option = document.createElement('option');
                    option.value = symbol;
                    option.textContent = symbol;
                    symbolSelect.appendChild(option);
                });
                
                log('Symbols loaded successfully', 'success');
            } else {
                log(`Error loading symbols: ${data.message}`, 'error');
            }
        } catch (error) {
            log(`Failed to load symbols: ${error.message}`, 'error');
        }
    }
    
    // Start trading
    async function startTrading() {
        currentSymbol = symbolSelect.value;
        const buyPrice = parseFloat(buyPriceInput.value);
        const sellPrice = parseFloat(sellPriceInput.value);
        const quantity = parseFloat(quantityInput.value);
        
        if (!currentSymbol) {
            log('Please select a coin', 'error');
            return;
        }
        
        if (buyPrice <= 0 || sellPrice <= 0 || quantity <= 0) {
            log('Please enter valid prices and quantity', 'error');
            return;
        }
        
        if (sellPrice <= buyPrice) {
            log('Sell price must be higher than buy price', 'error');
            return;
        }
        
        tradingActive = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
        log(`Starting grid trading for ${currentSymbol} - Buy at $${buyPrice}, Sell at $${sellPrice}`, 'success');
        
        // Start checking prices
        priceCheckInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/trade?action=getPrice&symbol=${currentSymbol}`);
                const data = await response.json();
                
                if (data.success) {
                    const currentPrice = parseFloat(data.data.price);
                    updatePriceChart(currentPrice);
                    
                    if (currentPrice <= buyPrice) {
                        await placeOrder(currentSymbol, 'buy', quantity, currentPrice);
                    } else if (currentPrice >= sellPrice) {
                        await placeOrder(currentSymbol, 'sell', quantity, currentPrice);
                    }
                } else {
                    log(`Error getting price: ${data.message}`, 'error');
                }
            } catch (error) {
                log(`Price check failed: ${error.message}`, 'error');
            }
        }, 5000); // Check every 5 seconds
    }
    
    // Stop trading
    function stopTrading() {
        tradingActive = false;
        clearInterval(priceCheckInterval);
        startBtn.disabled = false;
        stopBtn.disabled = true;
        log('Trading stopped', 'info');
    }
    
    // Place an order
    async function placeOrder(symbol, side, quantity, price) {
        try {
            const response = await fetch('/api/trade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'placeOrder',
                    symbol,
                    side,
                    quantity,
                    price
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                log(`${side.toUpperCase()} order placed for ${quantity} ${symbol} at $${price}`, 'success');
            } else {
                log(`Order failed: ${data.message}`, 'error');
            }
        } catch (error) {
            log(`Order placement failed: ${error.message}`, 'error');
        }
    }
    
    // Update price chart
    function updatePriceChart(price) {
        priceHistory.push(price);
        if (priceHistory.length > maxHistoryLength) {
            priceHistory.shift();
        }
        
        priceChart.data.labels = Array.from({length: priceHistory.length}, (_, i) => i.toString());
        priceChart.data.datasets[0].data = priceHistory;
        priceChart.update();
    }
    
    // Log messages
    function log(message, type = 'info') {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'log-time';
        timeSpan.textContent = timeString;
        
        const messageSpan = document.createElement('span');
        messageSpan.className = 'log-message';
        messageSpan.textContent = message;
        
        logEntry.appendChild(timeSpan);
        logEntry.appendChild(messageSpan);
        logOutput.appendChild(logEntry);
        
        // Auto-scroll to bottom
        logOutput.scrollTop = logOutput.scrollHeight;
    }
    
    // Initialize the application
    init();
});
