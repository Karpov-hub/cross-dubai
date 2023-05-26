"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("telegram_channels", "telegram_app", {
      type: Sequelize.UUID
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("telegram_channels", "telegram_app");
  }
};
