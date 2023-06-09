"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
const config = require("../config/app");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Chat, {
        through: "ChatUser",
        foreignKey: "userId",
      });
      this.hasMany(models.ChatUser, { foreignKey: "userId" });
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
      avatar: {
        type: DataTypes.STRING,
        get() {
          const avatar = this.getDataValue("avatar");
          const url = `${config.appUrl}:${config.appPort}`;
          if (!avatar) {
            return `${url}/${this.getDataValue("gender")}.svg`;
          }
          const id = this.getDataValue("id");
          return `${url}/user/${id}/${avatar}`;
        },
      },
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
  if (user.changed("password")) {
    user.password = await bcrypt.hashSync(user.password, 10);
  }
};
