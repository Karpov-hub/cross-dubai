"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "realms",
          "tariff",
          {
            type: Sequelize.UUID
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "realms",
          "variables",
          {
            type: Sequelize.JSON
          },
          { transaction: t }
        ),
        ,
        queryInterface.createTable(
          "accounts",
          {
            id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID
            },
            acc_no: Sequelize.STRING,
            currency: Sequelize.STRING(3),
            owner: Sequelize.UUID,
            balance: Sequelize.FLOAT,
            active: Sequelize.CHAR,
            ctime: {
              allowNull: false,
              type: Sequelize.DATE
            },
            mtime: {
              allowNull: false,
              type: Sequelize.DATE
            },

            stime: Sequelize.BIGINT,
            ltime: Sequelize.BIGINT,
            removed: Sequelize.INTEGER,
            signobject: Sequelize.JSON,
            maker: Sequelize.UUID
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("realms", "tariff", { transaction: t }),
        queryInterface.removeColumn("realms", "variables", {
          transaction: t
        }),
        queryInterface.dropTable("accounts", {
          transaction: t
        })
      ]);
    });
  }
};
