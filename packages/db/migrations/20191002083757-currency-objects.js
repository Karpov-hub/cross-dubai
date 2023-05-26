"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.createTable(
          "currency",
          {
            id: {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: Sequelize.INTEGER
            },

            code: {
              type: Sequelize.INTEGER
            },
            name: {
              type: Sequelize.STRING(50)
            },
            abbr: {
              type: Sequelize.STRING(3)
            }
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "currency_history",
          {
            id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID
            },
            realms: Sequelize.JSON,
            name: Sequelize.STRING(50),
            active: Sequelize.BOOLEAN,
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
        ),
        queryInterface.createTable(
          "currency_values",
          {
            id: {
              allowNull: false,
              primaryKey: true,
              type: Sequelize.UUID
            },
            pid: Sequelize.UUID,
            abbr: Sequelize.STRING(3),
            amount: Sequelize.FLOAT,
            value: Sequelize.FLOAT
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable("currency", { transaction: t }),
        queryInterface.dropTable("currency_history", { transaction: t }),
        queryInterface.dropTable("currency_values", { transaction: t })
      ]);
    });
  }
};
