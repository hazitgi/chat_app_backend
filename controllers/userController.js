const User = require("../models").User;
const sequelize = require("sequelize");

exports.update = async (req, res) => {
  try {
    if (req.file) {
      req.body.avatar = req?.file?.filename;
    }
    if (typeof req.body.avatar !== "undefined" && req.body.avatar.length === 0)
      delete req.body.avatar;
    const [rows, result] = await User.update(req.body, {
      where: {
        id: req.user.id,
      },
      returning: true,
      individualHooks: true,
    });
    const user = result[0].get({ raw: true });
    user.avatar = result[0].avatar
    delete user.password;
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    if (error.type == "ERROR") {
      return res.status(400).json({ message: error?.message });
    } else {
      return res
        .status(500)
        .json({ message: error?.errors?.[0]?.message || error?.message });
    }
  }
};
