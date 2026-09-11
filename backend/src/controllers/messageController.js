const Messages = require("../models/messageModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;
    // pagination: page 0 returns the latest `limit` messages
    const page = parseInt(req.body.page || "0", 10);
    const limit = parseInt(req.body.limit || "20", 10);

    if (!from || !to) {
      return res.status(400).json({ msg: "Both 'from' and 'to' are required" });
    }

    // fetch in reverse chronological order then reverse to chronological
    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    })
      .sort({ updatedAt: -1 })
      .skip(page * limit)
      .limit(limit);

    const ordered = messages.reverse();

    const projectedMessages = ordered.map((msg) => ({
      fromSelf: msg.sender.toString() === from,
      message: msg.message?.text,
      createdAt: msg.createdAt,
    }));

    return res.status(200).json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    if (!from || !to || !message) {
      return res
        .status(400)
        .json({ msg: "'from', 'to' and 'message' are required" });
    }

    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data)
      return res.status(201).json({ msg: "Message added successfully." });
    return res
      .status(500)
      .json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};
