// all imports here...
const express = require("express");
const moment = require("moment");
const db = require("../../utils/dbConnect");

//initialize express router
const router = express.Router();

// users related api starts

//searching users
router.get("/search-user", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const userBasicCollection = client
      .db("users")
      .collection("userBasicCollection");
    const queers = JSON.parse(req?.headers?.data);
    // console.log(queers);
    const queryObj = queers ? { ...queers } : {};
    const queryTemp = {};
    const dataKeys = Object.keys(queryObj);
    dataKeys.forEach((key) => {
      if (queryObj[key]) {
        queryTemp[key] = queryObj[key];
      }
    });
    const data = await userBasicCollection.find(queryTemp).toArray();
    if (data?.length > 0) {
      res?.send({
        success: true,
        data: data,
        message: "user found successfully",
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
// checking duplicate user
router.get("/checkuseralreadyindatabase", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const userBasicCollection = client
      .db("users")
      .collection("userBasicCollection");
    const email = req?.query?.email;
    ////console.log("email: ", email);
    const query = { email: email };
    const result = await userBasicCollection.findOne(query);
    ////console.log("result check: ", result);
    if (result) {
      res.send({ isUserAlreadyExists: true });
    } else {
      res.send({ isUserAlreadyExists: false });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
// phone duplicate check
router.get("/checkphonealreadyinused/:number", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const userBasicCollection = client
      .db("users")
      .collection("userBasicCollection");
    // const number = req?.query?.number;
    const number = req?.params?.number;
    ////console.log("number: ", number);
    const query = { phoneNumber: number };
    const result = await userBasicCollection.findOne(query);
    ////console.log("result check: ", result);
    if (result) {
      res.send({ isNumberAlreadyExists: true });
    } else {
      res.send({ isNumberAlreadyExists: false });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// phone number verification
router.get("/checkuserphoneverified", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const userBasicCollection = client
      .db("users")
      .collection("userBasicCollection");
    const email = req?.query?.email;
    ////console.log("email: ", email);
    const query = { email: email };
    const result = await userBasicCollection.findOne(query);
    ////console.log("result check: ", result);
    if (result?.phoneNumber) {
      res.send({ isPhoneVerified: true });
    } else {
      res.send({ isPhoneVerified: false });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// users intial sign up data data save------------
router.post("/usersbasics", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const userBasicCollection = client
      .db("users")
      .collection("userBasicCollection");
    const userBasicDetails = req.body;
    ////console.log("userBasicDetails: ", userBasicDetails);
    const result = await userBasicCollection.insertOne(userBasicDetails);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
// update user detailse
router.put("/user-details", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const userBasicCollection = client
      .db("users")
      .collection("userBasicCollection");
    const userDetails = req.body;
    // console.log("userDetails: ", userDetails);
    const { profession, email, address } = userDetails;
    const filter = { email: email };
    const justNow = moment().format();
    const updateDoc = {
      $set: {
        justCreated: false,
        updatedAt: justNow,
        profession: profession,
        address: address,
      },
    };
    const options = { upsert: true };
    const result = await userBasicCollection.updateOne(
      filter,
      updateDoc,
      options
    );
    console.log(result);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
// update user phone number
router.put("/update-phone", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const userBasicCollection = client
      .db("users")
      .collection("userBasicCollection");
    const user = req.body;
    const { email, phoneNumber, displayName } = user;
    const filter = { email: email };
    const justNow = moment().format();
    const updateDoc = {
      $set: {
        phoneNumber: phoneNumber,
        name: displayName,
        updatedAt: justNow,
      },
    };
    const result = await userBasicCollection.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// get user by email
router.get("/userinfo/:email", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const userBasicCollection = client
      .db("users")
      .collection("userBasicCollection");
    const email = req.params.email;
    //console.log(email);
    const query = { email };

    //console.log(query);
    const user = await userBasicCollection.findOne(query);
    res.send(user);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
//edit user by email
router.put("/edit-user/:email", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const userBasicCollection = client
      .db("users")
      .collection("userBasicCollection");
    const email = req.params.email;
    // console.log(email);
    const userDetails = req.body;
    // console.log(userDetails)
    const filter = { email: email };
    const justNow = moment().format();
    let updateDoc = {};
    if (userDetails?.name && userDetails?.address) {
      updateDoc = {
        $set: {
          updatedAt: justNow,
          name: userDetails?.name,
          address: userDetails?.address,
        },
      };
    }
    if (userDetails?.photoURL) {
      updateDoc = {
        $set: {
          updatedAt: justNow,
          name: userDetails?.name,
          address: userDetails?.address,
          photoURL: userDetails?.photoURL,
        },
      };
    }
    if (userDetails?.profession) {
      updateDoc = {
        $set: {
          updatedAt: justNow,
          profession: userDetails?.profession,
        },
      };
    }
    console.log(updateDoc);
    const options = { upsert: true };
    const result = await userBasicCollection.updateOne(
      filter,
      updateDoc,
      options
    );
    console.log(result);
    if (result?.modifiedCount > 0) {
      res?.send({
        success: true,
        data: result,
        message: "Successfully updated data!",
      });
    } else {
      res?.send({
        success: false,
        message: "Internal Server Error",
      });
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
// update user skill
router.put("/update-skill", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const userBasicCollection = client
      .db("users")
      .collection("userBasicCollection");
    const skillsData = req.body;
    const { skills, email } = skillsData;
    console.log("skilldata", skills, email);
    const filter = { email: email };
    const justNow = moment().format();

    // Find the user document
    const user = await userBasicCollection.findOne(filter);

    if (user) {
      // User exists, update the skills array
      let updatedSkills;

      if (user.skills) {
        // If skills array already exists, create a Set from the existing skills
        const skillsSet = new Set(user.skills);

        // Add new unique skills to the Set
        skills.forEach((skill) => {
          skillsSet.add(skill);
        });

        // Convert the Set back to an array
        updatedSkills = Array.from(skillsSet);
      } else {
        // If skills array doesn't exist, use the new skills as the array
        updatedSkills = skills;
      }

      const updateDoc = {
        $set: {
          updatedAt: justNow,
          skills: updatedSkills,
        },
      };

      const result = await userBasicCollection.updateOne(filter, updateDoc);
      console.log(result);
      res.send(result);
    } else {
      // User doesn't exist, create a new document with the skills array
      const newDoc = {
        email: email,
        updatedAt: justNow,
        skills: skills,
      };

      const result = await userBasicCollection.insertOne(newDoc);
      console.log(result);
      res.send(result);
    }
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// users related api ends

module.exports = router;
