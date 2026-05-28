const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');
const { setUser } = require('../services/auth');

async function handleUserSignup(req, res) {
  try {
    const { name, email, password } = req.body;

    await User.create({
      name,
      email,
      password,
    });

    return res.redirect("/");

  } catch (err) {
    // HANDLE DUPLICATE EMAIL ERROR
    if (err.code === 11000) {
      return res.status(400).send("Email already registered.");
    }

    console.error(err); // for developer only
    return res.status(500).send("Something went wrong");
  }
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) {
    return res.render('login', {
      error: "Invalid username or password",
    });
  }
  const token = setUser(user);

  // AUTHORIZATION
  res.cookie('token', token, {  //arugment(name, value,options)
   httpOnly: true,                                        // JS cannot read this token...prevents XSS attacks(NOT CSRF (cross site request forgery))
   secure: process.env.NODE_ENV === 'production',         // HTTPS only on Render, works on HTTP locally...we create an environment variable to check if we are in production or development
   maxAge: 7 * 24 * 60 * 60 * 1000,                      // 7 days(expiration time)
});  return res.redirect("/");
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
};