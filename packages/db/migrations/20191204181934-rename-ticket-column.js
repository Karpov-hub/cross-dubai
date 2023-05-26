"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn("comments", "ticketId", "ticket_id");
  },

  down: (queryInterface, Sequelize) => {}
};
