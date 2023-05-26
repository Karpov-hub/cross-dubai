"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn("banks", "falcon_bank", {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([queryInterface.removeColumn("banks", "falcon_bank")]);
    });
  }
};
