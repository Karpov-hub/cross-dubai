"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("users", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      type: {
        type: Sequelize.INTEGER
      },
      pass: {
        type: Sequelize.STRING(100)
      },
      email: {
        type: Sequelize.STRING(100)
      },
      first_name: {
        type: Sequelize.STRING(50)
      },
      last_name: {
        type: Sequelize.STRING(50)
      },
      birthday: {
        type: Sequelize.DATE
      },
      countries: {
        type: Sequelize.STRING
      },
      legalname: {
        type: Sequelize.STRING(150)
      },
      ctime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mtime: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("users");
  }
};
