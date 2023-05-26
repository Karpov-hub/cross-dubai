"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        // queryInterface.removeColumn("merchants", "acc1", {
        //   transaction: t
        // }),
        // queryInterface.removeColumn("merchants", "acc2", {
        //   transaction: t
        // })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
