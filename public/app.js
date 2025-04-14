document.addEventListener('DOMContentLoaded', () => {
  const symbolSelect = document.getElementById('symbol');
  const priceDisplay = document.getElementById('price-display');

  // Fetch price when symbol changes
  symbolSelect.addEventListener('change', async () => {
    try {
      const response = await fetch(`/api/price?symbol=${symbolSelect.value}`);
      const data = await response.json();
      
      if (data.success) {
        priceDisplay.innerHTML = `
          Current: $${data.price.toFixed(4)}<br>
          24h Range: $${data.low.toFixed(4)} - $${data.high.toFixed(4)}<br>
          Volume: ${data.volume.toFixed(2)} USDT
        `;
      } else {
        priceDisplay.textContent = 'Error fetching price';
      }
    } catch (error) {
      priceDisplay.textContent = 'Connection error';
    }
  });
});
