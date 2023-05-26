"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("not_sent_plan_transfers", "ref_id", {
      type: Sequelize.STRING(50)
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("not_sent_plan_transfers", "ref_id", {
      type: Sequelize.UUID
    });
  }
};
