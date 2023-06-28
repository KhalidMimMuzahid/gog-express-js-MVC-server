// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect");
const { sendNotify } = require("../../thirdPartyApp/socketIO/announcement");
const moment = require("moment/moment");
const { formatDateTime } = require("../../utils/normalFunction");

//initialize express router
const router = express.Router();

//add Lecture
router.post("/lectureDetails", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const LectureDetails = client
      .db("courseDatabase")
      .collection("LectureDetails");
    const coursePurchaseDetails = client
      .db("courseDatabase")
      .collection("coursePurchaseDetails");
    const lecture = req.body;
    // console.log("lecture: ", lecture);

    // for the testing of socket io  end
    const result = await LectureDetails.insertOne(lecture);
    if (result?.insertedId) {
      const insertedIdString = result?.insertedId?.toString();
      const announcement = {
        announcementTitle: `lecture "${lecture?.lectureName}" has been released to course "${lecture?.course?.courseName}"`,
        announcementBody: `This lecture is going to be live in ${moment(
          formatDateTime(lecture?.startAt),
          "YYYY-MM-DD HH:mm"
        ).format(
          "Do MMMM (dddd), YYYY, h:mm:ss a"
        )}. So tighten your belt and get prepared to fly with us.`,
        type: "lecture-released",
        // triggeredAt: "21 June 2023",
        details: {
          lecture_id: insertedIdString,
          lectureName: lecture?.lectureName,
        },
      };

      const query = { "batch.batch_id": lecture?.batch?.batch_id };

      // console.log("query :", query);
      const options = {
        projection: { _id: 0, "purchaseInfo.purchaseByEmail": 1 },
      };
      const receivers = await coursePurchaseDetails
        .find(query, options)
        .toArray();
      const receiverEmail = receivers?.map(
        (each) => each?.purchaseInfo.purchaseByEmail
      );
      //
      // console.log("announcement: ", announcement);
      // console.log("receiverEmail: ", receiverEmail);
      sendNotify({ announcement, receiverEmail });
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
    console.log(lectures);
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
