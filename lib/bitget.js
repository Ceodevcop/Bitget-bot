const CryptoJS = require('crypto-js');
const axios = require('axios');

module.exports = class BitgetAPI {
  constructor(apiKey, apiSecret, apiPassphrase) {
    this.baseUrl = 'https://api.bitget.com';
    this.apiKey = apiKey;
    this.secret = apiSecret;
    this.passphrase = apiPassphrase;
  }

  async getTicker(symbol) {
    return this._request('GET', `/api/spot/v1/market/ticker?symbol=${symbol}`);
  }

  async _request(method, endpoint, body = null) {
    const timestamp = Date.now().toString();
    const headers = {
      'Content-Type': 'application/json',
      'ACCESS-KEY': this.apiKey,
      'ACCESS-TIMESTAMP': timestamp,
      'ACCESS-PASSPHRASE': this.passphrase
    };

    if (body) {
      const signature = CryptoJS.HmacSHA256(
        timestamp + method + endpoint + JSON.stringify(body), 
        this.secret
      ).toString(CryptoJS.enc.Base64);
      headers['ACCESS-SIGN'] = signature;
    }

    const response = await axios({
      method,
      url: this.baseUrl + endpoint,
      headers,
      data: body
    });

    if (response.data.code !== '00000') {
      throw new Error(response.data.msg || 'API error');
    }

    return response.data.data;
  }
};
