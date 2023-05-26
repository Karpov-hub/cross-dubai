"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn("users", "order_counter", {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("users", "order_counter"),
      ]);
    });
  }
};
