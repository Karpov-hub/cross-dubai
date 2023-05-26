"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("transactions", "description_src", {
        type: Sequelize.STRING(255)
      }),
      queryInterface.addColumn("transactions", "description_dst", {
        type: Sequelize.STRING(255)
      })
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("transactions", "description_src"),
      queryInterface.removeColumn("transactions", "description_dst")
    ]);
  }
};
