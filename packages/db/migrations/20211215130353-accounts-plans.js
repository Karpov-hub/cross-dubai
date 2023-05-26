"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.createTable(
          "accounts_plans",
          {
            id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID
            },
            name: Sequelize.STRING(255),
            description: Sequelize.STRING(255),
            algo_amount: Sequelize.TEXT,
            method_amount: Sequelize.STRING(255),
            items: Sequelize.JSON,

            ctime: Sequelize.DATE,
            mtime: Sequelize.DATE,
            maker: Sequelize.UUID,
            removed: Sequelize.INTEGER,
            signobject: Sequelize.JSON
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "accounts_plans_merchants",
          {
            id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID
            },
            plan_id: Sequelize.UUID,
            merchant_id: Sequelize.UUID,
            name: Sequelize.STRING(255),
            make_accounts: Sequelize.BOOLEAN,
            items: Sequelize.JSON,

            ctime: Sequelize.DATE,
            mtime: Sequelize.DATE,
            maker: Sequelize.UUID,
            removed: Sequelize.INTEGER,
            signobject: Sequelize.JSON
          },
          { transaction: t }
        )
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.dropTable("accounts_plans", { transaction: t }),
        queryInterface.dropTable("accounts_plans_merchants", { transaction: t })
      ]);
    });
  }
};
