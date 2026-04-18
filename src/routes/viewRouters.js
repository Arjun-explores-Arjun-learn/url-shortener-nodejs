// In static files we store FE files or info of contents we see in FE
const express = require("express");
const URL = require('../models/url');
const { restrictTo } = require("../middleware/auth");

const router = express.Router();

router.get('/admin/urls', restrictTo(["ADMIN"]), async (req, res) => {
  const allurls = await URL.find({ createdBy: req.user._id });
  return res.render('admin', {
    urls: allurls,
    user: req.user,
  });
});

// router.get('/' , async (req, res)=>{  for RF
router.get('/', restrictTo(["NORMAL", "ADMIN"]), async (req, res) => {
  const allurls = await URL.find({ createdBy: req.user._id });

  if (req.user.role === "ADMIN") {
    return res.render('admin', {
      urls: allurls,
      user: req.user,
    });
  }
  return res.render('home', {
    urls: allurls,
    user: req.user,
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.get("/login", (req, res) => {
  return res.render("login");
});

module.exports = router;