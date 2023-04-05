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



async function run(){
  try{

    // collection 1 
    const usersCollection = client.db('users').collection('usersCollection');
    const applyDataCollection = client.db('appliedUserDetails').collection('usersApplyDataCollection');


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

    // user(buyer and seller) data save------------
    app.put("/apply-data", async (req, res) => {
        const applyData = req.body;
        const email = applyData.email;
        const phone = applyData.phone;
        const filter = {$or: [ { email: email }, { phone: phone } ] }
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
      })


  }
  finally{

  }
}
run().catch(err => console.error(err));


app.get("/", async (req, res) => {
  res.send("Geeks of Gurukul Server is running");
});

app.listen(port, () =>
  console.log(`Geeks of Gurukul Server running on ${port}`)
);
