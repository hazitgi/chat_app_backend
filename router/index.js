const router = require("express").Router();

router.get("/home", (req, res) => {
  res.send("Hellow");
});

router.use("/", require("./auth"));

module.exports = router;
