const router = require("express").Router();
const {
  index,
  create,
  messages,
  deleteChat,
  imageUpload,
  addUserToGroup,
  leaveCurrentChat,
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
router.post("/leave-current-chat", auth, leaveCurrentChat);

module.exports = router;
