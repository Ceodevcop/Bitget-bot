export default async (req, res) => {
  const { symbol, buyPrice, sellPrice, profit } = JSON.parse(req.body);

  // Post data to Supabase
  await fetch(`${process.env.SUPABASE_API_URL}/rest/v1/history`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_API_KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ symbol, buyPrice, sellPrice, profit }),
  });

  res.status(200).json({ success: true });
};
