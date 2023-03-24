const router = require("express").Router();
const {
  index,
  create,
  messages,
  deleteChat,
  imageUpload,
  addUserToGroup,
} = require("../controllers/chatController");
const { validate } = require("../middleware/validator/validator");

const { auth } = require("../middleware/authMiddleware/authMiddleware");
const { chatFile } = require("../middleware/fileUpload");
router.get("/", [auth], index);
router.post("/create", [auth], create);
router.get("/messages", [auth], messages);
router.delete("/:id", [auth], deleteChat);
router.post("/upload-image", [auth, chatFile], imageUpload);
router.post("/add-user-to-group", auth, addUserToGroup);

module.exports = router;
