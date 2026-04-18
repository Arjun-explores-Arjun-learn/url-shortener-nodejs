const jwt = require("jsonwebtoken");

function setUser(user) { // this func will generate tokens for us
  return jwt.sign({ // this says while we signing in we are using secret key
    _id: user._id,
    email: user.email,
    role: user.role,
  }, process.env.JWT_SECRET);
}

function getUser(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null; // if token is invalid then return null...prevents crash
  }
}

module.exports = {
  setUser,
  getUser,
};

// in this even after the server is restarted the user will remain logged in,
// since it is we who have the state (practical appli-- our adhar card, pan card)
// analog like a school id card, they won't check their server for your details, they will just check your id in the card(token) and you can't duplicate that since you don't have their stamp(secret key)