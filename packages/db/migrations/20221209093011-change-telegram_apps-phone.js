"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("telegram_apps", "phone", {
          transaction: t
        }),
        queryInterface.removeColumn("telegram_apps", "app_id", {
          transaction: t
        }),
        queryInterface.removeColumn("telegram_apps", "api_hash", {
          transaction: t
        }),
        queryInterface.addColumn(
          "telegram_apps",
          "phone",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "telegram_apps",
          "app_id",
          {
            type: Sequelize.INTEGER
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "telegram_apps",
          "api_hash",
          {
            type: Sequelize.STRING(50)
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("telegram_apps", "phone", {
          transaction: t
        }),
        queryInterface.removeColumn("telegram_apps", "app_id", {
          transaction: t
        }),
        queryInterface.removeColumn("telegram_apps", "api_hash", {
          transaction: t
        }),
        queryInterface.addColumn(
          "telegram_apps",
          "phone",
          {
            type: Sequelize.STRING(20),
            unique: true
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "telegram_apps",
          "app_id",
          {
            type: Sequelize.INTEGER,
            unique: true
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "telegram_apps",
          "api_hash",
          {
            type: Sequelize.STRING(50),
            unique: true
          },
          { transaction: t }
        )
      ]);
    });
  }
};
