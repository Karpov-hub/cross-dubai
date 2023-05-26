"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("merchants", "id_template", {
      type: Sequelize.UUID
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("accounts", "id_template");
  }
};
