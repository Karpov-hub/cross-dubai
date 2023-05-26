"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn("orders", "order_num", {
          type: Sequelize.STRING(50)
        }),
        queryInterface.addColumn("orders", "date_from", {
          type: Sequelize.DATE
        }),
        queryInterface.addColumn("orders", "date_to", {
          type: Sequelize.DATE
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("orders", "order_num"),
        queryInterface.removeColumn("orders", "date_from"),
        queryInterface.removeColumn("orders", "date_to")
      ]);
    });
  }
};
