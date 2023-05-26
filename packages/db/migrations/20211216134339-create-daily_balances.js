"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("daily_balances", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      sk_balances: Sequelize.JSON,
      nil_balances: Sequelize.JSON,
      deposits_on_hold: Sequelize.JSON,
      ready_to_payout: Sequelize.JSON,

      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      removed: Sequelize.INTEGER,
      signobject: Sequelize.JSON
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("daily_balances");
  }
};
