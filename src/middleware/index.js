const { sign, verify } = require("jsonwebtoken");
require("dotenv").config();

// This function gets user params coming from login function
const createTokens = (user) => {
  const accessToken = sign(
    { username: user.username, id: user.id },
    process.env.WEB_SECRET
  );

  return accessToken;
};
const validateToken = (req, res, next) => {
  const accessToken = req.cookies["access-token"];

  if (!accessToken)
    return res.status(400).json({ message: "User not authenticated" });

  try {
    const validToken = verify(accessToken, process.env.WEB_SECRET);

    if (validToken) {
      req.authenticated = true;
      return next();
    }
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
module.exports = {
  createTokens,
  validateToken,
};
