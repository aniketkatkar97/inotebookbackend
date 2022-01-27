const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET;

//ROUTE 1 : Create a User using : POST "/api/auth/createuser" No login Required
router.post(
  "/createuser",
  body("name", "Enter a valid name").isLength({ min: 3 }),
  body("email", "Enter a valid email").isEmail(),
  body("password", "Password must be atleast 5 characters").isLength({
    min: 5,
  }),
  async (req, res) => {
    //If error in validation then return the status
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    //Create a user and check for unique email id
    try {
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      })
        .then((user) => {
          const data = {
            user: {
              id: user.id,
            },
          };
          const authtoken = jwt.sign(data, jwtSecret);
          res.json({ success: true, authtoken });
        })
        .catch((err) => {
          err.code == 11000
            ? res.json({
                success: false,
                error: "User with entered email already exists.",
              })
            : res.json({ success: false, error: err.message });
        });
    } catch (err) {
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE 2 : Authenticate a User using : POST "/api/auth/login " No login Required
router.post(
  "/login",
  body("email", "Enter a valid email").isEmail(),
  body("password", "Password cannot be blank").exists(),
  async (req, res) => {
    //If error in validation then return the status
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.json({
          success: false,
          error: "Entered email does not have a iNotebook acount",
        });
      }

      const passwordcompare = await bcrypt.compare(password, user.password);
      if (!passwordcompare) {
        return res.json({
          success: false,
          error: "Entered email or password is incorrect",
        });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, jwtSecret);
      res.json({ success: true, authtoken });
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  }
);

//ROUTE 3 : Get logged in User details : GET "/api/auth/getuser " Login required
router.get("/getuser", fetchuser, async (req, res) => {
  try {
    const userid = req.user.id;
    const user = await User.findById(userid).select("-password");
    res.send(user);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;
