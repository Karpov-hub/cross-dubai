"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("merchants", "group_name");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("merchants", "group_name", {
      type: Sequelize.UUID
    });
  }
};
