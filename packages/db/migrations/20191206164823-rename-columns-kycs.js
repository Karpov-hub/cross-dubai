"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.renameColumn("company_kycs", "realmId", "realm_id", {
          transaction: t
        }),
        queryInterface.renameColumn("company_kycs", "userId", "user_id", {
          transaction: t
        }),
        queryInterface.renameColumn("address_kycs", "realmId", "realm_id", {
          transaction: t
        }),
        queryInterface.renameColumn("address_kycs", "userId", "user_id", {
          transaction: t
        }),
        queryInterface.renameColumn("profile_kycs", "realmId", "realm_id", {
          transaction: t
        }),
        queryInterface.renameColumn("profile_kycs", "userId", "user_id", {
          transaction: t
        })
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {}
};
