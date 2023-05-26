"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `CREATE OR REPLACE VIEW vw_all_addresses AS
      SELECT 'account_crypto' AS source, vca.id, vca.crypto_address AS address, vca.currency, vca."owner" AS user_id, vca.merchant_id FROM vw_client_accs vca WHERE vca.crypto_address IS NOT NULL
      UNION ALL
      SELECT 'crypto_wallets', cw.id, cw.num, cw.curr_name, cw.user_id, null FROM crypto_wallets cw
      UNION ALL
      SELECT 'non_custodial_wallets', ncw.id, ncw.address, ncw.currency, ncw.user_id, ncw.merchant_id FROM non_custodial_wallets ncw
      UNION ALL
      SELECT 'wallet_chains', null, COALESCE(wc.wallet_sender,wc1.wallet_receiver), null, (select user_id FROM merchants m WHERE m.id=COALESCE(wc.merchant_id,wc1.merchant_id)), COALESCE(wc.merchant_id,wc1.merchant_id) FROM wallet_chains wc FULL JOIN wallet_chains AS wc1 ON 1=2 GROUP BY wc.merchant_id, wc1.merchant_id, COALESCE(wc.wallet_sender,wc1.wallet_receiver), COALESCE(wc.merchant_id,wc1.merchant_id)`
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("DROP VIEW vw_all_addresses");
  }
};
