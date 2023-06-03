// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect");
const { ObjectId } = require("mongodb");

//initialize express router
const router = express.Router();

//api goes here
// adding new batch
router.post("/add-batch", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const batchDetails = client.db("courseDatabase").collection("batchDetails");
    const batch = req.body;
    // //console.log("batch: ", batch);
    //console.log("batch?.batchName: ", batch?.batchName);
    const query = {};
    const allData = await batchDetails.find(query).toArray();

    if (!allData?.length) {
      const result = await batchDetails.insertOne(batch);
      if (result?.acknowledged) {
        // //console.log("xxxxxxxxxxx", result);
        const filter = { _id: new ObjectId(batch?.course?.course_id) };
        const updateDoc = {
          $set: {
            currentBatch: batch?.batchName,
          },
        };
        const result2 = await courseDetails.updateOne(filter, updateDoc);
        //console.log("xxxxxxxx: ", result2);
        if (result2?.modifiedCount) {
          res.send({ success: true, message: "batch successfully added." });
        } else {
          res.send({
            success: false,
            message: "something went wrong, please try again.",
          });
        }
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
          each?.batchName?.toLowerCase() === batch?.batchName?.toLowerCase()
        ) {
          isAlreadyExists = true;
          return;
        }
      });
      if (isAlreadyExists) {
        res.send({
          success: false,
          message: "this Batch is already exists,\nbatch name must be unique",
        });
      } else {
        // to do:  we need to check here that the bacname is already exists or not

        const result3 = await batchDetails.insertOne(batch);
        if (result3?.acknowledged) {
          const filter = { _id: new ObjectId(batch?.course?.course_id) };
          const updateDoc = {
            $set: {
              currentBatch: batch?.batchName,
            },
          };
          const result2 = await courseDetails.updateOne(filter, updateDoc);
          //console.log("result2", result2);
          if (result2?.modifiedCount) {
            res.send({ success: true, message: "batch successfully added." });
          } else {
            res.send({
              success: false,
              message: "something went wrong, please try again.ccccccc",
            });
          }
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
// finding batchname
router.get("/batch", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const batchDetails = client.db("courseDatabase").collection("batchDetails");
    const batchName = req?.query?.batchName;
    const query = { batchName };

    const options = {
      projection: { _id: 1, batchName: 1 },
    };

    const result = await batchDetails.findOne(query, options);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
// getting batches by coursename
router.get("/all-batches-by-course", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const batchDetails = client.db("courseDatabase").collection("batchDetails");
    const _id = req.query._id;

    const query = { "course.course_id": _id };
    const batches = await batchDetails.find(query).toArray();
    res.send({ data: batches });
  } catch {
    res.send({ data: [] });
  }
});

//searching batches from batch collections
router.get("/search-batch", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const batchDetails = client.db("courseDatabase").collection("batchDetails");
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
    if (queryTemp?.batchName) {
      query = { ...query, batchName: queryTemp?.batchName };
    }
    console.log(query);
    const data = await batchDetails.find(query).toArray();
    console.log(data);
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

// delete batch id
router.delete("/batch/:id", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const batchDetails = client.db("courseDatabase").collection("batchDetails");
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
//api goes here

module.exports = router;
