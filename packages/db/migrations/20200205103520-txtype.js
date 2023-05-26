"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("transactions", "txtype", {
      type: Sequelize.STRING(15),
      defaultValue: "transfer"
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("transactions", "txtype");
  }
};
