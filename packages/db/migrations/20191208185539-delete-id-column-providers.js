"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("providers", "id", {
          transaction: t
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
