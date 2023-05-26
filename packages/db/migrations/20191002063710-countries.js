"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("countries", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      code: {
        type: Sequelize.STRING(20)
      },
      name: {
        type: Sequelize.STRING(50)
      },
      abbr2: {
        type: Sequelize.STRING(2)
      },
      abbr3: {
        type: Sequelize.STRING(3)
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("countries");
  }
};
