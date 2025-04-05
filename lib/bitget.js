const CryptoJS = require('crypto-js');
const axios = require('axios');

class BitgetAPI {
  constructor(apiKey, secret, passphrase) {
    this.baseUrl = 'https://api.bitget.com';
    this.apiKey = apiKey;
    this.secret = secret;
    this.passphrase = passphrase;
  }

  async getPrice(symbol) {
    return this._request('GET', `/api/spot/v1/market/ticker?symbol=${symbol}`);
  }

  async placeOrder(params) {
    return this._request('POST', '/api/spot/v1/trade/orders', {
      symbol: params.symbol,
      side: params.side,
      orderType: 'limit',
      price: params.price.toString(),
      size: params.size.toString(),
      timeInForce: 'GTC'
    });
  }

  async _request(method, endpoint, body = null) {
    const timestamp = Date.now().toString();
    const headers = {
      'Content-Type': 'application/json',
      'ACCESS-KEY': this.apiKey,
      'ACCESS-TIMESTAMP': timestamp,
      'ACCESS-PASSPHRASE': this.passphrase
    };

    let bodyString = '';
    if (body) {
      bodyString = JSON.stringify(body);
      headers['ACCESS-SIGN'] = this._sign(timestamp, method, endpoint, bodyString);
    }

    const response = await axios({
      method,
      url: this.baseUrl + endpoint,
      headers,
      data: bodyString
    });

    if (response.data.code !== '00000') {
      throw new Error(response.data.msg || 'Bitget API error');
    }

    return response.data.data;
  }

  _sign(timestamp, method, endpoint, body) {
    const message = timestamp + method + endpoint + body;
    return CryptoJS.HmacSHA256(message, this.secret).toString(CryptoJS.enc.Base64);
  }
}

module.exports = BitgetAPI
