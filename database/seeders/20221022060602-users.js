"use strict";
const bcrypt = require("bcrypt");
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

    await queryInterface.bulkInsert("Users", [
      // {
      //   firstName: "Mohamed",
      //   lastName: "Haseeb",
      //   email: "hazitgi@gmail.com",
      //   password: bcrypt.hashSync("12345678", 10),
      //   gender: "male",
      // },
      // {
      //   firstName: "Mohamed",
      //   lastName: "Arshad",
      //   email: "arshad@gmail.com",
      //   password: bcrypt.hashSync("12345678", 10),
      //   gender: "male",
      // },
      // {
      //   firstName: "Shafna",
      //   lastName: "Finu",
      //   email: "shafna@gmail.com",
      //   password: bcrypt.hashSync("12345678", 10),
      //   gender: "female",
      // },
      {
        firstName: "Mohamed",
        lastName: "Junaid",
        email: "junaid@gmail.com",
        password: bcrypt.hashSync("12345678", 10),
        gender: "male",
      },
      {
        firstName: "Jabir",
        lastName: "EK",
        email: "jabir@gmail.com",
        password: bcrypt.hashSync("12345678", 10),
        gender: "male",
      },
      {
        firstName: "Sabith",
        lastName: "M",
        email: "sabith@gmail.com",
        password: bcrypt.hashSync("12345678", 10),
        gender: "female",
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
    await queryInterface.bulkDelete("Users", null, {});
  },
};
