// all imports here...

const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SK);
const moment = require("moment");
const db = require("../../utils/dbConnect");
const { ObjectId } = require("mongodb");

//initialize express router
const router = express.Router();

// api
// for payment intent
router.post("/create-payment-intent", async (req, res) => {
  // //console.log("hoina keno");
  try {
    const { price } = req.body;
    const amount = price * 100;
    // //console.log(price, ":::::::::", amount);
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "inr",
      amount: amount,
      payment_method_types: ["card"],
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log("errr", error);
    res.send({
      success: false,
      error: error.message,
    });
  }
});
// for setting payment status
router.post("/setpaymentstatus", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const coursePurchaseDetails = client
    .db("courseDatabase")
    .collection("coursePurchaseDetails");
    const query = req.query;
    const { _id, paymentId } = query;

    const filter = {
      _id: new ObjectId(_id),
    };
    const options = { upsert: true };

    const updateDoc = {
      $set: {
        isPaid: true,
        paymentId,
        "purchaseInfo.paidAt": moment().format(),
      },
    };
    const result = await coursePurchaseDetails.updateOne(
      filter,
      updateDoc,
      options
    );
    console.log(result);
    if (result?.modifiedCount) {
      res.send({
        success: true,
        message: "you have succesfully paid this course",
      });
    } else {
      res.send({
        success: false,
        error:
          "You have successfully paid, \nbut it's not updated   on our system\n please note this payment id and contact our team.",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error:
        "You have successfully paid, \nbut it's not updated   on our system\n please note this payment id and contact our team.",
    });
  }
});
// api

module.exports = router;