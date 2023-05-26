"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("swift", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id: {
        type: Sequelize.UUID,
      },
      country: {
        type: Sequelize.STRING,
      },
      country_code: {
        type: Sequelize.STRING,
      },
      city: {
        type: Sequelize.STRING,
      },
      bank: {
        type: Sequelize.STRING,
      },
      swift_code: {
        type: Sequelize.STRING,
      },
      branch: {
        type: Sequelize.STRING,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("swift");
  },
};
