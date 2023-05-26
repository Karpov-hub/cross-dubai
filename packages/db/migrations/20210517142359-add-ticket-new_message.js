"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("tickets", "new_message", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("tickets", "new_message");
  }
};
