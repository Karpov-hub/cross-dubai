"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
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
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      `
        DROP VIEW IF EXISTS vw_simple_transfers
      `
    );
  }
};
