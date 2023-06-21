// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect");
const { ObjectId } = require("mongodb");
//initialize express router
const router = express.Router();

//api

// for adding course(post)
router.post("/add-course", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const courseDetails = client
      .db("courseDatabase")
      .collection("courseDetails");
    const course = req.body;
    const query = {};
    const allData = await courseDetails.find(query).toArray();

    if (!allData?.length) {
      const result = await courseDetails.insertOne(course);
      if (result?.acknowledged) {
        res.send({ success: true, message: "course successfully added." });
      } else {
        res.send({
          success: false,
          message: "something went wrong, please try again.",
        });
      }
    } else {
      //to do
      // check the course data exist or not
      let isAlreadyExists = false;
      allData.forEach((each) => {
        if (
          each?.courseName?.toLowerCase() === course?.courseName?.toLowerCase()
        ) {
          isAlreadyExists = true;
          return;
        }
      });
      if (isAlreadyExists) {
        res.send({
          success: false,
          message:
            "this Course Name is already exists,\ncourse name must be unique",
        });
      } else {
        const result = await courseDetails.insertOne(course);
        if (result?.acknowledged) {
          res.send({ success: true, message: "course successfully added." });
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
      message: error.message,
    });
  }
});
//searching courses by program name
router.get("/all-courses-by-program", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const courseDetails = client
      .db("courseDatabase")
      .collection("courseDetails");
    const _id = req.query._id;

    const query = { "program.program_id": _id };
    const courses = await courseDetails.find(query).toArray();
    ////console.log(courses);
    res.send({ data: courses });
  } catch {
    res.send({ data: [] });
  }
});
//searching courses from courses list
router.get("/search-course", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const courseDetails = client
      .db("courseDatabase")
      .collection("courseDetails");
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
    // console.log(queryTemp);
    if (queryTemp?.program_id) {
      query = {
        "program.program_id": queryTemp?.program_id,
      };
    }
    if (queryTemp?.courseName) {
      query = {
        ...query,
        courseName: queryTemp?.courseName,
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
    // console.log(query);
    const data = await courseDetails.find(query).toArray();
    // console.log(data);
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
    console.log(error);
    res?.send({
      success: false,
      error: error.message,
    });
  }
});

// delete course by id
router.delete("/course/:id", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const courseDetails = client
      .db("courseDatabase")
      .collection("courseDetails");
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

// new api get course
router.get("/course/:id", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const courseDetails = client
      .db("courseDatabase")
      .collection("courseDetails");
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const course = await courseDetails.findOne(query);
    res.send({
      success: true,
      data: course,
      message: "Successfully get data",
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
// new api

//api

module.exports = router;
