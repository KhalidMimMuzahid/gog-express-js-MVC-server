// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect");

//initialize express router
const router = express.Router();

router.get("/announcement", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const announcementDetails = client
      .db("notifications")
      .collection("announcementDetails");
    const receiverEmail = req?.query?.email;
    // console.log("Receiver email: ", receiverEmail);
    const query = {
      receiverEmail,
    };
    const announcements = await announcementDetails.find(query).toArray();
    // console.log("announcements: ", announcements);
    res.send(announcements);
  } catch (error) {
    res.send([]);
  }
});

module.exports = router;
