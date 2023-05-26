"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("not_sent_plan_transfers", {
      id: {
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        type: Sequelize.UUID
      },
      plan_transfer_id: {
        type: Sequelize.UUID
      },
      merchant_id: {
        type: Sequelize.UUID
      },
      amount: {
        type: Sequelize.DECIMAL(40,18)
      },
      fees: {
        type: Sequelize.DECIMAL(40,18)
      },
      netto_amount: {
        type: Sequelize.DECIMAL(40,18)
      },
      rate: {
        type: Sequelize.DECIMAL(40,18)
      },
      result_amount: {
        type: Sequelize.DECIMAL(40,18)
      },
      currency: {
        type: Sequelize.STRING(10)
      },
      result_currency: {
        type: Sequelize.STRING(10)
      },
      plan_id: {
        type: Sequelize.UUID
      },
      ref_id: {
        type: Sequelize.UUID
      },
      tariff: {
        type: Sequelize.UUID
      },
      variables: {
        type: Sequelize.JSONB
      },
      description: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.INTEGER
      },
      approver: {
        type: Sequelize.UUID
      },
      ctime: {
        type: Sequelize.DATE
      },
      mtime: {
        type: Sequelize.DATE
      },
      maker: {
        type: Sequelize.UUID
      },
      signobject: {
        type: Sequelize.JSONB
      },
      removed: {
        type: Sequelize.INTEGER
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("not_sent_plan_transfers");
  }
};
