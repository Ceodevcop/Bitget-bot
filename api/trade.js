const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET' && req.query.action === 'getSymbols') {
      const { data } = await axios.get('https://api.bitget.com/api/spot/v1/public/products');
      
      // Validate response structure
      if (!data || !data.data) {
        throw new Error('Invalid API response structure');
      }

      const symbols = data.data
        .filter(product => product.quoteCoin === 'USDT')
        .map(product => product.symbol);

      return res.status(200).json({
        success: true,
        data: symbols
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid request method or action'
    });

  } catch (error) {
    console.error('Vercel Serverless Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};