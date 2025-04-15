async function loadSymbols() {
  try {
    const response = await fetch('/api/trade?action=getSymbols', {
      headers: {
        'Accept': 'application/json'
      }
    });

    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text); // Extra parsing step for safety
    } catch (parseError) {
      console.error('Raw API response:', text);
      throw new Error(`Invalid JSON: ${parseError.message}`);
    }

    if (!data.success) {
      throw new Error(data.message || 'Unknown error');
    }

    // Process symbols...
    
  } catch (error) {
    console.error('Full error:', error);
    log(`Symbol load failed: ${error.message}`, 'error');
  }
}