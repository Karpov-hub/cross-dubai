"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `UPDATE accounts SET removed = 0 WHERE removed is null;
           UPDATE account_contracts SET removed = 0 WHERE removed is null;
           UPDATE admin_users SET removed = 0 WHERE removed is null;
           UPDATE banks SET removed = 0 WHERE removed is null;
           UPDATE business_types SET removed = 0 WHERE removed is null;
           UPDATE categories_merchants SET removed = 0 WHERE removed is null;
           UPDATE checks SET removed = 0 WHERE removed is null;
           UPDATE comments SET removed = 0 WHERE removed is null;
           UPDATE company_kycs SET removed = 0 WHERE removed is null;
           UPDATE contracts SET removed = 0 WHERE removed is null;
           UPDATE crypto_wallets SET removed = 0 WHERE removed is null;
           UPDATE currency_history SET removed = 0 WHERE removed is null;
           UPDATE doc_types SET removed = 0 WHERE removed is null;
           UPDATE files SET removed = 0 WHERE removed is null;
           UPDATE finance_settings SET removed = 0 WHERE removed is null;
           UPDATE groups SET removed = 0 WHERE removed is null;
           UPDATE ibans SET removed = 0 WHERE removed is null;
           UPDATE invoice_templates SET removed = 0 WHERE removed is null;
           UPDATE letters SET removed = 0 WHERE removed is null;
           UPDATE logs SET removed = 0 WHERE removed is null;
           UPDATE merchants SET removed = 0 WHERE removed is null;
           UPDATE messages SET removed = 0 WHERE removed is null;
           UPDATE notifications SET removed = 0 WHERE removed is null;
           UPDATE orders SET removed = 0 WHERE removed is null;
           UPDATE profile_kycs SET removed = 0 WHERE removed is null;
           UPDATE providers SET removed = 0 WHERE removed is null;
           UPDATE realmaccounts SET removed = 0 WHERE removed is null;
           UPDATE realmdepartments SET removed = 0 WHERE removed is null;
           UPDATE realms SET removed = 0 WHERE removed is null;
           UPDATE tariffplans SET removed = 0 WHERE removed is null;
           UPDATE tariffs SET removed = 0 WHERE removed is null;
           UPDATE tickets SET removed = 0 WHERE removed is null;
           UPDATE transactions SET removed = 0 WHERE removed is null;
           UPDATE transfers SET removed = 0 WHERE removed is null;
           UPDATE transporters SET removed = 0 WHERE removed is null;
           UPDATE triggers SET removed = 0 WHERE removed is null;
           UPDATE user_documents SET removed = 0 WHERE removed is null;`,
          {
            transaction: t
          }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.sequelize.query(
          `UPDATE accounts SET removed = 0 WHERE removed is null;
           UPDATE account_contracts SET removed = 0 WHERE removed is null;
           UPDATE admin_users SET removed = 0 WHERE removed is null;
           UPDATE banks SET removed = 0 WHERE removed is null;
           UPDATE business_types SET removed = 0 WHERE removed is null;
           UPDATE categories_merchants SET removed = 0 WHERE removed is null;
           UPDATE checks SET removed = 0 WHERE removed is null;
           UPDATE comments SET removed = 0 WHERE removed is null;
           UPDATE company_kycs SET removed = 0 WHERE removed is null;
           UPDATE contracts SET removed = 0 WHERE removed is null;
           UPDATE crypto_wallets SET removed = 0 WHERE removed is null;
           UPDATE currency_history SET removed = 0 WHERE removed is null;
           UPDATE doc_types SET removed = 0 WHERE removed is null;
           UPDATE files SET removed = 0 WHERE removed is null;
           UPDATE finance_settings SET removed = 0 WHERE removed is null;
           UPDATE groups SET removed = 0 WHERE removed is null;
           UPDATE ibans SET removed = 0 WHERE removed is null;
           UPDATE invoice_templates SET removed = 0 WHERE removed is null;
           UPDATE letters SET removed = 0 WHERE removed is null;
           UPDATE logs SET removed = 0 WHERE removed is null;
           UPDATE merchants SET removed = 0 WHERE removed is null;
           UPDATE messages SET removed = 0 WHERE removed is null;
           UPDATE notifications SET removed = 0 WHERE removed is null;
           UPDATE orders SET removed = 0 WHERE removed is null;
           UPDATE profile_kycs SET removed = 0 WHERE removed is null;
           UPDATE providers SET removed = 0 WHERE removed is null;
           UPDATE realmaccounts SET removed = 0 WHERE removed is null;
           UPDATE realmdepartments SET removed = 0 WHERE removed is null;
           UPDATE realms SET removed = 0 WHERE removed is null;
           UPDATE tariffplans SET removed = 0 WHERE removed is null;
           UPDATE tariffs SET removed = 0 WHERE removed is null;
           UPDATE tickets SET removed = 0 WHERE removed is null;
           UPDATE transactions SET removed = 0 WHERE removed is null;
           UPDATE transfers SET removed = 0 WHERE removed is null;
           UPDATE transporters SET removed = 0 WHERE removed is null;
           UPDATE triggers SET removed = 0 WHERE removed is null;
           UPDATE user_documents SET removed = 0 WHERE removed is null;`,
          {
            transaction: t
          }
        )
      ]);
    });
  }
};
