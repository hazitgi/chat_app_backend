const { body } = require("express-validator");

exports.userUpdateValidation = (() => {
  return [
    body("firstName").notEmpty(),
    body("password").optional().isLength({ min: 8 }),
    body("lastName").notEmpty(),
    body("gender").notEmpty(),
    body("email").isEmail(),
  ];
})();

