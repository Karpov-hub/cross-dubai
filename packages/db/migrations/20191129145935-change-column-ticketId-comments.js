"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("comments", "ticketId", {
          transaction: t
        }),
        queryInterface.addColumn(
          "comments",
          "ticketId",
          {
            type: Sequelize.UUID
          },
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
