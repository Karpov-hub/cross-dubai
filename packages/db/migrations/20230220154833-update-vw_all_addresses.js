"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `CREATE OR REPLACE VIEW vw_all_addresses
      AS SELECT 'account_crypto'::text AS source,
      vca.id,
      vca.crypto_address AS address,
      vca.currency,
      vca.owner AS user_id,
      vca.merchant_id
     FROM vw_client_accs vca
    WHERE vca.crypto_address IS NOT NULL
  UNION ALL
   SELECT 'crypto_wallets'::text AS source,
      cw.id,
      cw.num AS address,
      cw.curr_name AS currency,
      cw.user_id,
      NULL::uuid AS merchant_id
     FROM crypto_wallets cw
  UNION ALL
   SELECT 'non_custodial_wallets'::text AS source,
      ncw.id,
      ncw.address,
      ncw.currency,
      ncw.user_id,
      ncw.merchant_id
     FROM non_custodial_wallets ncw
  UNION ALL
   SELECT distinct 'wallet_chains_sr'::text AS source,
      NULL::uuid AS id,
      COALESCE(wc.wallet_sender, wc1.wallet_receiver) AS address,
      NULL::character varying AS currency,
      (SELECT m.user_id
             FROM merchants m
            WHERE m.id = COALESCE(wc.merchant_id, wc1.merchant_id)) AS user_id,
      COALESCE(wc.merchant_id, wc1.merchant_id) AS merchant_id
     FROM wallet_chains wc
       FULL JOIN wallet_chains wc1 ON 1 = 2
    GROUP BY wc.merchant_id, wc1.merchant_id, (COALESCE(wc.wallet_sender, wc1.wallet_receiver)), (COALESCE(wc.merchant_id, wc1.merchant_id))
  UNION ALL
   SELECT distinct 'wallet_chains'::text AS source,
       NULL::uuid AS id,
       jsonb_array_elements_text(wc.wallets -> '_arr'::text) as address,
       NULL::character varying AS currency,
       (SELECT m.user_id
            FROM merchants m
            WHERE m.id = wc.merchant_id) AS user_id,
      wc.merchant_id AS merchant_id
      FROM wallet_chains wc;`
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(`CREATE OR REPLACE VIEW vw_all_addresses
      AS SELECT 'account_crypto'::text AS source,
          vca.id,
          vca.crypto_address AS address,
          vca.currency,
          vca.owner AS user_id,
          vca.merchant_id
         FROM vw_client_accs vca
        WHERE vca.crypto_address IS NOT NULL
      UNION ALL
       SELECT 'crypto_wallets'::text AS source,
          cw.id,
          cw.num AS address,
          cw.curr_name AS currency,
          cw.user_id,
          NULL::uuid AS merchant_id
         FROM crypto_wallets cw
      UNION ALL
       SELECT 'non_custodial_wallets'::text AS source,
          ncw.id,
          ncw.address,
          ncw.currency,
          ncw.user_id,
          ncw.merchant_id
         FROM non_custodial_wallets ncw
      UNION ALL
       SELECT 'wallet_chains'::text AS source,
          NULL::uuid AS id,
          COALESCE(wc.wallet_sender, wc1.wallet_receiver) AS address,
          NULL::character varying AS currency,
          ( SELECT m.user_id
                 FROM merchants m
                WHERE m.id = COALESCE(wc.merchant_id, wc1.merchant_id)) AS user_id,
          COALESCE(wc.merchant_id, wc1.merchant_id) AS merchant_id
         FROM wallet_chains wc
           FULL JOIN wallet_chains wc1 ON 1 = 2
        GROUP BY wc.merchant_id, wc1.merchant_id, (COALESCE(wc.wallet_sender, wc1.wallet_receiver)), (COALESCE(wc.merchant_id, wc1.merchant_id));`);
  }
};
