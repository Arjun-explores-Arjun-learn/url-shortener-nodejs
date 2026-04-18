const { getUser } = require("../services/auth");

// AUTHENTICATION
function checkForAuthentication(req, res, next) {
  const tokenCookie = req.cookies?.token;
  req.user = null;
  if (!tokenCookie) return next();

  const token = tokenCookie;
  const user = getUser(token);

  req.user = user;
  return next(); // taking auth.header->check->getUser ->call next()
}

// AUTHORIZATION
function restrictTo(roles = []) { // creating array since some portals can be accessed by both (normal, admin)
  return function (req, res, next) {
    if (!req.user) return res.redirect("/login");
    if (!roles.includes(req.user.role)) return res.end("UnAuthorized");
    return next(); // if both conditions satisfied call next()
  };
}

module.exports = {
  checkForAuthentication,
  restrictTo,
};