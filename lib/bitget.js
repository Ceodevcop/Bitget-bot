const CryptoJS = require('crypto-js');
const axios = require('axios');

class BitgetAPI {
  constructor() {
    this.baseUrl = 'https://api.bitget.com';
    this.apiKey = process.env.BITGET_API_KEY;
    this.secret = process.env.BITGET_SECRET;
    this.passphrase = process.env.BITGET_PASSPHRASE;
  }

  async getTicker(symbol) {
    return this._publicRequest(`/api/spot/v1/market/ticker?symbol=${symbol}`);
  }

  async placeOrder(params) {
    return this._privateRequest('/api/spot/v1/trade/orders', {
      symbol: params.symbol,
      side: params.side,
      orderType: 'limit',
      price: params.price.toString(),
      size: params.size.toString(),
      timeInForce: 'GTC'
    });
  }

  async getBalance(coin = 'USDT') {
    const result = await this._privateRequest('/api/spot/v1/account/assets');
    return result.find(a => a.coin === coin)?.available || 0;
  }

  async _publicRequest(endpoint) {
    const { data } = await axios.get(this.baseUrl + endpoint);
    return data.data;
  }

  async _privateRequest(endpoint, body = {}) {
    const timestamp = Date.now().toString();
    const signature = this._sign(timestamp, 'POST', endpoint, JSON.stringify(body));

    const { data } = await axios.post(this.baseUrl + endpoint, body, {
      headers: {
        'Content-Type': 'application/json',
        'ACCESS-KEY': this.apiKey,
        'ACCESS-TIMESTAMP': timestamp,
        'ACCESS-PASSPHRASE': this.passphrase,
        'ACCESS-SIGN': signature
      }
    });

    if (data.code !== '00000') throw new Error(data.msg || 'API error');
    return data.data;
  }

  _sign(timestamp, method, endpoint, body) {
    const message = timestamp + method + endpoint + body;
    return CryptoJS.HmacSHA256(message, this.secret).toString(CryptoJS.enc.Base64);
  }
}

module.exports = new BitgetAPI();
