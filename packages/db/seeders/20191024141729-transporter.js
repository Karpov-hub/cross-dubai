"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "transporters",
      [
        {
          id: "8ea6ef78-c4a3-11e9-aa8c-2a2ae2ddcce4",
          host_transporter: "smtp.ethereal.email",
          port_transporter: 587,
          secure_transporter: false,
          user_transporter: "waino.bogan@ethereal.email",
          password_transporter: "FGfhm3HVqaVdwjK4Cb",
          ctime: new Date(),
          mtime: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("transporters", null, {});
  }
};
