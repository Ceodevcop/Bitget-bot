let priceChart;

function initChart(grids, initialPrice) {
  const ctx = document.getElementById('price-chart').getContext('2d');
  
  priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Price',
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        data: [{x: Date.now(), y: initialPrice}]
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'realtime',
          realtime: {
            delay: 2000,
            onRefresh: chart => {
              chart.data.datasets.forEach(dataset => {
                dataset.data.push({
                  x: Date.now(),
                  y: initialPrice
                });
              });
            }
          }
        }
      }
    }
  });

  // Draw grid lines
  const gridContainer = document.getElementById('grid-lines');
  grids.forEach(grid => {
    const line = document.createElement('div');
    line.className = `grid-line ${grid.type}`;
    line.style.bottom = `${((grid.price - grids[0].price) / (grids[grids.length-1].price - grids[0].price)) * 100}%`;
    line.innerHTML = `<span>$${parseFloat(grid.price).toFixed(2)}</span>`;
    gridContainer.appendChild(line);
  });
}

function updatePrice(price) {
  if (priceChart) {
    priceChart.data.datasets[0].data.push({
      x: Date.now(),
      y: price
    });
    priceChart.update('quiet');
  }
