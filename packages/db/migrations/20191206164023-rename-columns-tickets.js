"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.renameColumn("tickets", "realmId", "realm_id", {
          transaction: t
        }),
        queryInterface.renameColumn("tickets", "fileId", "file_id", {
          transaction: t
        }),
        queryInterface.renameColumn("tickets", "userId", "user_id", {
          transaction: t
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
