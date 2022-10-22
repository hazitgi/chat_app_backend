const router = require("express").Router();
const authController = require("../controllers/authController");
const { body } = require("express-validator");
const { validate } = require("../middleware/validator/validator");
const {
  rules: registrationRules,
  loginRules,
} = require("../middleware/validator/auth");

router.post("/login", [loginRules, validate], authController.login);
router.post(
  "/register",
  [registrationRules, validate],
  authController.register
);

module.exports = router;
