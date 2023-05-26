"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.createTable(
          "dashboards",
          {
            id: {
              allowNull: false,
              defaultValue: Sequelize.UUIDV4,
              primaryKey: true,
              type: Sequelize.UUID
            },
            name: Sequelize.STRING(255),
            user_id: Sequelize.UUID,
            indx: Sequelize.INTEGER
          },
          { transaction: t }
        ),
        queryInterface.createTable(
          "dashboard_settings",
          {
            id: {
              allowNull: false,
              defaultValue: Sequelize.UUIDV4,
              primaryKey: true,
              type: Sequelize.UUID
            },
            pid: Sequelize.UUID,
            indx: Sequelize.INTEGER,
            settings: Sequelize.UUID,
            width: Sequelize.STRING(20),
            height: Sequelize.STRING(20)
          },
          { transaction: t }
        )
      ]);
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.dropTable("dashboards", { transaction: t }),
        queryInterface.dropTable("dashboard_settings", { transaction: t })
      ]);
    });
  }
};
