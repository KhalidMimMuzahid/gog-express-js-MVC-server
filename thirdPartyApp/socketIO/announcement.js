const { ObjectId } = require("mongodb");
const db = require("../../utils/dbConnect");
const moment = require("moment");
let socket;
let io;

let onlineUsers = [];
const addNewUser = (email, socketId) => {
  console.log(
    "\n---------------------------------------",
    "\nadd:  before updated onlineUsers: ",
    onlineUsers
  );
  const index = onlineUsers.findIndex((user) => user.email === email);
  // !onlineUsers.some((user) => user.email === email) &&
  //   onlineUsers.push({ email, socketId });
  console.log("index: ", index, "\nemail: ", email);
  if (index === -1) {
    onlineUsers.push({ email, socketId });
  } else {
    onlineUsers[index] = { email, socketId };
  }

  console.log(
    "add:  after updated onlineUsers: ",
    onlineUsers,
    "\n---------------------------------------"
  );
};

const removeUser = (socketId) => {
  console.log(
    "\n---------------------------------------",
    "\nremove:  before updated onlineUsers: ",
    onlineUsers
  );
  console.log("socketId: ", socketId);
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
  console.log(
    "remove:  after updated onlineUsers: ",
    onlineUsers,
    "\n---------------------------------------"
  );
};

const getUser = (email) => {
  return onlineUsers.find((user) => user.email === email);
};
module.exports.notify = (ioTemp, socketTEmp) => {
  io = ioTemp;
  socket = socketTEmp;
  socket.on("join", (email) => {
    console.log(
      "\n---------------------------------------",
      "for joining: \nemail: " + email
    );
    console.log(
      "socket id: ",
      socket.id,
      "\n---------------------------------------"
    );
    addNewUser(email, socket.id);
    // socket.join(email);
  });

  socket.on("disconnect", () => {
    // console.log("user disconnected", socket.id);
    // removeUser(socket.id);
  });
};

module.exports.sendNotify = async ({
  announcement: announcementTemp,
  receiverEmail,
}) => {
  const client = db.getClient(); // Use the existing database client
  const announcementDetails = client
    .db("notifications")
    .collection("announcementDetails");
  const announcement = { ...announcementTemp, triggeredAt: moment().format() };
  const Announcement = function (email) {
    this.announcement = { ...announcement };
    this.receiverEmail = email;
  };
  const announcements = receiverEmail?.map((each) => {
    const announcement = new Announcement(each);
    return announcement;
  });

  const result = await announcementDetails.insertMany(announcements);
  // io.sockets.emit("join from server", { OK: "fuck" });
  if (result?.insertedCount) {
    // console.log("onlineUsers: ", onlineUsers);
    console.log("onlineUserannouncements: ", announcements);
    announcements.forEach((announcement) => {
      const user = getUser(announcement?.receiverEmail);
      if (user?.socketId) {
        console.log("hitted for : ", announcement?.receiverEmail);
        io.to(user?.socketId).emit("notification-received", announcement);
      }
    });
  }
};
