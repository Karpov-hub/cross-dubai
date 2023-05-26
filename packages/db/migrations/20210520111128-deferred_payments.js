"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.createTable(
          "withdrawals",
          {
            id: {
              allowNull: false,
              primaryKey: true,
              defaultValue: Sequelize.UUIDV4,
              type: Sequelize.UUID
            },
            ctime: {
              type: Sequelize.DATE
            },
            mtime: {
              type: Sequelize.DATE
            },
            currency: {
              type: Sequelize.STRING(4)
            },
            amount: {
              type: Sequelize.DECIMAL(40, 18)
            },
            status: {
              type: Sequelize.INTEGER
            }
          },
          {
            transaction: t
          }
        ),
        queryInterface.createTable(
          "withdrawal_transfers",
          {
            id: {
              allowNull: false,
              primaryKey: true,
              defaultValue: Sequelize.UUIDV4,
              type: Sequelize.UUID
            },
            withdrawal_id: {
              type: Sequelize.UUID
            },
            transfer_id: {
              type: Sequelize.UUID
            },
            ctime: {
              type: Sequelize.DATE
            },
            mtime: {
              type: Sequelize.DATE
            },
            currency: {
              type: Sequelize.STRING(4)
            },
            amount: {
              type: Sequelize.DECIMAL(40, 18)
            },
            status: {
              type: Sequelize.INTEGER
            }
          },
          {
            transaction: t
          }
        )
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      Promise.all([
        queryInterface.dropTable("withdrawals", { transaction: t }),
        queryInterface.dropTable("withdrawal_transfers", { transaction: t })
      ]);
    });
  }
};
