const { body } = require("express-validator");

exports.rules = (() => {
  return [
    body("firstName").notEmpty(),
    body("password").notEmpty().isLength({ min: 8 }),
    body("lastName").notEmpty(),
    body("gender").notEmpty(),
    body("email").isEmail(),
  ];
})();
exports.loginRules = (() => {
  return [
    body("password").notEmpty().isLength({ min: 8 }),
    body("email").isEmail(),
  ];
})();
