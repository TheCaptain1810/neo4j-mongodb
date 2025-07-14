const dotenv = require("dotenv");
dotenv.config();

// Connect to MongoDB and insert sample data (run this separately or in a script)
const { MongoClient } = require("mongodb");
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function setupMongoDB() {
  try {
    await client.connect();
    client.db("neo4J");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

setupMongoDB();
