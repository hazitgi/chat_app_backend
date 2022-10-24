"use strict";
const model = require("../../models");
const ChatModel = model.Chat;
const UserModel = model.User;
const MessageModel = model.Message;
const ChatUserModel = model.ChatUser;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    const users = await UserModel.findAll({ limit: 2 });
    const chat = await ChatModel.create();
    await ChatUserModel.bulkCreate([
      {
        chatId: chat.id,
        userId: users[0].id,
      },
      {
        chatId: chat.id,
        userId: users[1].id,
      },
    ]);

    await MessageModel.bulkCreate([
      {
        message: "Hello friend",
        chatId: chat.id,
        fromUserId: users[0].id,
      },
      {
        message: "Hi buddy",
        chatId: chat.id,
        fromUserId: users[1].id,
      },
      {
        message: "long time no speak",
        chatId: chat.id,
        fromUserId: users[1].id,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
