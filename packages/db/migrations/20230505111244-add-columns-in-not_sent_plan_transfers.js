"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          "not_sent_plan_transfers",
          "is_draft",
          {
            type: Sequelize.BOOLEAN
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "not_sent_plan_transfers",
          "last_rejection_reason",
          {
            type: Sequelize.TEXT
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          "not_sent_plan_transfers",
          "approve_request",
          {
            type: Sequelize.UUID
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn("not_sent_plan_transfers", "is_draft", {
          transaction: t
        }),
        queryInterface.removeColumn(
          "not_sent_plan_transfers",
          "last_rejection_reason",
          {
            transaction: t
          }
        ),
        queryInterface.removeColumn(
          "not_sent_plan_transfers",
          "approve_request",
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
