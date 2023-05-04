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
    // courseCollection
    const courseDetails = client
      .db("courseDatabase")
      .collection("courseDetails");
    //BatchCollection
    const batchDetails = client.db("batchDatabase").collection("batchDetails");

    const userBasicCollection = client
      .db("users")
      .collection("userBasicCollection");
    const applyDataCollection = client
      .db("appliedUserDetails")
      .collection("usersApplyDataCollection");
    const couponCollection = client
      .db("appliedUserDetails")
      .collection("couponCollection");
    const chatBotUserMessageCollection = client
      .db("chatbotData")
      .collection("chatBotUserMessageCollection");
    const refereeCollection = client
      .db("appliedUserDetails")
      .collection("refereeCollection");
    const csvBulkData = client.db("questionsBank").collection("csvBulkData");
    const assesmentData = client
      .db("questionsBank")
      .collection("assesmentData");
    const programPriceData = client
      .db("programPrices")
      .collection("programPricesCollection");

    app.get("/checkuseralreadyindatabase", async (req, res) => {
      const email = req?.query?.email;
      console.log("email: ", email);
      const query = { email: email };
      const result = await userBasicCollection.findOne(query);
      console.log("result check: ", result);
      if (result) {
        res.send({ isUserAlreadyExists: true });
      } else {
        res.send({ isUserAlreadyExists: false });
      }
    });

    // phone number verification
    app.get("/checkuserphoneverified", async (req, res) => {
      const email = req?.query?.email;
      console.log("email: ", email);
      const query = { email: email };
      const result = await userBasicCollection.findOne(query);
      console.log("result check: ", result);
      if (result?.phoneNumber) {
        res.send({ isPhoneVerified: true });
      } else {
        res.send({ isPhoneVerified: false });
      }
    });

    // user(buyer and seller) intial sign up data data save------------
    app.post("/usersbasics", async (req, res) => {
      const userBasicDetails = req.body;
      console.log("userBasicDetails: ", userBasicDetails);
      const result = await userBasicCollection.insertOne(userBasicDetails);
      res.send(result);
    });
    app.put("/update-phone", async (req, res) => {
      const user = req.body;
      const { email, phoneNumber, displayName } = user;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          phoneNumber: phoneNumber,
          name: displayName,
        },
      };
      const result = await userBasicCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // user(buyer and seller) intial sign up data data save------------
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

    // Update the user name
    app.put("/usersname", async (req, res) => {
      try {
        const userinfo = req.body;
        const email = req.body.email;
        const filter = { email: email };
        const option = { upsert: true };
        const updateId = {
          $set: {
            name: userinfo.name,
          },
        };
        console.log(updateId);
        const result = await usersCollection.updateOne(
          filter,
          updateId,
          option
        );
        console.log(result);
        res.send({
          success: true,
          data: result,
          message: "Successfully ",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
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

    // set rhe s30 tah in users collection
    app.put("/users-s30", async (req, res) => {
      const users = req.body;
      const email = users.email;
      const filter = { email: email };
      const data = await usersCollection.updateOne(filter, {
        $set: { tag: "s30" },
      });
      res.send(data);
    });

    // get users
    app.get("/users", async (req, res) => {
      const query = {};
      const data = await usersCollection.find(query).toArray();
      res.send(data);
    });
    // get users for the check mobile mumber
    app.get("/checkuserindatabase", async (req, res) => {
      const numberString = req.headers.number;
      const number = JSON.parse(numberString);
      console.log(number);
      const query = { phone: number };
      const data = await usersCollection.findOne(query);
      console.log("data: ", data);
      const data2 = {
        user: data,
      };
      res.send(data2);
    });

    // get users
    app.get("/users", async (req, res) => {
      const query = {};
      const data = await usersCollection.find(query).toArray();
      res.send(data);
    });

    // post messages for chatbot collection
    app.post("/chat-bot-mesages", async (req, res) => {
      try {
        const usermessage = req.body;
        console.log(usermessage);
        const result = await chatBotUserMessageCollection.insertOne(
          usermessage
        );
        res.send({
          success: true,
          data: result,
          message: "Successfully post ",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // get admin admin user
    app.get("/userinfo/:email", async (req, res) => {
      try {
        const email = req.params.email;
        console.log(email);
        const query = { email };

        console.log(query);
        const users = await usersCollection.findOne(query);
        res.send(users);
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // get userData for phone verify -s
    app.get("/userinfoforphone/:email", async (req, res) => {
      try {
        const email = req.params.email;
        //console.log(email);
        const query = { email };
        console.log(query);
        const users = await usersCollection.findOne(query);
        //console.log(users);
        if (users.phone) {
          res.send({ status: 200, message: "phone verified" });
        } else {
          res.send({ status: 404, message: "phone not verified" });
        }
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // single user
    app.get("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.findOne(query);
        console.log(result);
        res.send(result);
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // put user
    app.put("/booking", async (req, res) => {
      try {
        const userinfo = req.body;
        const email = req.body.email;
        const filter = { email: email };
        const option = { upsert: true };
        const updateId = {
          $set: {
            name: userinfo.name,
            email: userinfo.email,
            phone: userinfo.phone,
            date: userinfo.date,
            refelInput: userinfo.refelInput,
            gander: userinfo.gander,
          },
          $push: {
            course: userinfo.course,
          },
        };
        console.log(updateId);

        const result = await usersCollection.updateOne(
          filter,
          updateId,
          option
        );

        console.log(result);

        res.send({
          success: true,
          data: result,
          message: "Successfully ",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // admin
    app.get("/admin/:email", async (req, res) => {
      try {
        const email = req.params.email;
        console.log(email);
        const query = { email };
        console.log(query);
        const users = await usersCollection.findOne(query);
        const role = users?.roll === "admin";
        console.log(role);
        res.send(role);
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // post coupon collection
    app.post("/coupon", async (req, res) => {
      try {
        const coupon = req.body;
        const result = await couponCollection.insertOne(coupon);
        res.send({
          success: true,
          data: result,
          message: "Successfully post ",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // get coupon collection
    app.get("/coupon", async (req, res) => {
      try {
        const query = {};

        const result = await couponCollection.find(query).toArray();

        res.send({
          success: true,
          data: result,
          message: "Successfully ",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // single couponCollection
    app.get("/coupon/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await couponCollection.findOne(query);
        console.log(result);
        res.send(result);
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // post refereeCollection collection
    app.post("/referee", async (req, res) => {
      try {
        const coupon = req.body;
        const result = await refereeCollection.insertOne(coupon);
        res.send({
          success: true,
          data: result,
          message: "Successfully post data",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // get refereeCollection collection
    app.get("/referee", async (req, res) => {
      try {
        const query = {};

        const result = await refereeCollection.find(query).toArray();

        res.send({
          success: true,
          data: result,
          message: "Successfully",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // single refereeCollection
    app.get("/referee/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await refereeCollection.findOne(query);
        console.log(result);
        res.send(result);
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // delete addProduct id
    app.delete("/referee/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const query = await refereeCollection.deleteOne(filter);
        res.send({
          success: true,
          data: query,
          message: "Successfully Delete",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // delete coupon id
    app.delete("/coupon/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const query = await couponCollection.deleteOne(filter);
        res.send({
          success: true,
          data: query,
          message: "Successfully Delete",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
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
      //   // Include only the title and imdb fields in each returned document
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
    // app.get("/add-assesment", async (req, res) => {
    //   const query = {};
    //   const data = await assesmentData.find(query).toArray();
    //   res.send(data);
    // });

    // get coupon collection
    app.get("/program", async (req, res) => {
      try {
        const query = {};

        const result = await programPriceData.find(query).toArray();

        res.send({
          success: true,
          data: result,
          message: "Successfully ",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // get coupon collection

    app.get("/program/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await programPriceData.findOne(query);
        console.log(result);
        res.send(result);
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // put report
    app.put("/newprice", async (req, res) => {
      try {
        const program = req.body;
        const id = program.id;
        const filter = { _id: new ObjectId(id) };
        const option = { upsert: true };
        const updateId = {
          $set: {
            price: program.coupon,
          },
        };
        const result = await programPriceData.updateOne(
          filter,
          updateId,
          option
        );
        console.log(result);
        res.send({
          success: true,
          data: result,
          message: "Successfully get data",
        });
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // LMS API
    // for adding batch(post)
    app.post("/add-batch", async (req, res) => {
      const batch = req.body;
      const result = await batchDetails.insertOne(batch);
      console.log("result: ", result);
      res.send(result);
    });
    // for adding course(post)
    app.post("/add-course", async (req, res) => {
      const course = req.body;
      const result = await courseDetails.insertOne(course);
      console.log("result: ", result);
      res.send(result);
    });
    //for getting course list
    app.get("/course-list", async (req, res) => {
      const query = {};
      const data = await courseDetails.find(query).toArray();
      res.send(data);
    });
    //for getting batch list
    app.get("/batch-list", async (req, res) => {
      const query = {};
      const data = await batchDetails.find(query).toArray();
      res.send(data);
    });
    // LMS API
  } finally {
  }
}
run().catch((err) => console.error(err));

// Amit server code

app.get("/", async (req, res) => {
  res.send("Geeks of Gurukul Server is running");
});

app.listen(port, () =>
  console.log(`Geeks of Gurukul Server running on ${port}`)
);
