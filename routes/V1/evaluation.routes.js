// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect");
const { ObjectId } = require("mongodb");

//initialize express router
const router = express.Router();

// for submitting evaluation response
router.post("/evaluation-response", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const evaluationResponse = client
      .db("examsReponse")
      .collection("evaluationResponse");
    const evaluationData = req.body;

    // console.log("evaluationData: ", evaluationData);
    const query = {
      "evaluation.evaluation_id": evaluationData?.evaluation?.evaluation_id,
      "submissionDetails.studentEmail":
        evaluationData?.submissionDetails?.studentEmail,
    };
    // Check if the data already exists
    const existingData = await evaluationResponse.findOne(query);
    // console.log(" query: ", query);
    // console.log(" existingData: ", existingData);
    if (!existingData) {
      // Save the data to the collection
      result = await evaluationResponse.insertOne(evaluationData);
      if (result) {
        res.send({
          success: true,
          result,
          message: "Data saved successfully!",
        });
      } else {
        // to
        res.send({
          success: false,
          message: "Data haven't saved successfully!",
        });
      }
    } else {
      res.send({
        success: false,
        message: "You have already started this assignment!",
      });
    }
  } catch (err) {
    console.log(err);
    res.send({
      success: false,
      message: "server internal error",
    });
  }
});
// for retriving students evaluation response
router.get("/evaluation-response", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const evaluationResponse = client
      .db("examsReponse")
      .collection("evaluationResponse");
    const queryString = req?.headers?.query;
    const queryTemp = JSON.parse(queryString);
    // console.log(query);
    // return res.send({message:'ok'})

    const query = {
      "evaluation.evaluation_id": queryTemp?.evaluation_id,
      "submissionDetails.studentEmail": queryTemp?.studentEmail,
    };
    // console.log(query);
    const existingData = await evaluationResponse.findOne(query);
    console.log(" query:xxxxxxxx ", query);
    console.log(" existingData: ", existingData);
    if (existingData) {
      res.send({
        success: true,
        message: "Assignment state retrieved successfully!",
        data: existingData,
      });
    } else {
      res.send({
        success: false,
        message: "Assignment state not found!",
      });
    }
  } catch (err) {
    res.send({
      success: false,
      message: "Server internal error",
    });
  }
});
router.get("/evaluation-exercises-response", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const exerciseResponse = client
      .db("examsReponse")
      .collection("exerciseResponse");
    const queryString = req?.headers?.query;
    const queryTemp = JSON.parse(queryString);
    // console.log(query);
    // return res.send({message:'ok'})

    const query = {
      "evaluation.evaluation_id": queryTemp?.evaluation_id,
      "submissionDetails.studentEmail": queryTemp?.studentEmail,
    };
    // console.log(query);
    const exercises = await exerciseResponse.find(query).toArray();
    // console.log(" query: ", query);
    // console.log(" existingData: ", exercises);
    if (exercises?.length > 0) {
      res.send({
        success: true,
        message: "Assignment exercises state retrieved successfully!",
        data: exercises,
      });
    } else {
      res.send({
        success: false,
        message: "Assignment state not found!",
      });
    }
  } catch (err) {
    res.send({
      success: false,
      message: "Server internal error",
    });
  }
});

module.exports = router;
