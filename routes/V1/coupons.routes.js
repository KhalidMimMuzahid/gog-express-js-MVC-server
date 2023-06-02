// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect")

//initialize express router
const router = express.Router();

// api

router.post("/coupon-details", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const couponDetails = client
      .db("courseDatabase")
      .collection("couponDetails");
    const couponDetailsFromUI = req.body;
    //console.log("couponDetails: ", couponDetailsFromUI);
    const result = await couponDetails.insertOne(couponDetailsFromUI);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// coupons search
router.get("/all-coupons", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const couponDetails = client
      .db("courseDatabase")
      .collection("couponDetails");
    const queers = JSON.parse(req?.headers?.data);

    const queryTemp = queers ? { ...queers } : {};
    let query = {};
    const dataKeys = Object.keys(queryTemp);
    dataKeys.forEach((key) => {
      if (queryTemp[key]) {
        query[key] = queryTemp[key];
      }
    });
    if (query?.creatorEmail && query?.updaterEmail) {
      query = {
        "actionsDetails.creation.creatorEmail": query?.creatorEmail,
        "actionsDetails.updation.updaterEmail": query?.updaterEmail,
      };
    } else if (query?.creatorEmail) {
      query = {
        "actionsDetails.creation.creatorEmail": query?.creatorEmail,
      };
    } else if (query?.updaterEmail) {
      query = {
        "actionsDetails.updation.updaterEmail": query?.updaterEmail,
      };
    }

    // console.log(query);
    if (queers.couponLabel) {
      query = {
        ...query,
        couponLabel: queers.couponLabel,
      };
    }

    const data = await couponDetails.find(query).toArray();
    if (data?.length > 0) {
      res?.send({
        success: true,
        data: data,
        message: "Assignment found successfully",
      });
    } else {
      res?.send({
        success: true,
        data: data,
        message: "No coupons found",
      });
    }
  } catch (error) {
    res?.send({
      success: false,
      error: error.message,
    });
  }
});

// api

module.exports = router;
