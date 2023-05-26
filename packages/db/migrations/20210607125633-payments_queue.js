"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.createTable(
          "payments_queue",
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
            data: {
              type: Sequelize.JSON
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
        queryInterface.dropTable("payments_queue", { transaction: t })
      ]);
    });
  }
};
