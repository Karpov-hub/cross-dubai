"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("system_notifications", "msg_date", {
          transaction: t
        }),
        queryInterface.removeColumn("system_notifications", "time_from", {
          transaction: t
        }),
        queryInterface.removeColumn("system_notifications", "time_to", {
          transaction: t
        }),
        queryInterface.removeColumn("system_notifications", "message", {
          transaction: t
        }),
        queryInterface.addColumn(
          "system_notifications",
          "date_from",
          {
            type: Sequelize.DATE
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "system_notifications",
          "date_to",
          {
            type: Sequelize.DATE
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "system_notifications",
          "letter_template",
          {
            type: Sequelize.UUID
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "system_notifications",
          "data",
          {
            type: Sequelize.JSONB
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("system_notifications", "date_from", {
          transaction: t
        }),
        queryInterface.removeColumn("system_notifications", "date_to", {
          transaction: t
        }),
        queryInterface.removeColumn("system_notifications", "letter_template", {
          transaction: t
        }),
        queryInterface.removeColumn("system_notifications", "data", {
          transaction: t
        }),
        queryInterface.addColumn(
          "system_notifications",
          "message",
          {
            type: Sequelize.STRING
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "system_notifications",
          "msg_date",
          {
            type: Sequelize.DATE
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "system_notifications",
          "time_from",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "system_notifications",
          "time_to",
          {
            type: Sequelize.STRING(20)
          },
          { transaction: t }
        )
      ]);
    });
  }
};
