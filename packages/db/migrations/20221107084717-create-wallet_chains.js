"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("wallet_chains", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      wallet_sender: {
        type: Sequelize.STRING(130)
      },
      wallet_receiver: {
        type: Sequelize.STRING(130)
      },
      merchant_id: {
        type: Sequelize.UUID
      },
      first_payment_date: {
        type: Sequelize.DATE
      },
      lifespan: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.INTEGER
      },
      wallets: {
        type: Sequelize.JSONB
      },
      removed: {
        type: Sequelize.INTEGER
      },
      signobject: {
        type: Sequelize.JSON
      },
      maker: {
        type: Sequelize.UUID
      },
      ctime: {
        type: Sequelize.DATE
      },
      mtime: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("wallet_chains");
  }
};
