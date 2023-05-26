"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("wallet_transactions");
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.createTable("wallet_transactions", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      action_from: Sequelize.STRING(100),
      action_to: Sequelize.STRING(100),
      action_to_ext: Sequelize.STRING(100),
      amount: Sequelize.FLOAT,
      fee: Sequelize.FLOAT,
      create_time: Sequelize.STRING(50),
      currency_id: Sequelize.STRING(5),
      operation: Sequelize.STRING(15),
      tx_id: Sequelize.STRING(150),
      fee_currency_id: Sequelize.STRING(5),
      tx_time: Sequelize.STRING(50),
      tx_result: Sequelize.STRING,
      tx_related_id: Sequelize.UUID,
      request_id: Sequelize.UUID,
      info: Sequelize.STRING(50),
      system_fee: Sequelize.FLOAT,

      merchant_id: Sequelize.UUID,
      group_id: Sequelize.UUID,
      merchant_name: Sequelize.STRING,
      group_name: Sequelize.STRING,
      description: Sequelize.STRING,
      ref_id: Sequelize.UUID,

      ctime: Sequelize.DATE,
      mtime: Sequelize.DATE,
      maker: Sequelize.UUID,
      removed: Sequelize.INTEGER,
      signobject: Sequelize.JSON
    });
  }
};
