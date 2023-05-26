"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.createTable(
          "reports_queue",
          {
            id: {
              allowNull: false,
              primaryKey: true,
              defaultValue: Sequelize.UUIDV4,
              type: Sequelize.UUID
            },
            data: {
              type: Sequelize.JSON
            },
            status: {
              type: Sequelize.INTEGER,
              defaultValue: 0
            },
            ctime: {
              type: Sequelize.DATE
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
        queryInterface.dropTable("reports_queue", { transaction: t })
      ]);
    });
  }
};
