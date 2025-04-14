const { default: axios } = require('axios');

module.exports = async (req, res) => {
    // Get API keys from environment variables
    const API_KEY = process.env.BITGET_API_KEY;
    const SECRET_KEY = process.env.BITGET_SECRET_KEY;
    const PASSPHRASE = process.env.BITGET_PASSPHRASE;
    
    if (!API_KEY || !SECRET_KEY || !PASSPHRASE) {
        return res.status(400).json({ success: false, message: 'API credentials not configured' });
    }
    
    try {
        if (req.method === 'GET') {
            const { action, symbol } = req.query;
            
            if (action === 'getSymbols') {
                // Get list of available symbols
                const response = await axios.get('https://api.bitget.com/api/spot/v1/public/products');
                const symbols = response.data.data
                    .filter(product => product.quoteCoin === 'USDT')
                    .map(product => product.symbol);
                
                return res.json({ success: true, data: symbols });
            } else if (action === 'getPrice') {
                // Get current price for a symbol
                const response = await axios.get(`https://api.bitget.com/api/spot/v1/market/ticker?symbol=${symbol}`);
                const price = response.data.data.close;
                
                return res.json({ success: true, data: { price } });
            }
        } else if (req.method === 'POST') {
            const { action, symbol, side, quantity, price } = req.body;
            
            if (action === 'placeOrder') {
                // Place an order on Bitget
                const timestamp = Date.now();
                const endpoint = '/api/spot/v1/trade/orders';
                const url = `https://api.bitget.com${endpoint}`;
                
                const orderParams = {
                    symbol,
                    side,
                    orderType: 'limit',
                    price: price.toString(),
                    size: quantity.toString(),
                    force: 'normal',
                    clientOid: `order_${timestamp}`
                };
                
                // Create signature
                const sign = generateSignature(req.method, endpoint, orderParams, timestamp, SECRET_KEY);
                
                const response = await axios.post(url, orderParams, {
                    headers: {
                        'ACCESS-KEY': API_KEY,
                        'ACCESS-SIGN': sign,
                        'ACCESS-TIMESTAMP': timestamp.toString(),
                        'ACCESS-PASSPHRASE': PASSPHRASE,
                        'Content-Type': 'application/json'
                    }
                });
                
                return res.json({ 
                    success: response.data.code === '00000',
                    data: response.data.data,
                    message: response.data.msg
                });
            }
        }
        
        return res.status(400).json({ success: false, message: 'Invalid action' });
    } catch (error) {
        console.error('Bitget API error:', error.response?.data || error.message);
        return res.status(500).json({ 
            success: false, 
            message: error.response?.data?.msg || error.message 
        });
    }
};

// Helper function to generate Bitget API signature
function generateSignature(method, endpoint, params, timestamp, secretKey) {
    const queryString = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
    
    const prehash = timestamp + method.toUpperCase() + endpoint;
    const toSign = queryString ? `${prehash}?${queryString}` : prehash;
    
    const crypto = require('crypto');
    return crypto.createHmac('sha256', secretKey)
        .update(toSign)
        .digest('base64');
}
