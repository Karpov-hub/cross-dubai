"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.renameColumn("merchants", "account_fiat", "acc1", {
          transaction: t
        }),
        queryInterface.renameColumn("merchants", "account_crypto", "acc2", {
          transaction: t
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.renameColumn("merchants", "acc1", "account_fiat", {
          transaction: t
        }),
        queryInterface.renameColumn("merchants", "acc2", "account_crypto", {
          transaction: t
        })
      ]);
    });
  }
};
