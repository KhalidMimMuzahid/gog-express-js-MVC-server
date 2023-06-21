// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect");
const { ObjectId } = require("mongodb");

//initialize express router
const router = express.Router();

//assignments details
router.post("/assignmentDetails", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const assignmentDetails = client
      .db("courseDatabase")
      .collection("assignmentDetails");
    const assignment = req.body;
    //console.log(assignment);
    const result = await assignmentDetails.insertOne(assignment);
    //console.log("result: ", result);
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
//getting exercise by assignment_id.
router.get("/assignmentby_id", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const assignmentDetails = client
      .db("courseDatabase")
      .collection("assignmentDetails");
    const _id = req?.query?._id;
    const query = { _id: new ObjectId(_id) };
    const assignment = await assignmentDetails.findOne(query);
    res.send(assignment);
  } catch (error) {
    res.send({});
  }
});

// search assignment
router.get("/searchAssignment", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const assignmentDetails = client
      .db("courseDatabase")
      .collection("assignmentDetails");
    const queers = JSON.parse(req?.headers?.data);
    //console.log(queers);
    const queryTemp = queers ? { ...queers } : {};
    const query = {};
    const dataKeys = Object.keys(queryTemp);
    dataKeys.forEach((key) => {
      if (queryTemp[key]) {
        query[key] = queryTemp[key];
      }
    });

    // //console.log(query)
    const data = await assignmentDetails.find(query).toArray();
    if (data?.length > 0) {
      res?.send({
        success: true,
        data: data,
        message: "Assignment found successfully",
      });
    } else {
      res?.send({
        success: false,
        message: "Server internal error",
      });
    }
  } catch (error) {
    res?.send({
      success: false,
      error: error.message,
    });
  }
});
// for submitting assignment response
router.post("/assignment-response", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const assignmentResponse = client
      .db("examsReponse")
      .collection("assignmentResponse");
    const assignmentData = req.body;
    const query = {
      "lecture.lecture_id": assignmentData?.lecture?.lecture_id,
      "assignment.assignment_id": assignmentData?.assignment?.assignment_id,
      "submissionDetails.studentEmail":
        assignmentData?.submissionDetails?.studentEmail,
    };
    // Check if the data already exists
    const existingData = await assignmentResponse.findOne(query);
    // console.log(" query: ", query);
    // console.log(" existingData: ", existingData);
    if (!existingData) {
      // Save the data to the collection
      result = await assignmentResponse.insertOne(assignmentData);
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
    res.send({
      success: false,
      message: "server internal error",
    });
  }
});
// for retriving students assignment response
router.get("/assignment-response", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const assignmentResponse = client
      .db("examsReponse")
      .collection("assignmentResponse");
    const queryString = req?.headers?.query;
    const queryTemp = JSON.parse(queryString);
    // console.log(query);
    // return res.send({message:'ok'})
    const query = {
      "lecture.lecture_id": queryTemp?.lecture_id,
      "assignment.assignment_id": queryTemp?.assignment_id,
      "submissionDetails.studentEmail": queryTemp?.studentEmail,
    };
    // console.log(query);
    const existingData = await assignmentResponse.findOne(query);
    console.log(" query: ", query);
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
router.get("/assignment-exercises-response", async (req, res) => {
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
      "lecture.lecture_id": queryTemp?.lecture_id,
      "assignment.assignment_id": queryTemp?.assignment_id,
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
