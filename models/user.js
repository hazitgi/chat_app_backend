"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    validatePassword = async (password) => {
      return await bcrypt.compare(password, this.password);
    };
  }
  User.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      avatar: DataTypes.STRING,
      gender: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeUpdate: hashPassword,
        beforeCreate: hashPassword,
      },
    }
  );
  return User;
};

const hashPassword = async (user) => {
  console.log(user.changed());
  if (user.changed("password")) {
    user.password = bcrypt.hashSync(user.password, 10);
  }
};
