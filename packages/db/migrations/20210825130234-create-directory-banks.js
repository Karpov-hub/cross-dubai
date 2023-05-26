"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("directory_banks", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      bank_name: Sequelize.STRING,
      skip_rows: Sequelize.INTEGER
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("directory_banks");
  }
};
