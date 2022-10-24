const router = require("express").Router();
const {
  index,
  create,
  messages,
  deleteChat,
} = require("../controllers/chatController");
const { validate } = require("../middleware/validator/validator");

const { auth } = require("../middleware/authMiddleware/authMiddleware");

router.get("/", [auth], index);
router.post("/create", [auth], create);
router.get("/messages", [auth], messages);
router.delete("/:id", [auth], deleteChat);

module.exports = router;
