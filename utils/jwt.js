const jwt = require("jsonwebtoken");

const createJWT = (payload) =>
  jwt.sign(payload, process.env.JWT_TOKEN_SECRET, {
    expiresIn: process.env.JWT_TOKEN_EXPIRES,
  });

const isTokenValid = ({ token }) =>
  jwt.verify(token, process.env.JWT_TOKEN_SECRET);

const attachCookiesToResponse = ({ res, user }) => {
  const token = createJWT({ payload: user });

  const timeCookieExpires = 24 * 60 * 60 * 1000; // 1 day
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + timeCookieExpires),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = { createJWT, isTokenValid, attachCookiesToResponse };
