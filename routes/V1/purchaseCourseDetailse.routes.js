// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect");
const { ObjectId } = require("mongodb");
const { sendNotify } = require("../../thirdPartyApp/socketIO/announcement");

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

// New API for addStudent to courses
router.post("/add-student-to-course", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const userBasicCollection = client
      .db("users")
      .collection("userBasicCollection");
    const coursePurchaseDetails = client
      .db("courseDatabase")
      .collection("coursePurchaseDetails");
    const coursePurchaseDetailsInfoTemp = req.body;
    // console.log("coursePurchaseDetailsInfo: ", coursePurchaseDetailsInfoTemp);
    //console.log(email);
    const queryForUser = {
      email: coursePurchaseDetailsInfoTemp?.purchaseInfo?.purchaseByEmail,
    };

    //console.log(query);
    const user = await userBasicCollection.findOne(queryForUser);
    console.log("user: ", user);
    if (user?._id) {
      const coursePurchaseDetailsInfo = {
        ...coursePurchaseDetailsInfoTemp,
      };
      coursePurchaseDetailsInfo.purchaseInfo.purchaseByName = user?.name;
      const query = {
        "program.program_id": coursePurchaseDetailsInfo?.program?.program_id,
        "course.course_id": coursePurchaseDetailsInfo?.course?.course_id,
        "batch.batch_id": coursePurchaseDetailsInfo?.batch?.batch_id,
        "purchaseInfo.purchaseByEmail":
          coursePurchaseDetailsInfo?.purchaseInfo?.purchaseByEmail,
      };
      const result = await coursePurchaseDetails.findOne(query);
      ////console.log("result: ", result);

      const announcement = {
        announcementTitle: `you have successfully purchased course `,
        announcementBody: `you have purchased course "${coursePurchaseDetailsInfo?.course?.courseName} with the following batch of "${coursePurchaseDetailsInfo?.batch?.batchName}"`,
        type: "course-purchased",
        details: {
          batch_id: coursePurchaseDetailsInfo?.batch?.batch_id,
          batchName: coursePurchaseDetailsInfo?.batch?.batchName,
        },
      };
      const receiverEmail = [
        coursePurchaseDetailsInfo?.purchaseInfo?.purchaseByEmail,
      ];

      if (result?._id) {
        // This course is already enrolled
        if (result?.isPaid) {
          // This course is already purchased
          // Done
          res.send({
            success: false,
            error: `you have already purchased this course in this batch ${coursePurchaseDetailsInfo?.batch?.batchName}`,
          });
        } else {
          // This course is enrolled but not paid yet
          // Now we need to update the document and we need to set the value isPaid, addedBy, discount, appliedPrice ,couponCode,paymentId
          const {
            isPaid,
            addedBy,
            discount,
            appliedPrice,
            couponCode,
            paymentId,
          } = coursePurchaseDetailsInfo;
          const updateInfo = {
            isPaid,
            addedBy,
            discount,
            appliedPrice,
            couponCode,
            paymentId,
            "purchaseInfo.paidAt":
              coursePurchaseDetailsInfo?.purchaseInfo?.paidAt,
          };
          console.log("coursePurchaseDetailsInfo: ", coursePurchaseDetailsInfo);
          const options = { upsert: true };
          const updateDoc = {
            $set: {
              ...updateInfo,
            },
          };
          const result3 = await coursePurchaseDetails.updateOne(
            query,
            updateDoc,
            options
          );
          if (result3?.modifiedCount) {
            sendNotify({ announcement, receiverEmail });
            res.send({
              success: true,
              message: "Student successfully added in this course",
            });
          } else {
            res.send({
              success: false,
              error: "Server internal error",
            });
          }
        }
      } else {
        // This course is not enrolled
        // Doneeeee
        const result2 = await coursePurchaseDetails.insertOne(
          coursePurchaseDetailsInfo
        );
        // We need to check result2.insertedId is here that means it's successfully purchased
        // otherwise it will be for server internal error
        if (result2) {
          sendNotify({ announcement, receiverEmail });
          res.send({
            success: true,
            message: "Student successfully added in this course",
          });
        } else {
          res.send({
            success: false,
            error: "Sever internal error",
          });
        }
      }
    } else {
      res.send({
        success: false,
        error: "student does not exist with this email",
      });
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
router.get("/my-courses", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const coursePurchaseDetails = client
      .db("courseDatabase")
      .collection("coursePurchaseDetails");
    const email = req?.query?.email;
    console.log("email: ", email);

    const query = {
      "purchaseInfo.purchaseByEmail": email,
    };
    const result = await coursePurchaseDetails.find(query).toArray();
    if (result?.length > 0) {
      res.send({
        success: true,
        data: result,
      });
    } else {
      res.send({
        success: false,
        error: "You haven't purchased any course",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

//api

module.exports = router;
