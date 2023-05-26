"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      "system_notifications",
      "letter_template",
      {
        type: Sequelize.STRING
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn(
      "system_notifications",
      "letter_template",
      {
        type: Sequelize.UUID
      }
    );
  }
};
