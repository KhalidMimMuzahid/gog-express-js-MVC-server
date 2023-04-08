const express = require("express");
const cors = require("cors");
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wtm3mfw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // collection 1
    const usersCollection = client.db("users").collection("usersCollection");
    const applyDataCollection = client
      .db("appliedUserDetails")
      .collection("usersApplyDataCollection");
    const csvBulkData = client.db("questionsBank").collection("csvBulkData");
    const assesmentData = client
      .db("questionsBank")
      .collection("assesmentData");

    // user(buyer and seller) data save------------
    app.put("/users", async (req, res) => {
      const user = req.body;
      const email = user.email;
      const filter = { email: email };
      const options = { upsert: true }; // verfiy the dupate data
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // user(buyer and seller) data save------------
    app.put("/apply-data", async (req, res) => {
      const applyData = req.body;
      const email = applyData.email;
      const phone = applyData.phone;
      const filter = { $or: [{ email: email }, { phone: phone }] };
      const options = { upsert: true }; // verfiy the dupate data
      //console.log(applyData);
      const updateDoc = {
        $set: applyData,
      };
      const result = await applyDataCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // get users
    app.get("/users", async (req, res) => {
      const query = {};
      const data = await usersCollection.find(query).toArray();
      res.send(data);
    });

    app.post("/add-csv-data", async (req, res) => {
      const data = req.body;
      // console.log("data: ", data);
      const result = await csvBulkData.insertMany(data);
      res.send(result);
      console.log("result: ", result);
    });
    app.get("/get-questions", async (req, res) => {
      const searchParameteresForQueriesString =
        req.headers.searchparameteresforqueries;
      const searchParameteresForQueries = JSON.parse(
        searchParameteresForQueriesString
      );
      // console.log("searchParameteresForQueries: ", searchParameteresForQueries);
      const { topicName, questionName, difficultyLevel } =
        searchParameteresForQueries;
      let query = {};
      if (topicName) query.topicName = topicName;
      if (questionName) query.questionName = questionName;
      if (difficultyLevel) query.difficultyLevel = difficultyLevel;
      console.log("query: ", query);
      if (!Object.keys(query).length) {
        console.log("xxxxxxxxxxxxxxxxx");
        return res.send([]);
      }

      // const query = { runtime: { $lt: 15 } };
      // const options = {
      //   // sort returned documents in ascending order by title (A->Z)
      //   sort: { title: 1 },
      //   // Include only the `title` and `imdb` fields in each returned document
      //   projection: { _id: 0, title: 1, imdb: 1 },
      // };
      const result = await csvBulkData.find(query).toArray();
      // console.log("result: ", result);
      res.send(result);
    });
    app.post("/add-assesment", async (req, res) => {
      const assesment = req.body;
      const result = await assesmentData.insertOne(assesment);
      // console.log("result: ", result);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", async (req, res) => {
  res.send("Geeks of Gurukul Server is running");
});

app.listen(port, () =>
  console.log(`Geeks of Gurukul Server running on ${port}`)
);
