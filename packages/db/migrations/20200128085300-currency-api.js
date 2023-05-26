"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn(
          "currency",
          "api",
          {
            type: Sequelize.STRING(255)
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "account_crypto",
          {
            id: {
              allowNull: false,
              defaultValue: Sequelize.UUIDV4,
              primaryKey: true,
              type: Sequelize.UUID
            },
            acc_no: {
              allowNull: false,
              type: Sequelize.STRING(50)
            },
            address: Sequelize.STRING(150),
            wallet: Sequelize.STRING(150),
            abbr: Sequelize.STRING(3),
            ctime: {
              allowNull: false,
              type: Sequelize.DATE
            },
            mtime: {
              allowNull: false,
              type: Sequelize.DATE
            }
          },
          {
            transaction: t,
            uniqueKeys: {
              actions_unique: {
                fields: ["acc_no"]
              }
            }
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable("account_crypto", { transaction: t }),
        queryInterface.removeColumn("currency", "api", {
          transaction: t
        })
      ]);
    });
  }
};
