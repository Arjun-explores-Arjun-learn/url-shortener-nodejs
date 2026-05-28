require("dotenv").config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const { connectToMongoDB } = require("./config/db");
const { checkForAuthentication, restrictTo } = require("./middleware/auth");

// Routes
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/viewRouters");
const userRoute = require("./routes/user");

const URL = require("./models/url");

const app = express();
const PORT=process.env.PORT || 7001;  //since render assigns its own port dynamically

// DB CONNECTION
connectToMongoDB(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("DB Error:", err));

// VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);

// RATE LIMITER (applied ONLY to API routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

// ROUTES
app.use("/", staticRoute); //allow UI always

app.use("/user", userRoute);

//Apply limiter ONLY where needed
app.use("/url", limiter, restrictTo(["NORMAL", "ADMIN"]), urlRoute);

//REDIRECT ROUTE (public access, no limiter)
app.get("/:shortId", async (req, res) => {
  try {
    const shortId = req.params.shortId;

    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: { timestamp: Date.now() },
        },
      }
    );

    if (!entry) {
      return res.status(404).send("URL not found");
    }

    //Expiry check
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      return res.status(410).send("Link expired");
    }

    return res.redirect(entry.redirectURL);

  } catch (err) {
    return res.status(500).send("Server Error");
  }
});

//SERVER START
app.listen(PORT, () =>
  console.log(`Server started at PORT:${PORT}`)
);