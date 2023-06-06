// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect")

//initialize express router
const router = express.Router();

//add Lecture
router.post("/lectureDetails", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const LectureDetails = client
      .db("courseDatabase")
      .collection("LectureDetails");
    const lecture = req.body;
    //console.log(lecture);
    const result = await LectureDetails.insertOne(lecture);
    //console.log("result: ", result);
    if (result?.acknowledged) {
      res.send({
        success: true,
        data: result,
        message: "Lecture Successful Added",
      });
    } else {
      res.send({
        success: false,
        error: "Server internal error",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: "Server internal error",
    });
  }
});

router.get("/lecturesbymodule", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const LectureDetails = client
      .db("courseDatabase")
      .collection("LectureDetails");
    const _id = req?.query?._id;
    const query = { "module.module_id": _id };
    const lectures = await LectureDetails.find(query).toArray();
    console.log(lectures) 
    res.send(lectures);
  } catch (error) { 
    res.send([]);
  }
});

router.get("/search-lecture", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const LectureDetails = client
      .db("courseDatabase")
      .collection("LectureDetails");
    const queers = JSON.parse(req?.headers?.data);
    console.log("search lecture queries: ", queers);
    const queryObj = queers ? { ...queers } : {};
    const queryTemp = {};
    let query = {};
    const dataKeys = Object.keys(queryObj);
    dataKeys.forEach((key) => {
      if (queryObj[key]) {
        queryTemp[key] = queryObj[key];
      }
    });
    // console.log(queryTemp);
    if (queryTemp?.program_id) {
      query = {
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
    if (queryTemp?.lectureName) {
      query = {
        ...query,
        lectureName: queryTemp?.lectureName,
      };
    }
    if (queryTemp?.creatorEmail) {
      query = {
        ...query,
        "actionsDetails.creation.creatorEmail": queryTemp?.creatorEmail,
      };
    }
    console.log("query", query);
    const data = await LectureDetails.find(query).toArray();
    console.log("firstX", data);
    if (data?.length > 0) {
      res?.send({
        success: true,
        data: data,
        message: "Lecture found successfully",
      });
    } else {
      res?.send({
        success: false,
        message: "Server internal error",
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
