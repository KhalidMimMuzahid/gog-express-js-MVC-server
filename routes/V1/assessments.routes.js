// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect");
const { ObjectId } = require("mongodb");

//initialize express router
const router = express.Router();

router.post("/add-assesment", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const assesmentData = client
      .db("questionsBank")
      .collection("assesmentData");
    const assesment = req.body;
    const result = await assesmentData.insertOne(assesment);
    // //console.log("result: ", result);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
//all assessment and search
router.get("/search-assessment", async (req, res) => { 
  try {
    const client = db.getClient(); // Use the existing database client
    const assesmentData = client
      .db("questionsBank")
      .collection("assesmentData");
    const queers = JSON.parse(req?.headers?.data);
    //console.log(queers);
    const queryObj = queers ? { ...queers } : {};
    const queryTemp = {};
    let query = {};
    const dataKeys = Object.keys(queryObj);
    dataKeys.forEach((key) => {
      if (queryObj[key]) {
        queryTemp[key] = queryObj[key];
      }
    });
    console.log(queryTemp);
    if (queryTemp?.assessmentName) {
      query = {
        assessmentName: queryTemp?.assessmentName,
      };
    }
    if (queryTemp?.categoryName) {
      query = {
        ...query,
        categoryName: queryTemp?.categoryName,
      };
    }
    if (queryTemp?.batchId) {
      query = {
        ...query,
        batchId: queryTemp?.batchId,
      };
    }
    if (queryTemp?.creatorEmail) {
      query = {
        ...query,
        "actionsDetails.creation.creatorEmail": queryTemp?.creatorEmail,
      };
    }
    if (queryTemp?.updaterEmail) {
      query = {
        ...query,
        "actionsDetails.updation.updatorEmail": queryTemp?.updaterEmail,
      };
    }
    console.log(query);
    const data = await assesmentData.find(query).toArray();
    // console.log("data", data);
    if (data?.length > 0) {
      res?.send({
        success: true,
        data: data,
        message: "Assessment found successfully",
      });
    } else {
      res?.send({
        success: false,
        message: "Don't have any data!",
      });
    }
  } catch (error) {
    console.log(error);
    res?.send({
      success: false,
      error: error.message,
    });
  }
});

router.get("/assessments", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const assesmentData = client
      .db("questionsBank")
      .collection("assesmentData");
    const result = await assesmentData.find().toArray();
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
router.get("/assessment", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const assesmentData = client
      .db("questionsBank")
      .collection("assesmentData");
    const _id = req?.query?._id;
    ////console.log("_id: ", _id);
    const query = { _id: new ObjectId(_id) };
    const result = await assesmentData.findOne(query);
    // //console.log("result: ", result);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
router.get("/assessmentlabel", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const assesmentData = client
      .db("questionsBank")
      .collection("assesmentData");
    const _id = req?.query?._id;
    ////console.log("_id: ", _id);
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
    // //console.log("result: ", result);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
router.post("/assessment-response", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const assesmentResponseData = client
      .db("examsReponse")
      .collection("assesmentResponseData");
    const response = req.body;
    // //console.log("response: ", response);
    const result = await assesmentResponseData.insertOne(response);
    ////console.log("response:", response);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
router.get("/assessment-response", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const assesmentResponseData = client
      .db("examsReponse")
      .collection("assesmentResponseData");
    const _id = req?.query?._id;
    ////console.log("_id: ", _id);
    const query = { _id: new ObjectId(_id) };
    const result = await assesmentResponseData.findOne(query);
    // //console.log("result: ", result);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
router.get("/assessment-responses", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const assesmentResponseData = client
      .db("examsReponse")
      .collection("assesmentResponseData");
    const email = req?.query?.email;
    ////console.log("email: ", email);
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

// search assessment responses search

router.get("/assessment-responses-search", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
        const assesmentData = client.db("questionsBank").collection("assesmentData"); 
        const assesmentResponseData = client.db("examsReponse").collection("assesmentResponseData");

    const email = req?.query?.email;
    const queryObj = JSON.parse(req?.headers?.data);
    var assessmentResponseResult = [];

    const queryTemp = {};
    let query = {};
    const dataKeys = Object.keys(queryObj);
    dataKeys.forEach((key) => {
      if (queryObj[key]) {
        queryTemp[key] = queryObj[key];
      }
    });

    if (queryTemp?.assessmentName) {
      query = {
        assessmentName: queryTemp?.assessmentName,
      };
    }
    if (queryTemp?.categoryName) {
      query = {
        ...query,
        categoryName: queryTemp?.categoryName,
      };
    }

    const assessments = await assesmentData.find(query).toArray();
    // console.log(assessments)

    if (assessments?.length > 0) {
      // Create an array to store the promises returned by the map function
      const promises = assessments.map(async (assessment) => {
        const assessmentResponseQuery = {
          assessmentId: assessment?._id?.toString(),
          studentEmail: email, // "cto@geeksofgurukul.com"
        };

        const result = await assesmentResponseData.find(assessmentResponseQuery).toArray();
        return result;
      });

      // Use Promise.all to wait for all promises to resolve
      const assessmentResponseResults = await Promise.all(promises);

      // Flatten the array of arrays into a single array
      assessmentResponseResult = assessmentResponseResults.flat();

      // console.log("result", assessmentResponseResult.length);
      res?.send({
        success: true,
        data: assessmentResponseResult, // Send the assessment response data
        message: "Assessment found successfully",
      });
    } else {
      res?.send({
        success: false,
        message: "Don't have any data!",
      });
    }
  } catch (error) {
    console.log(error);
    res?.send({
      success: false,
      error: error.message,
    });
  }
});
module.exports = router;
