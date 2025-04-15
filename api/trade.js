import fetch from "node-fetch";

export default async (req, res) => {
  const { symbol, amount } = JSON.parse(req.body);
  const API_KEY = process.env.BITGET_API_KEY;

  // Get the current market price from Bitget
  const marketRes = await fetch(`https://api.bitget.com/api/spot/v1/market/ticker?symbol=${symbol}`);
  const market = await marketRes.json();

  const currentPrice = parseFloat(market.data.last);
  const buyPrice = currentPrice;
  const sellPrice = currentPrice * 1.01; // Target 1% profit

  // Simulate profit calculation
  const profit = (sellPrice - buyPrice) * (amount / buyPrice);

  // Log the trade to Supabase
  await fetch(`${process.env.SUPABASE_API_URL}/rest/v1/history`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_API_KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ symbol, buyPrice, sellPrice, profit }),
  });

  res.status(200).json({ success: true, profit });
};
