const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    console.log('Request headers in check-auth.js:', req.headers);
    const token = req.headers.authorization.split("Bearer ")[1];
    console.log("Token received in check-auth.js:", token);
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    next();
  } catch (error) {
    console.log("check-auth.js error: " + error);
    res.status(401).json({ message: "You are not authenticated!" });
  }
};
