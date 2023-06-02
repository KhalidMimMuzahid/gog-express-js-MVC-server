// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect")


//initialize express router
const router = express.Router();

// api
//all modules and search
router.get("/search-module", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const moduleDetails = client
    .db("courseDatabase")
    .collection("moduleDetails");
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
    if (queryTemp?.program_id && queryTemp?.course_id) {
      query = {
        "course.course_id": queryTemp?.course_id,
        "program.program_id": queryTemp?.program_id,
      };
    } else if (queryTemp?.program_id) {
      query = {
        "program.program_id": queryTemp?.program_id,
      };
    } else if (queryTemp?.course_id) {
      query = {
        "course.course_id": queryTemp?.course_id,
      };
    }
    if (queryTemp?.batch_id) {
      query = { ...query, "batch.batch_id": queryTemp?.batch_id };
      console.log("Query is", query);
    }
    // console.log(query);
    const data = await moduleDetails.find(query).toArray();
    console.log("data", data);
    if (data?.length > 0) {
      res?.send({
        success: true,
        data: data,
        message: "Module found successfully",
      });
    } else {
      res?.send({
        success: false,
        message: "Module Not Found!",
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

router.get("/all-modules-by-batch", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const moduleDetails = client
    .db("courseDatabase")
    .collection("moduleDetails");
    const _id = req.query._id;

    const query = { "batch.batch_id": _id };
    const modules = await moduleDetails.find(query).toArray();
    res.send({ data: modules });
  } catch {
    res.send({ data: [] });
  }
});

router.post("/moduleDetails", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const moduleDetails = client
    .db("courseDatabase")
    .collection("moduleDetails");

    const moduleDetailsInfo = req.body;

    // const result = await moduleDetails.insertOne(moduleDetails);
    const query = {
      "program.program_id": moduleDetailsInfo?.program?.program_id,
      "course.course_id": moduleDetailsInfo?.course?.course_id,
      "batch.batch_id": moduleDetailsInfo?.batch?.batch_id,
      moduleName: moduleDetailsInfo?.moduleName,
    };

    const result = await moduleDetails.findOne(query);

    if (!result?._id) {
      const result2 = await moduleDetails.insertOne(moduleDetailsInfo);
      if (result2?.acknowledged) {
        res.send({
          success: true,
          message: "Module Successful Added",
        });
      } else {
        res.send({
          success: false,
          error: "Server internal error",
        });
      }
    } else {
      res?.send({
        success: false,
        error: "This Module Name has already been exists in this course",
      });
    }
  } catch (error) {
    res?.send({
      success: false,
      error: "Server internal error",
    });
  }
});

router.get("/modulesbycourseandbatch", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const moduleDetails = client.db("courseDatabase").collection("moduleDetails");
    const queryObj = req.query;
    // console.log("queryObj: ", queryObj);
    const { course_id, batch_id } = queryObj;
    const query = { "course.course_id": course_id, "batch.batch_id": batch_id };
    const courses = await moduleDetails.find(query).toArray();
    res.send(courses);
  } catch (error) {
    res.send([]);
  }
});

// api

module.exports = router;
