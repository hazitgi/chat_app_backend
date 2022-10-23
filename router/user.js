const router = require("express").Router();
const userController = require("../controllers/userController");
const { validate } = require("../middleware/validator/validator");
const {
  userUpdateValidation,
} = require("../middleware/validator/userValidator/userValidator");
const { auth } = require("../middleware/authMiddleware/authMiddleware");
const { userFile } = require("../middleware/fileUpload");

router.post(
  "/update",
  [auth, userFile, userUpdateValidation, validate],
  userController.update
);

module.exports = router;
