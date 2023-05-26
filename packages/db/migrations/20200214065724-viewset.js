"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.createTable(
          "viewset",
          {
            id: {
              allowNull: false,
              defaultValue: Sequelize.UUIDV4,
              primaryKey: true,
              type: Sequelize.UUID
            },
            name: {
              allowNull: false,
              type: Sequelize.STRING(50)
            },
            sql: {
              allowNull: false,
              type: Sequelize.TEXT
            }
          },
          {
            transaction: t
          }
        ),
        queryInterface.sequelize.query(
          `CREATE INDEX idx_tx_ctime on transactions ("ctime", "held", "canceled")`,
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable("viewset", { transaction: t })
      ]);
    });
  }
};
