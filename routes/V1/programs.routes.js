// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect")



//initialize express router
const router = express.Router();

//api start
// list of programs
router.get("/all-program", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const programDetails = client
    .db("courseDatabase")
    .collection("programDetails");
    const query = {};
    const allProgram = await programDetails.find(query).toArray();
    res.send({ data: allProgram });
  } catch {
    res.send({ data: [] });
  }

});

// dfor posting new program
router.post("/add-program", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const programDetails = client
    .db("courseDatabase")
    .collection("programDetails");
    const program = req?.body;
    ////console.log("program", program);
    const query = {};
    const allData = await programDetails.find(query).toArray();
    ////console.log("hiii", allData);
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
          message:
            "this program Name is already exists, \nprogram name must be unique.",
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

//all programs and search
router.get("/program-list", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const programDetails = client
    .db("courseDatabase")
    .collection("programDetails");
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
    //console.log(query);
    const data = await programDetails.find(query).toArray();
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

// api ends

module.exports = router;