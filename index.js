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
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    // collection 1
    const usersCollection = client.db("users").collection("usersCollection");
    const applyDataCollection = client.db("appliedUserDetails").collection("usersApplyDataCollection");
    const couponCollection = client.db('appliedUserDetails').collection('couponCollection');
    const refereeCollection = client.db('appliedUserDetails').collection('refereeCollection');
    const csvBulkData = client.db("questionsBank").collection("csvBulkData");
    const assesmentData = client.db("questionsBank").collection("assesmentData");
    const programPriceData = client.db("programPrices").collection("programPricesCollection");



    // user(buyer and seller) data save------------
    app.put("/users", async (req, res) => {
      const user = req.body;
      const email = user.email;
      const filter = { email: email };
      const options = { upsert: true };    // verfiy the dupate data 
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


     // Update the user name // from sojib
     app.put('/usersname', async (req, res) => {
      try {
        const userinfo = req.body
        const email = req.body.email;
        const filter = { email: email };
        const option = { upsert: true };
        const updateId = {
          $set: {
            name: userinfo.name,
          }
        }
        console.log(updateId);
        const result = await usersCollection.updateOne(filter, updateId, option)
        console.log(result);
        res.send({
          success: true,
          data: result,
          message: 'Successfully '
        })
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })


    // user(buyer and seller) data save------------
    app.put("/apply-data", async (req, res) => {
      const applyData = req.body;
      const email = applyData.email;
      const phone = applyData.phone;
      const filter = { $or: [{ email: email }, { phone: phone }] }
      const options = { upsert: true };    // verfiy the dupate data 
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
    // get users for the check mobile mumber
    app.get("/checkuserindatabase", async (req, res) => {
     const  numberString = req.headers.number
     const  number = JSON.parse( numberString)
     console.log(number);
      const query = {phone: number};
      const data = await usersCollection.findOne(query)
      console.log("data: ",data)
      const data2= {
        user: data
      }
      res.send(data2);
    });



    // get users 
    app.get("/users", async (req, res) => {
      const query = {};
      const data = await usersCollection.find(query).toArray();
      res.send(data);
    })

    // get admin admin user 
    app.get('/userinfo/:email',  async (req, res) => {
      try {
        const email = req.params.email;
        console.log(email);
        const query = { email };

        console.log(query);
        const users = await usersCollection.findOne(query)
        res.send(users);

      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    // single user
    app.get('/users/:id', async (req, res) => {
      try {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await usersCollection.findOne(query)
        console.log(result);
        res.send(result)

      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    // put user
    app.put('/booking', async (req, res) => {
      try {
        const userinfo = req.body
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
            gander: userinfo.gander

          },
          $push: {
            course: userinfo.course
          }
        }
        console.log(updateId);

        const result = await usersCollection.updateOne(filter, updateId, option)

        console.log(result);


        res.send({
          success: true,
          data: result,
          message: 'Successfully '

        })
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })

      }
    })

    // admin
    app.get('/admin/:email', async (req, res) => {
      try {
        const email = req.params.email;
        console.log(email);
        const query = { email };
        console.log(query);
        const users = await usersCollection.findOne(query)
        const role = users?.roll === "admin"
        console.log(role);
        res.send(role);

      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    // post coupon collection
    app.post('/coupon', async (req, res) => {
      try {
        const coupon = req.body;
        const result = await couponCollection.insertOne(coupon);
        res.send({
          success: true,
          data: result,
          message: 'Successfully post '
        })
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    // get coupon collection
    app.get('/coupon', async (req, res) => {
      try {
        const query = {}

        const result = await couponCollection.find(query).toArray()

        res.send({
          success: true,
          data: result,
          message: 'Successfully '
        })
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    // single couponCollection
    app.get('/coupon/:id', async (req, res) => {
      try {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await couponCollection.findOne(query)
        console.log(result);
        res.send(result)

      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    // post refereeCollection collection
    app.post('/referee', async (req, res) => {
      try {
        const coupon = req.body;
        const result = await refereeCollection.insertOne(coupon);
        res.send({
          success: true,
          data: result,
          message: 'Successfully post data'
        })
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    // get refereeCollection collection
    app.get('/referee', async (req, res) => {
      try {
        const query = {}

        const result = await refereeCollection.find(query).toArray()

        res.send({
          success: true,
          data: result,
          message: 'Successfully'
        })
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    // single refereeCollection
    app.get('/referee/:id', async (req, res) => {
      try {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await refereeCollection.findOne(query)
        console.log(result);
        res.send(result)

      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    // delete addProduct id
    app.delete('/referee/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const query = await refereeCollection.deleteOne(filter);
        res.send({
          success: true,
          data: query,
          message: 'Successfully Delete'
        })

      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    // delete coupon id
    app.delete('/coupon/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const query = await couponCollection.deleteOne(filter);
        res.send({
          success: true,
          data: query,
          message: 'Successfully Delete'
        })

      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })


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
    app.get('/program', async (req, res) => {
      try {
        const query = {}

        const result = await programPriceData.find(query).toArray()

        res.send({
          success: true,
          data: result,
          message: 'Successfully '
        })
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    // get coupon collection

    app.get('/program/:id', async (req, res) => {
      try {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await programPriceData.findOne(query)
        console.log(result);
        res.send(result)

      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })
      }
    })

    // put report
    app.put('/newprice', async (req, res) => {
      try {

        const program = req.body;
        const id = program.id
        const filter = { _id: new ObjectId(id) };
        const option = { upsert: true };
        const updateId = {
          $set: {
            price: program.coupon
          }
        }
        const result = await programPriceData.updateOne(filter, updateId, option)
        console.log(result);
        res.send({
          success: true,
          data: result,
          message: 'Successfully get data'

        })
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        })

      }
    })


  } finally {

  }
}
run().catch(err => console.error(err));

// Amit server code






app.get("/", async (req, res) => {
  res.send("Geeks of Gurukul Server is running");
});

app.listen(port, () =>
  console.log(`Geeks of Gurukul Server running on ${port}`)
);
