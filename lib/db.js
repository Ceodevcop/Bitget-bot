// For Vercel serverless, we'll use MongoDB Atlas
const { MongoClient } = require('mongodb');

let cachedDb = null;

async function connect() {
  if (cachedDb) return cachedDb;
  
  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  cachedDb = client.db('bitget-bot');
  return cachedDb;
}

module.exports = {
  async createBot(config) {
    const db = await connect();
    const result = await db.collection('bots').insertOne({
      ...config,
      createdAt: new Date(),
      status: 'running'
    });
    return result.insertedId;
  },
  
  async updateBot(botId, update) {
    const db = await connect();
    await db.collection('bots').updateOne(
      { _id: botId },
      { $set: update }
    );
  }
}
