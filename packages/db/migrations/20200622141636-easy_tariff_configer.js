"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.createTable(
          "tariffs_es",
          {
            id: {
              allowNull: false,
              defaultValue: Sequelize.UUIDV4,
              primaryKey: true,
              type: Sequelize.UUID
            },
            name: {
              allowNull: false,
              type: Sequelize.STRING(250)
            },
            pcategory: {
              type: Sequelize.UUID
            },
            ptype: {
              type: Sequelize.UUID
            },
            fee_withdrawal: {
              type: Sequelize.FLOAT
            },
            fee_transfer: {
              type: Sequelize.FLOAT
            },
            fee_masspayment: {
              type: Sequelize.FLOAT
            },
            fee_merchant: {
              type: Sequelize.FLOAT
            },
            enb_deposit: {
              type: Sequelize.BOOLEAN
            },
            enb_withdrawal: {
              type: Sequelize.BOOLEAN
            },
            enb_merchant: {
              type: Sequelize.BOOLEAN
            },
            maker: {
              type: Sequelize.UUID
            },
            ctime: {
              type: Sequelize.DATE
            },
            mtime: {
              type: Sequelize.DATE
            },
            signobject: {
              type: Sequelize.JSON
            },
            removed: {
              type: Sequelize.INTEGER
            }
          },
          {
            transaction: t
          }
        ),
        queryInterface.addColumn(
          "tariffs",
          "pid",
          {
            type: Sequelize.UUID
          },
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `CREATE INDEX idx_tariff_pid on tariffs ("pid")`,
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.dropTable("tariffs_es", { transaction: t }),
        queryInterface.sequelize.query(`DROP INDEX idx_tariff_pid`, {
          transaction: t
        }),
        queryInterface.removeColumn("tariffs", "pid", {
          transaction: t
        })
      ]);
    });
  }
};
