const jwt = require("jsonwebtoken");
const SECRET = "todoProSecretKey"; // production me env var use karo

module.exports = function(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // { userId: ... }
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};
