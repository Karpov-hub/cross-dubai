"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("plans_weights", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      plan_id: Sequelize.UUID,
      merchant_id: Sequelize.UUID,
      weight: Sequelize.INTEGER
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("plans_weights");
  }
};
