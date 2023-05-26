"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `
      CREATE OR REPLACE VIEW vw_simple_transfers
      AS 
WITH simple_transfers AS (
       WITH inner_simple_transfers AS (
               WITH netdata AS (
                       SELECT
                              CASE
                                  WHEN (((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'requestId') IS NOT NULL THEN (((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'requestId')::uuid
                                  when is_json((((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'error')) AND (((((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'error')::jsonb) ->> 'requestId') IS NOT NULL THEN (((((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'error')::jsonb) ->> 'requestId')::uuid
                                  ELSE NULL::uuid
                              END AS id,
                          (((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb AS net,
                           case 
               when is_json((((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'error'))
                 then (((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'error')::jsonb
                 else
               null
               end AS net_err
                         FROM transfers t_1
                        WHERE ((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) IS NOT NULL
                        GROUP BY t_1.id
                      )
               SELECT tp.id,
                  ap.name AS plan_name,
                      CASE
                          WHEN (nd.net ->> 'fromAddress'::text) IS NOT NULL THEN nd.net ->> 'fromAddress'::text
                          WHEN (nd.net_err ->> 'fromAddress'::text) IS NOT NULL THEN nd.net_err ->> 'fromAddress'::text
                          ELSE '-'::text
                      END AS sender_address,
                  sender_m.id AS sender_id,
                  sender_m.name AS sender,
                      CASE
                          WHEN (nd.net ->> 'toAddress'::text) IS NOT NULL THEN nd.net ->> 'toAddress'::text
                          WHEN (nd.net_err ->> 'toAddress'::text) IS NOT NULL THEN nd.net_err ->> 'toAddress'::text
                          ELSE '-'::text
                      END AS receiver_address,
                  receiver_m.id AS receiver_id,
                  receiver_m.name AS receiver,
                  first_t.amount,
                  ((((first_t.data ->> 'plan'::text)::jsonb) ->> 'from'::text)::jsonb) ->> 'currency'::text AS currency,
                  last_t.amount AS result_amount,
                  ((((last_t.data ->> 'plan'::text)::jsonb) ->> 'to'::text)::jsonb) ->> 'currency'::text AS result_currency,
                  c.id AS hash,
                  concat(curr.explorer_url, c.id) AS hash_url,
                  c.network_fee AS fee,
                  c.network_fee_currency_id AS fee_currency,
                      CASE
                          WHEN t.canceled THEN 'CANCELED'::text
                          WHEN ((((((nd.net_err ->> 'result'::text)::jsonb) ->> 'errors'::text)::jsonb) -> 0) ->> 'message'::text) IS NOT NULL THEN 'ERROR'::text
                          WHEN c.id IS NOT NULL THEN 'COMPLETED'::text
                          ELSE 'PENDING'::text
                      END AS status,
                  tp.ctime AS started,
                  c.ctime AS finished,
                  tp.description ->> 'ui'::text AS ui_description,
                  tp.description ->> 'admin'::text AS admin_description,
                  (((nd.net_err ->> 'result'::text)::jsonb) ->> 'errors'::text)::jsonb AS errors
                 FROM transfers_plans tp
                   JOIN transfers t ON t.plan_transfer_id = tp.id
                   LEFT JOIN netdata nd ON nd.id = t.id
                   LEFT JOIN transfers t2 ON (t2.data ->> 'requestId'::text) = t.id::text AND (t2.data ->> 'address'::text) = (nd.net ->> 'toAddress'::text)
                   LEFT JOIN cryptotx c ON c.id::text = (t2.data ->> 'txId'::text)
                   JOIN accounts_plans ap ON ap.id = tp.plan_id
                   LEFT JOIN account_crypto sender_ac ON sender_ac.address::text = (nd.net ->> 'fromAddress'::text) OR sender_ac.address::text = (nd.net_err ->> 'fromAddress'::text)
                   LEFT JOIN accounts sender_a ON sender_ac.acc_no::text = sender_a.acc_no::text
                   LEFT JOIN merchant_accounts sender_ma ON sender_ma.id_account = sender_a.id
                   LEFT JOIN merchants sender_m ON sender_ma.id_merchant = sender_m.id
                   LEFT JOIN account_crypto receiver_ac ON receiver_ac.address::text = (nd.net ->> 'toAddress'::text) OR receiver_ac.address::text = (nd.net_err ->> 'toAddress'::text)
                   LEFT JOIN accounts receiver_a ON receiver_ac.acc_no::text = receiver_a.acc_no::text
                   LEFT JOIN merchant_accounts receiver_ma ON receiver_ma.id_account = receiver_a.id
                   LEFT JOIN merchants receiver_m ON receiver_ma.id_merchant = receiver_m.id
                   LEFT JOIN transfers first_t ON first_t.plan_transfer_id = tp.id AND (((((first_t.data ->> 'plan'::text)::jsonb) ->> 'from'::text)::jsonb) ->> 'acc_no'::text) = ((((tp.items ->> '_arr'::text)::jsonb) -> 0) ->> 'acc_no'::text)
                   LEFT JOIN transfers last_t ON last_t.plan_transfer_id = tp.id AND (((((last_t.data ->> 'plan'::text)::jsonb) ->> 'to'::text)::jsonb) ->> 'acc_no'::text) = ((((tp.items ->> '_arr'::text)::jsonb) -> (jsonb_array_length((tp.items ->> '_arr'::text)::jsonb) - 1)) ->> 'acc_no'::text)
                   LEFT JOIN currency curr ON curr.abbr::text = (((((last_t.data ->> 'plan'::text)::jsonb) ->> 'to'::text)::jsonb) ->> 'currency'::text)
                WHERE (nd.net ->> 'fromAddress'::text) IS NOT NULL OR ((((nd.net_err ->> 'result'::text)::jsonb) ->> 'errors'::text)::jsonb) IS NOT NULL
              )
       SELECT ist.id,
          ist.plan_name,
          ist.sender_address,
          ist.sender_id,
          ist.sender,
          ist.receiver_address,
          ist.receiver_id,
          ist.receiver,
          ist.amount,
          ist.currency,
          ist.result_amount,
          ist.result_currency,
          ist.hash,
          ist.hash_url,
          ist.fee,
          ist.fee_currency,
          ist.status,
          ist.started,
          ist.finished,
          ist.ui_description,
          ist.admin_description,
          ist.errors,
          row_number() OVER (PARTITION BY ist.id ORDER BY 'started'::text DESC) AS rank_no
         FROM inner_simple_transfers ist
      )
SELECT st.id,
  st.plan_name,
  st.sender_address,
  st.sender_id,
  st.sender,
  st.receiver_address,
  st.receiver_id,
  st.receiver,
  st.amount,
  st.currency,
  st.result_amount,
  st.result_currency,
  st.hash,
  st.hash_url,
  st.fee,
  st.fee_currency,
  st.status,
  st.started,
  st.finished,
  st.ui_description,
  st.admin_description,
  st.errors,
  st.rank_no
 FROM simple_transfers st
WHERE st.rank_no = 1;
      `
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `
      CREATE OR REPLACE VIEW vw_simple_transfers
      AS 
WITH simple_transfers AS (
       WITH inner_simple_transfers AS (
               WITH netdata AS (
                       SELECT
                              CASE
                                  WHEN (((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'requestId') IS NOT NULL THEN (((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'requestId')::uuid
                                  when is_json((((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'error')) AND (((((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'error')::jsonb) ->> 'requestId') IS NOT NULL THEN (((((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'error')::jsonb) ->> 'requestId')::uuid
                                  ELSE NULL::uuid
                              END AS id,
                          (((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb AS net,
                           case 
               when is_json((((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'error'))
                 then (((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) ->> 'error')::jsonb
                 else
               null
               end AS net_err
                         FROM transfers t_1
                        WHERE ((((t_1.data ->> 'netData')::jsonb) ->> 'net')::jsonb) IS NOT NULL
                        GROUP BY t_1.id
                      )
               SELECT tp.id,
                  ap.name AS plan_name,
                      CASE
                          WHEN (nd.net ->> 'fromAddress'::text) IS NOT NULL THEN nd.net ->> 'fromAddress'::text
                          WHEN (nd.net_err ->> 'fromAddress'::text) IS NOT NULL THEN nd.net_err ->> 'fromAddress'::text
                          ELSE '-'::text
                      END AS sender_address,
                  sender_m.id AS sender_id,
                  sender_m.name AS sender,
                      CASE
                          WHEN (nd.net ->> 'toAddress'::text) IS NOT NULL THEN nd.net ->> 'toAddress'::text
                          WHEN (nd.net_err ->> 'toAddress'::text) IS NOT NULL THEN nd.net_err ->> 'toAddress'::text
                          ELSE '-'::text
                      END AS receiver_address,
                  receiver_m.id AS receiver_id,
                  receiver_m.name AS receiver,
                  first_t.amount,
                  ((((first_t.data ->> 'plan'::text)::jsonb) ->> 'from'::text)::jsonb) ->> 'currency'::text AS currency,
                  last_t.amount AS result_amount,
                  ((((last_t.data ->> 'plan'::text)::jsonb) ->> 'to'::text)::jsonb) ->> 'currency'::text AS result_currency,
                  c.id AS hash,
                  concat(curr.explorer_url, c.id) AS hash_url,
                  c.network_fee AS fee,
                  c.network_fee_currency_id AS fee_currency,
                      CASE
                          WHEN t.canceled THEN 'CANCELED'::text
                          WHEN ((((((nd.net_err ->> 'result'::text)::jsonb) ->> 'errors'::text)::jsonb) -> 0) ->> 'message'::text) IS NOT NULL THEN 'ERROR'::text
                          WHEN c.id IS NOT NULL THEN 'COMPLETED'::text
                          ELSE 'PENDING'::text
                      END AS status,
                  tp.ctime AS started,
                  c.ctime AS finished,
                  tp.description ->> 'ui'::text AS ui_description,
                  tp.description ->> 'admin'::text AS admin_description,
                  (((nd.net_err ->> 'result'::text)::jsonb) ->> 'errors'::text)::jsonb AS errors
                 FROM transfers_plans tp
                   JOIN transfers t ON t.plan_transfer_id = tp.id
                   LEFT JOIN netdata nd ON nd.id = t.id
                   LEFT JOIN transfers t2 ON (t2.data ->> 'requestId'::text) = t.id::text AND (t2.data ->> 'address'::text) = (nd.net ->> 'toAddress'::text)
                   LEFT JOIN cryptotx c ON c.id::text = (t2.data ->> 'txId'::text) AND c.amount >= 0.001::double precision
                   JOIN accounts_plans ap ON ap.id = tp.plan_id
                   LEFT JOIN account_crypto sender_ac ON sender_ac.address::text = (nd.net ->> 'fromAddress'::text) OR sender_ac.address::text = (nd.net_err ->> 'fromAddress'::text)
                   LEFT JOIN accounts sender_a ON sender_ac.acc_no::text = sender_a.acc_no::text
                   LEFT JOIN merchant_accounts sender_ma ON sender_ma.id_account = sender_a.id
                   LEFT JOIN merchants sender_m ON sender_ma.id_merchant = sender_m.id
                   LEFT JOIN account_crypto receiver_ac ON receiver_ac.address::text = (nd.net ->> 'toAddress'::text) OR receiver_ac.address::text = (nd.net_err ->> 'toAddress'::text)
                   LEFT JOIN accounts receiver_a ON receiver_ac.acc_no::text = receiver_a.acc_no::text
                   LEFT JOIN merchant_accounts receiver_ma ON receiver_ma.id_account = receiver_a.id
                   LEFT JOIN merchants receiver_m ON receiver_ma.id_merchant = receiver_m.id
                   LEFT JOIN transfers first_t ON first_t.plan_transfer_id = tp.id AND (((((first_t.data ->> 'plan'::text)::jsonb) ->> 'from'::text)::jsonb) ->> 'acc_no'::text) = ((((tp.items ->> '_arr'::text)::jsonb) -> 0) ->> 'acc_no'::text)
                   LEFT JOIN transfers last_t ON last_t.plan_transfer_id = tp.id AND (((((last_t.data ->> 'plan'::text)::jsonb) ->> 'to'::text)::jsonb) ->> 'acc_no'::text) = ((((tp.items ->> '_arr'::text)::jsonb) -> (jsonb_array_length((tp.items ->> '_arr'::text)::jsonb) - 1)) ->> 'acc_no'::text)
                   LEFT JOIN currency curr ON curr.abbr::text = (((((last_t.data ->> 'plan'::text)::jsonb) ->> 'to'::text)::jsonb) ->> 'currency'::text)
                WHERE (nd.net ->> 'fromAddress'::text) IS NOT NULL OR ((((nd.net_err ->> 'result'::text)::jsonb) ->> 'errors'::text)::jsonb) IS NOT NULL
              )
       SELECT ist.id,
          ist.plan_name,
          ist.sender_address,
          ist.sender_id,
          ist.sender,
          ist.receiver_address,
          ist.receiver_id,
          ist.receiver,
          ist.amount,
          ist.currency,
          ist.result_amount,
          ist.result_currency,
          ist.hash,
          ist.hash_url,
          ist.fee,
          ist.fee_currency,
          ist.status,
          ist.started,
          ist.finished,
          ist.ui_description,
          ist.admin_description,
          ist.errors,
          row_number() OVER (PARTITION BY ist.id ORDER BY 'started'::text DESC) AS rank_no
         FROM inner_simple_transfers ist
      )
SELECT st.id,
  st.plan_name,
  st.sender_address,
  st.sender_id,
  st.sender,
  st.receiver_address,
  st.receiver_id,
  st.receiver,
  st.amount,
  st.currency,
  st.result_amount,
  st.result_currency,
  st.hash,
  st.hash_url,
  st.fee,
  st.fee_currency,
  st.status,
  st.started,
  st.finished,
  st.ui_description,
  st.admin_description,
  st.errors,
  st.rank_no
 FROM simple_transfers st
WHERE st.rank_no = 1;
      `
    );
  }
};
