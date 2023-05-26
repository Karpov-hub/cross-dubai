"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("transfers", "invisibility_exp_date", {
      type: Sequelize.DATE
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("transfers", "invisibility_exp_date");
  }
};
