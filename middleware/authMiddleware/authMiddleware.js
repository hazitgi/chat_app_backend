const jwt = require("jsonwebtoken");
const config = require("../../config/app");

exports.auth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing toekn" });
    }
    const decoded =  jwt.verify(token, config.appKey);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error });
  }
};
