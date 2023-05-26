"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.renameColumn("comments", "realmId", "realm_id", {
          transaction: t
        }),
        queryInterface.renameColumn("comments", "fileId", "file_id", {
          transaction: t
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
