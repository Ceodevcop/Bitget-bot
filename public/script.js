async function loadSymbols() {
    try {
        const response = await fetch('/api/trade?action=getSymbols');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Invalid content type. Received: ${contentType}. Response: ${text}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Clear existing options first
            symbolSelect.innerHTML = '';
            
            data.data.forEach(symbol => {
                const option = document.createElement('option');
                option.value = symbol;
                option.textContent = symbol;
                symbolSelect.appendChild(option);
            });
            
            log('Symbols loaded successfully', 'success');
        } else {
            throw new Error(data.message || 'Unknown error loading symbols');
        }
    } catch (error) {
        log(`Failed to load symbols: ${error.message}`, 'error');
        console.error('Error loading symbols:', error);
    }
}