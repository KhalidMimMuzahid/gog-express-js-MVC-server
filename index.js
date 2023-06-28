require("dotenv").config();
const express = require("express");
const cors = require("cors");
const programsRoutes = require("./routes/V1/programs.routes");
const userRoutes = require("./routes/V1/users.routes");
const assessmentRoutes = require("./routes/V1/assessments.routes");
const assignmentsRoutes = require("./routes/V1/assignments.routes");
const evaluationsRoutes = require("./routes/V1/evaluation.routes");
const batchesRoutes = require("./routes/V1/batches.routes");
const couponRoutes = require("./routes/V1/coupons.routes");
const coursesRoutes = require("./routes/V1/courses.routes");
const exerciseRoutes = require("./routes/V1/exercises.routes");
const modulesRoute = require("./routes/V1/modules.routes");
const paymentsRoute = require("./routes/V1/payments.routes");
const programsRoute = require("./routes/V1/programs.routes");
const purchaseCourseDetailseRoute = require("./routes/V1/purchaseCourseDetailse.routes");
const questionsRoute = require("./routes/V1/questions.routes");
const lecturesRoute = require("./routes/V1/lectures.routes");
const notificationsRoute = require("./routes/V1/notifications.routes");
const db = require("./utils/dbConnect");
// const { Server } = require("socket.io");
const { notify } = require("./thirdPartyApp/socketIO/announcement");

// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');;
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();
// import { Server } from "socket.io";
// middleware
app.use(cors());
app.use(express.json());

// Connect to the database
db.connect()
  .then(() => {})
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });
const server = app.listen(port, () =>
  console.log(`Geeks of Gurukul Server running on ${port}`)
);
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  notify(io, socket);
});

//assessment related api
app.use("/api/v1/assessments", assessmentRoutes);
//assessment related api
//Assignments related API
app.use("/api/v1/assignments", assignmentsRoutes);
//Assignments related API
//Evaluations related API
app.use("/api/v1/evaluations", evaluationsRoutes);
//Evaluations related API
//Batches related API
app.use("/api/v1/batches", batchesRoutes);
//Batches related API
//Coupons related API
app.use("/api/v1/coupons", couponRoutes);
//Coupons related API
//courses related API
app.use("/api/v1/courses", coursesRoutes);
//courses related API
//Exercises related API
app.use("/api/v1/exercises", exerciseRoutes);
//Exercises related API
//Lectures related API
app.use("/api/v1/lectures", lecturesRoute);
//Lectures related API
//Modules related API
app.use("/api/v1/modules", modulesRoute);
//Modules related API
//Payments related API
app.use("/api/v1/payments", paymentsRoute);
//Payments related API
//Programs related API
app.use("/api/v1/programs", programsRoute);
//Programs related API
//Parchases course related API
app.use("/api/v1/purchasesCourse", purchaseCourseDetailseRoute);
//Parchases course related API
//Questions related API
app.use("/api/v1/questions", questionsRoute);
//Questions related API
//Notifications related API
app.use("/api/v1/notifications", notificationsRoute);
//Notifications related API
//user related api
app.use("/api/v1/users", userRoutes);
//user related api

// programs related api
app.use("/api/v1/programs", programsRoutes);
// ends of programs related api

app.get("/", async (req, res) => {
  res.send(`Geeks of Gurukul Server is running at port : ${port}`);
});

app.all("*", async (req, res) => {
  res.send({ message: "Route Not Exists!" });
});
