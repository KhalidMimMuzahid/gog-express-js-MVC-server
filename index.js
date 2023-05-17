const express = require("express");
const cors = require("cors");
const moment = require("moment");
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const e = require("express");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URL;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// courseCollection
const courseDetails = client.db("courseDatabase").collection("courseDetails");
//assignment Collection
const assignmentDetails = client
  .db("courseDatabase")
  .collection("assignmentDetails");
// Collection
const exerciseCollection = client
  .db("courseDatabase")
  .collection("exerciseDetails");
//BatchCollection
const batchDetails = client.db("batchDatabase").collection("batchDetails");

const userBasicCollection = client
  .db("users")
  .collection("userBasicCollection");
const userDetailsCollection = client
  .db("users")
  .collection("userDetailsCollection");

const csvBulkData = client.db("questionsBank").collection("csvBulkData");
const assesmentData = client.db("questionsBank").collection("assesmentData");
const assesmentResponseData = client
  .db("examsReponse")
  .collection("assesmentResponseData");
  
  const programDetails = client.db("courseDatabase").collection("programDetails");
  const couponDetails = client.db("courseDatabase").collection("couponDetails");


app.get("/all-program", async (req, res) => {
  try{
    const query = {};
    const allProgram = await programDetails.find(query).toArray();
    res.send({data: allProgram})
  }catch{
    res.send({data: []})
  }
})

app.post("/add-program", async (req, res) => {
  try {
    const program = req?.body;
    //console.log("program", program);
    const query = {};
    const allData = await programDetails.find(query).toArray();
    //console.log("hiii", allData);
    if (!allData?.length) {
      const result = await programDetails.insertOne(program);
      if (result?.acknowledged) {
        res.send({ success: true, message: "program successfully added." });
      } else {
        res.send({
          success: false,
          message: "something went wrong, please try again.",
        });
      }
    } else {
      //to do
      // check the program data exist or not
      let isAlreadyExists = false;
      allData.forEach((each) => {
        if (
          each?.programName?.toLowerCase() ===
          program?.programName?.toLowerCase()
        ) {
          isAlreadyExists = true;
          return;
        }
      });
      if (isAlreadyExists) {
        res.send({
          success: false,
          message: "this program Name is already exists",
        });
      } else {
        const result = await programDetails.insertOne(program);
        if (result?.acknowledged) {
          res.send({ success: true, message: "program successfully added." });
        } else {
          res.send({
            success: false,
            message: "something went wrong, please try again.",
          });
        }
      }
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.get("/checkuseralreadyindatabase", async (req, res) => {
  try {
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
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.get("/checkphonealreadyinused/:number", async (req, res) => {
  try {
    // const number = req?.query?.number;
    const number = req?.params?.number;
    console.log("number: ", number);
    const query = { phoneNumber: number };
    const result = await userBasicCollection.findOne(query);
    console.log("result check: ", result);
    if (result) {
      res.send({ isNumberAlreadyExists: true });
    } else {
      res.send({ isNumberAlreadyExists: false });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// phone number verification
app.get("/checkuserphoneverified", async (req, res) => {
  try {
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
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// user(buyer and seller) intial sign up data data save------------
app.post("/usersbasics", async (req, res) => {
  try {
    const userBasicDetails = req.body;
    console.log("userBasicDetails: ", userBasicDetails);
    const result = await userBasicCollection.insertOne(userBasicDetails);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
app.post("/user-details", async (req, res) => {
  try {
    const userDetails = req.body;
    console.log("userDetails: ", userDetails);
    const result = await userDetailsCollection.insertOne(userDetails);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
app.put("/update-phone", async (req, res) => {
  try {
    const user = req.body;
    const { email, phoneNumber, displayName } = user;
    const filter = { email: email };
    const justNow = moment().format();
    const updateDoc = {
      $set: {
        phoneNumber: phoneNumber,
        name: displayName,
        updatedAt: justNow,
      },
    };
    const result = await userBasicCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.put("/just-created-false", async (req, res) => {
  try {
    const email = req?.query?.email;
    const filter = { email: email };
    const justNow = moment().format();
    const updateDoc = {
      $set: {
        justCreated: false,
        updatedAt: justNow,
      },
    };
    const result = await userBasicCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// get user by email
app.get("/userinfo/:email", async (req, res) => {
  try {
    const email = req.params.email;
    console.log(email);
    const query = { email };

    console.log(query);
    const user = await userBasicCollection.findOne(query);
    res.send(user);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.post("/add-csv-data", async (req, res) => {
  try {
    const data = req.body;
    // console.log("data: ", data);
    const result = await csvBulkData.insertMany(data);
    res.send(result);
    console.log("result: ", result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.get("/get-questions", async (req, res) => {
  try {
    const searchbParameteresForQueriesString =
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
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.post("/add-assesment", async (req, res) => {
  try {
    const assesment = req.body;
    const result = await assesmentData.insertOne(assesment);
    // console.log("result: ", result);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
app.get("/assessments", async (req, res) => {
  try {
    const result = await assesmentData.find().toArray();
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
app.get("/assessment", async (req, res) => {
  try {
    const _id = req?.query?._id;
    console.log("_id: ", _id);
    const query = { _id: new ObjectId(_id) };
    const result = await assesmentData.findOne(query);
    // console.log("result: ", result);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
app.get("/assessmentlabel", async (req, res) => {
  try {
    const _id = req?.query?._id;
    console.log("_id: ", _id);
    const query = { _id: new ObjectId(_id) };
    const options = {
      // Include only the `title` and `imdb` fields in each returned document
      projection: {
        assessmentName: 1,
        duration: 1,
        categoryName: 1,
      },
    };
    const result = await assesmentData.findOne(query, options);
    // console.log("result: ", result);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
app.post("/assessment-response", async (req, res) => {
  try {
    const response = req.body;
    // console.log("response: ", response);
    const result = await assesmentResponseData.insertOne(response);
    console.log("response:", response);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
app.get("/assessment-response", async (req, res) => {
  try {
    const _id = req?.query?._id;
    console.log("_id: ", _id);
    const query = { _id: new ObjectId(_id) };
    const result = await assesmentResponseData.findOne(query);
    console.log("result: ", result);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
app.get("/assessment-responses", async (req, res) => {
  try {
    const email = req?.query?.email;
    console.log("email: ", email);
    const query = { studentEmail: email };

    const options = {
      sort: {
        startedAt: 1,
      },
      // Include only the `title` and `imdb` fields in each returned document
      projection: {
        title: 1,
        startedAt: 1,
        totalMark: 1,
        assessmentId: 1,
        aboutResponse: 1,
      },
    };
    const result = await assesmentResponseData.find(query, options).toArray();

    res.send(result);
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
  try {
    const batch = req.body;
    const result = await batchDetails.insertOne(batch);
    console.log("result: ", result);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// for adding course(post)
app.post("/add-course", async (req, res) => {
  try {
    const course = req.body;
    const result = await courseDetails.insertOne(course);
    console.log("result: ", result);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//for getting course list
app.get("/course-list", async (req, res) => {
  try {
    const query = {};
    const data = await courseDetails.find(query).toArray();
    res.send(data);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//for getting batch list
app.get("/batch-list", async (req, res) => {
  try {
    const query = {};
    const data = await batchDetails.find(query).toArray();
    res.send(data);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// delete course id
app.delete("/course/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const query = await courseDetails.deleteOne(filter);
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
// delete batch id
app.delete("/batch/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const query = await batchDetails.deleteOne(filter);
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

// LMS API

//assignments details
app.post("/assignmentDetails", async (req, res) => {
  try {
    const assignment = req.body;
    console.log(assignment);
    const result = await assignmentDetails.insertOne(assignment);
    console.log("result: ", result);
    if (result?.acknowledged) {
      res.send({
        success: true,
        data: result,
        message: "Assignment Successful Added",
      });
    } else {
      res.send({
        success: false,
        message: "Server internal error",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//assignments details
app.post("/exerciseDetails", async (req, res) => {
  try {
    const exercise = req.body;
    console.log(assignment);
    const result = await exerciseCollection.insertOne(exercise);
    console.log("result: ", result);
    if (result?.acknowledged) {
      res.send({
        success: true,
        data: result,
        message: "Exercise Successful Added",
      });
    } else {
      res.send({
        success: false,
        message: "Server internal error",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

app.get("/exerciseSearch", async (req, res) => {
  try {
    const query = {};
    const data = await exerciseCollection.find(query).toArray();
    if (data) {
      res.send({
        success: true,
        data: data,
        message: "Exercise Successful Added",
      });
    } else {
      res.send({
        success: false,
        message: "Server internal error",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});


app.post("/coupon-details", async (req, res) => {
  try {
    const couponDetailsFromUI = req.body;
    console.log("couponDetails: ", couponDetailsFromUI);
    const result = await couponDetails.insertOne(couponDetailsFromUI);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// Amit server code

app.get("/", async (req, res) => {
  res.send("Geeks of Gurukul Server is running");
});

app.listen(port, () =>
  console.log(`Geeks of Gurukul Server running on ${port}`)
);
