const { MongoClient, ServerApiVersion } = require("mongodb");

let client = null;

async function connect() {
  if (client) {
    return client; // Return the existing client if it already exists
  }

  const uri = process.env.MONGO_URL;
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  try {
    await client.connect();
    console.log("Database Connected!");
    return client;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}


function getClient() {
  if (!client) {
    throw new Error("Database client has not been initialized. Call connect() first.");
  }

  return client;
}

module.exports = {
  connect,
  getClient,
};
