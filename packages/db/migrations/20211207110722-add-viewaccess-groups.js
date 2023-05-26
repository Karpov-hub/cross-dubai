"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("groups", "viewaccess", {
      type: Sequelize.JSON,
      allowNull: true
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("groups", "viewaccess");
  }
};
