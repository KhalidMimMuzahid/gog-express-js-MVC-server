// all imports here...
const express = require("express");
const db = require("../../utils/dbConnect");

//initialize express router
const router = express.Router();

// api
//for uploading questions
router.post("/add-csv-data", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const csvBulkData = client.db("questionsBank").collection("csvBulkData");
    const data = req.body;
    // //console.log("data: ", data);
    const result = await csvBulkData.insertMany(data);
    res.send(result);
    ////console.log("result: ", result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
//for searching and getting questions
router.get("/get-questions", async (req, res) => {
  try {
    const client = db.getClient(); // Use the existing database client
    const csvBulkData = client.db("questionsBank").collection("csvBulkData");
    const searchParameteresForQueriesString =
      req.headers.searchparameteresforqueries;
    const searchParameteresForQueries = JSON.parse(
      searchParameteresForQueriesString
    );
    // //console.log("searchParameteresForQueries: ", searchParameteresForQueries);
    const { topicName, questionName, difficultyLevel } =
      searchParameteresForQueries;
    let query = {};
    if (topicName) query.topicName = topicName;
    if (questionName) query.questionName = questionName;
    if (difficultyLevel) query.difficultyLevel = difficultyLevel;
    //console.log("query: ", query);
    if (!Object.keys(query).length) {
      //console.log("xxxxxxxxxxxxxxxxx");
      return res.send([]);
    }

    // const query = { runtime: { $lt: 15 } };
    // const options = {
    //   // sort returned documents in ascending order by title (A->Z)
    //   sort: { title: 1 },
    //   // Include only the title and imdb fields in each returned document
    //   projection: { _id: 0, title: 1, imdb: 1 },
    // };
    const result = await csvBulkData.find(query).toArray();
    // //console.log("result: ", result);
    res.send(result);
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// api

module.exports = router;
