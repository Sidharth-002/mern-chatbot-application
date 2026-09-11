const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) return res.status(401).json({ msg: "Auth token missing" });
  const parts = authHeader.split(" ");
  const token = parts.length === 2 ? parts[1] : parts[0];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};
