// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect");
const { ObjectId } = require("mongodb");

//initialize express router
const router = express.Router();

//exercise details
router.post("/exerciseDetails", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const exerciseCollection = client
      .db("courseDatabase")
      .collection("exerciseDetails");
    const exercise = req.body;
    // //console.log(exercise)
    const result = await exerciseCollection.insertOne(exercise);
    //console.log("result: ", result);
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

router.get("/exerciseSearch", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const exerciseCollection = client
      .db("courseDatabase")
      .collection("exerciseDetails");
    const queers = JSON.parse(req?.headers?.data);
    const queryTemp = queers ? { ...queers } : {};
    const query = {};
    if (queryTemp !== {}) {
      const dataKeys = Object.keys(queryTemp);
      dataKeys.forEach((key) => {
        if (queryTemp[key]) {
          query[key] = queryTemp[key];
        }
      });
    }

    // //console.log(query)
    const data = await exerciseCollection.find(query).toArray();
    if (data?.length > 0) {
      res?.send({
        success: true,
        data: data,
        message: "Exercise found successfully",
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

router.get("/exerciseby_id", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const exerciseCollection = client
      .db("courseDatabase")
      .collection("exerciseDetails");
    const _id = req?.query?._id;
    const query = { _id: new ObjectId(_id) };
    const exercise = await exerciseCollection.findOne(query);
    res.send(exercise);
  } catch (error) {
    res.send({});
  }
});

// Api for storing exercise state of each student
router.post("/exercise-response", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const exerciseResponse = client
      .db("examsReponse")
      .collection("exerciseResponse");
    const exerciseData = req.body;
    const query = {
      "lecture.lecture_id": exerciseData?.lecture?.lecture_id,
      "assignment.assignment_id": exerciseData?.assignment.assignment_id,
      "exercise.exercise_id": exerciseData?.exercise.exercise_id,
      "submissionDetails.studentEmail":
        exerciseData?.submissionDetails.studentEmail,
    };
    // Check if the data already exists

    const existingData = await exerciseResponse.findOne(query);
    // console.log(" query: ", query);
    // console.log(" existingData: ", existingData);
    if (!existingData) {
      // Save the data to the collection
      result = await exerciseResponse.insertOne(exerciseData);
      if (result) {
        res.send({
          success: true,
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
        success: true,
        message: "You have already started this exercise!",
      });
    }
  } catch (err) {
    res.send({
      success: false,
      message: "server internal error",
    });
  }
});

// Retrieve exercise state of a student
router.get("/exercise-response", async (req, res) => {
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
      "exercise.exercise_id": queryTemp?.exercise_id,
      "submissionDetails.studentEmail": queryTemp?.studentEmail,
    };

    // console.log(query);

    const existingData = await exerciseResponse.findOne(query);
    console.log(" query: ", query);
    console.log(" existingData: ", existingData);

    if (existingData) {
      res.send({
        success: true,
        message: "Exercise state retrieved successfully!",
        data: existingData,
      });
    } else {
      res.send({
        success: false,
        message: "Exercise state not found!",
      });
    }
  } catch (err) {
    res.send({
      success: false,
      message: "Server internal error",
    });
  }
});

// for updating exercise response
router.put("/exercise-response", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const exerciseResponse = client
      .db("examsReponse")
      .collection("exerciseResponse");
    const allDataForExerciseResponse = req.body;
    const { query, responseData } = allDataForExerciseResponse;
    const options = { upsert: true };
    const updateDoc = {
      $set: responseData,
    };
    // Check if the data already exists
    const updatedDataResponse = await exerciseResponse.updateOne(
      query,
      updateDoc,
      options
    );
    if (updatedDataResponse?.modifiedCount) {
      res.send({
        success: true,
        message: "exercise submitted successfully",
      });
    } else {
      res.send({
        success: false,
        message: "something went wrong,\nplease try again later.",
      });
    }
  } catch (err) {
    res.send({
      success: false,
      message: "server internal error",
    });
  }
});

// exercise response search

router.get("/search-exercise-response", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const exerciseResponse = client
      .db("examsReponse")
      .collection("exerciseResponse");
    const queers = JSON.parse(req?.headers?.data);
    console.log(queers);
    const queryObj = queers ? { ...queers } : {};
    const queryTemp = {};
    let query = { status: "completed" };
    const dataKeys = Object.keys(queryObj);
    dataKeys.forEach((key) => {
      if (queryObj[key]) {
        queryTemp[key] = queryObj[key];
      }
    });
    // console.log(queryTemp);
    if (queryTemp?.program_id) {
      query = {
        ...query,
        "program.program_id": queryTemp?.program_id,
      };
    }
    if (queryTemp?.course_id) {
      query = {
        ...query,
        "course.course_id": queryTemp?.course_id,
      };
    }
    if (queryTemp?.batch_id) {
      query = {
        ...query,
        "batch.batch_id": queryTemp?.batch_id,
      };
    }
    if (queryTemp?.module_id) {
      query = {
        ...query,
        "module.module_id": queryTemp?.module_id,
      };
    }
    if (queryTemp?.lecture_id) {
      query = {
        ...query,
        "lecture.lecture_id": queryTemp?.lecture_id,
      };
    }
    if (queryTemp?.assignment_id) {
      query = {
        ...query,
        "assignment.assignment_id": queryTemp?.assignment_id,
      };
    }
    if (queryTemp?.exercise_id) {
      query = {
        ...query,
        "exercise.exercise_id": queryTemp?.exercise_id,
      };
    }

    // console.log("query12", query);
    const data = await exerciseResponse.find(query).toArray();
    // console.log("firstX", data);
    if (data?.length > 0) {
      res?.send({
        success: true,
        data: data,
        message: "Lecture found successfully",
      });
    } else {
      res?.send({
        success: true,
        data: [],
        message: "Exercise Response not found",
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

// exercise update
router.put("/exercise-response-update/:id", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const exerciseResponse = client
      .db("examsReponse")
      .collection("exerciseResponse");
    const id = req.params.id;
    const { mark } = req.body;
    const query = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        mark: mark,
      },
    };
    // Check if the data already exists
    const updatedDataResponse = await exerciseResponse.updateOne(
      query,
      updateDoc,
      options
    );
    console.log(updatedDataResponse);
    if (updatedDataResponse?.modifiedCount) {
      res.send({
        success: true,
        message: "exercise submitted successfully",
      });
    } else {
      res.send({
        success: false,
        message: "something went wrong,\nplease try again later.",
      });
    }
  } catch (err) {
    res.send({
      success: false,
      message: "server internal error",
    });
  }
});

module.exports = router;
