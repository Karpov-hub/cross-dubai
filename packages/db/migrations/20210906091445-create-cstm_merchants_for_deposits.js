"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("cstm_merchants_for_deposits", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      merchant_id: Sequelize.UUID,
      merchant_name: Sequelize.STRING,
      custom_name: Sequelize.STRING
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("cstm_merchants_for_deposits");
  }
};
