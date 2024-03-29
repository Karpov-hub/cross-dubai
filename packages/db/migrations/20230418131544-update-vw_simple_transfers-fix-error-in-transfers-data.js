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
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `
        CREATE OR REPLACE VIEW vw_simple_transfers
        AS 
        with simple_transfers as (with inner_simple_transfers as (
          with netData as (
            select
              case
                when ((t.data->>'netData')::jsonb->>'net')::jsonb ->> 'requestId' notnull
                then (((t.data->>'netData')::jsonb->>'net')::jsonb ->> 'requestId')::uuid
                when (((t.data->>'netData')::jsonb->>'net')::jsonb ->>'error')::jsonb ->> 'requestId' notnull
                then ((((t.data->>'netData')::jsonb->>'net')::jsonb ->>'error')::jsonb ->> 'requestId')::uuid
              end id, 
              ((t.data->>'netData')::jsonb->>'net')::jsonb net, 
              (((t.data->>'netData')::jsonb->>'net')::jsonb ->>'error')::jsonb net_err
            from transfers t
            where ((t.data->>'netData')::jsonb->>'net')::jsonb notnull 
            group by t.id 
          )
          select
            tp.id,
            ap."name" plan_name,
            case
              when 
                nd.net->>'fromAddress' notnull 
              then 
                nd.net->>'fromAddress'
              when 
                nd.net_err->>'fromAddress' notnull 
              then 
                nd.net_err->>'fromAddress' 
              else '-'
            end sender_address,
            sender_m.id sender_id,
            sender_m."name" sender,
            case
              when 
                nd.net->>'toAddress' notnull 
              then 
                nd.net->>'toAddress'
              when 
                nd.net_err ->>'toAddress' notnull 
              then 
                nd.net_err ->>'toAddress'
              else '-'
            end receiver_address,
            receiver_m.id receiver_id,
            receiver_m."name" receiver,
            first_t.amount amount,
            ((first_t."data" ->>'plan')::jsonb->>'from')::jsonb->>'currency' currency,
            last_t.amount result_amount,
            ((last_t."data" ->>'plan')::jsonb->>'to')::jsonb->>'currency' result_currency,	
            c.id hash,
            concat(curr.explorer_url, c.id) hash_url,
            c.network_fee fee,
            c.network_fee_currency_id fee_currency,
            case
              when t.canceled then 'CANCELED'
              when (((nd.net_err->>'result')::jsonb->>'errors')::jsonb->0) ->> 'message' notnull then 'ERROR'
              when c.id notnull then 'COMPLETED'
              else 'PENDING'
            end status,
            tp.ctime started,
            c.ctime finished,
            tp.description ->> 'ui' ui_description,
            tp.description ->> 'admin' admin_description,
            (((nd.net_err::jsonb->>'result')::jsonb->>'errors')::jsonb) errors
          from transfers_plans tp
          inner join transfers t
          on (t.plan_transfer_id = tp.id)
          left join netData nd
          on(nd.id = t.id)
          left join transfers t2
          on (t2.data ->> 'requestId' = t.id::text and t2.data ->> 'address' = nd.net->>'toAddress')
          left join cryptotx c 
          on (c.id::text = t2.data ->> 'txId' and c.amount >=0.001)
          inner join accounts_plans ap 
          on (ap.id = tp.plan_id)
          left join account_crypto sender_ac 
          on (
            sender_ac.address = nd.net->>'fromAddress' or 
            sender_ac.address = nd.net_err->>'fromAddress'
          )
          left join  accounts sender_a
          on (sender_ac.acc_no = sender_a.acc_no)
          left join merchant_accounts sender_ma
          on (sender_ma.id_account = sender_a.id)
          left join merchants sender_m 
          on (sender_ma.id_merchant = sender_m.id)
          left join account_crypto receiver_ac
          on (
            receiver_ac.address = nd.net->>'toAddress' or
            receiver_ac.address = nd.net_err->>'toAddress'
          )
          left join  accounts receiver_a 
          on (receiver_ac.acc_no = receiver_a.acc_no)
          left join merchant_accounts receiver_ma
          on (receiver_ma.id_account = receiver_a.id)
          left join merchants receiver_m
          on (receiver_ma.id_merchant = receiver_m.id)
          left join transfers first_t
          on(
            first_t.plan_transfer_id = tp.id and 
            (((first_t.data->>'plan')::jsonb)->>'from')::jsonb->>'acc_no' = ((((tp.items->>'_arr')::jsonb)->0)::jsonb)->>'acc_no'
          )
          left join transfers last_t
          on(
            last_t.plan_transfer_id = tp.id and 
            (((last_t.data->>'plan')::jsonb)->>'to')::jsonb->>'acc_no' = ((((tp.items ->>'_arr')::jsonb)->(jsonb_array_length((tp.items ->>'_arr')::jsonb)::integer-1))::jsonb)->>'acc_no'
          )
          left join currency curr
          on(curr.abbr = ((last_t."data" ->>'plan')::jsonb->>'to')::jsonb->>'currency')
          where 
            (
              nd.net->>'fromAddress' notnull 
              or 
              (((nd.net_err->>'result')::jsonb->>'errors')::jsonb) notnull
            )
          )
          select ist.*, row_number() over(partition by ist.id order by 'started' desc) rank_no
          from inner_simple_transfers ist 
          )
          select st.* from simple_transfers st where st.rank_no=1           
      `
    );
  }
};
