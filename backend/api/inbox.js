const express = require("express");
const messageRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { requireUser } = require("./utils");

const {
  client,
  createMessage,
  deleteMessage,
  editMessage,
  getMyMessages,
  getMySentMessages,
  markRead,
  getMyRead,
} = require("../db");

messageRouter.get("/", async (req, res, next) => {
  res.send({ message: "Welcome to your inbox" });
  next();
});

messageRouter.post("/new", requireUser, async (req, res, next) => {
  const senderID = req.body.senderid;
  const senderName = req.body.sendername;
  const senderPic = req.body.senderpic;
  const receiverID = req.body.receiverid;
  const receiverName = req.body.receivername;
  const receiverPic = req.body.receiverpic;
  const message = req.body.note_message;

  try {
    const inboxNote = {
      senderid: senderID,
      sendername: senderName,
      senderpic: senderPic,
      receiverid: receiverID,
      receivername: receiverName,
      receiverpic: receiverPic,
      note_message: message,
    };
    console.log(inboxNote);
    const newMessage = await createMessage(inboxNote);
    res.send({ message: newMessage });
  } catch (error) {
    console.log(error);
    next({ name: "ErrorCreatingMessage", message: "Could not create message" });
  }
});

messageRouter.patch("/edit/:id", async (req, res, next) => {
  const { id } = req.params;
  const { note_message } = req.body;

  try {
    const edit = {
      note_message: note_message,
    };

    const editedMessage = await editMessage(id, edit);
    res.send({ message: editedMessage });
  } catch (error) {
    console.log(error);
    next({ name: "ErrorEditingMessage", message: "Could not edit message" });
  }
});

messageRouter.delete("/delete/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const deletedMessage = await deleteMessage(id);
    res.send({ message: deletedMessage });
  } catch (error) {
    console.log(error);
    next({ name: "ErrorDeletingMessage", message: "Could not delete message" });
  }
});

messageRouter.get("/unread/:receiverid", async (req, res, next) => {
  const { receiverid } = req.params;
  try {
    const myMessages = await getMyMessages(receiverid);
    res.send({ notes: myMessages });
  } catch (error) {
    console.log(error);
    next({
      name: "ErrorGettingUserInbox",
      message: "Could not get user inbox",
    });
  }
});

messageRouter.get("/read/:receiverid", async (req, res, next) => {
  const { receiverid } = req.params;
  try {
    const myRead = await getMyRead(receiverid);
    res.send({ messages: myRead });
  } catch (error) {
    console.log(error);
    next({
      name: "ErrorGettingUserInbox",
      message: "Could not get user inbox",
    });
  }
});

messageRouter.get("/sent/:senderid", async (req, res, next) => {
  const { senderid } = req.params;
  try {
    const sentMessages = await getMySentMessages(senderid);
    res.send({ messages: sentMessages });
  } catch (error) {
    console.log(error);
    next({
      name: "ErrorGettingUserSentNotes",
      message: "Could not get user sent notes",
    });
  }
});

messageRouter.patch("/markasread/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const read = await markRead(id);
    res.send({ messages: read });
  } catch (error) {
    console.log(error);
    next({
      name: "ErrorGettingUserSentNotes",
      message: "Could not get user sent notes",
    });
  }
});

module.exports = messageRouter;
