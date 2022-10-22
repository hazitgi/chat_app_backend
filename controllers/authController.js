const User = require("../models").User;
const responseMessage = require("../utils/responseMessage");
const jwt = require("jsonwebtoken");
const config = require("../config/app");

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw { type: "ERROR", message: responseMessage.USER_NOT_FOUND };
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      throw {
        type: "ERROR",
        message: responseMessage.INCORRECT_EMAIL_PASSWORD,
      };
    }
    // generate auth token
    const userWithToken = generateToken(user.get({ raw: true }));

    return res.json(userWithToken);
  } catch (error) {
    console.log(error);
    if (error.type == "ERROR") {
      return res.status(400).json({ message: error?.message });
    }
    return res.status(500).json({ message: error?.message });
  }
};
module.exports.register = async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.create(req.body);
    // generate auth token
    const userWithToken = generateToken(user.get({ raw: true }));
    return res.json(userWithToken);
  } catch (error) {
    console.log(error);
    console.log(error.errors[0].message);

    if (error.type == "ERROR") {
      console.log("=================");
      return res.status(400).json({ message: error?.message });
    } else {
      return res
        .status(500)
        .json({ message: error?.errors?.[0]?.message || error?.message });
    }
  }
};

const generateToken = (user) => {
  console.log(user);
  delete user.password;
  const token = jwt.sign(user, config.appKey, { expiresIn: 86400 });
  return { ...user, token };
};
