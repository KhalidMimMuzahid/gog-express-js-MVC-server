// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect");
const { ObjectId } = require("mongodb");

//initialize express router
const router = express.Router();

//api

router.post("/enroll-course", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const coursePurchaseDetails = client
      .db("courseDatabase")
      .collection("coursePurchaseDetails");
    const coursePurchaseDetailsInfo = req.body;
    ////console.log("coursePurchaseDetails: ", coursePurchaseDetails);

    const query = {
      "program.program_id": coursePurchaseDetailsInfo?.program?.program_id,
      "course.course_id": coursePurchaseDetailsInfo?.course?.course_id,
      "batch.batch_id": coursePurchaseDetailsInfo?.batch?.batch_id,
      "purchaseInfo.purchaseByEmail":
        coursePurchaseDetailsInfo?.purchaseInfo?.purchaseByEmail,
    };
    const result = await coursePurchaseDetails.findOne(query);
    ////console.log("result: ", result);
    //res.send(result);
    if (result?._id) {
      if (result?.isPaid) {
        // to do
        res.send({
          success: false,
          error: `you have already purchased this course in this batch ${coursePurchaseDetailsInfo?.batch?.batchName}`,
        });
      } else {
        res.send({
          success: true,
          message: "course successfully enrolled",
          data: result,
        });
      }
    } else {
      // to do
      const result2 = await coursePurchaseDetails.insertOne(
        coursePurchaseDetailsInfo
      );
      if (result2) {
        res.send({
          success: true,
          message: "course successfully enrolled",
          data: result2,
        });
      } else {
        res.send({
          success: false,
          error: "server internal error",
        });
      }
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
router.get("/enroll-course-info", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const coursePurchaseDetails = client
      .db("courseDatabase")
      .collection("coursePurchaseDetails");
    const _id = req?.query?._id;
    const query = { _id: new ObjectId(_id) };
    const result = await coursePurchaseDetails.findOne(query);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//api

module.exports = router;
