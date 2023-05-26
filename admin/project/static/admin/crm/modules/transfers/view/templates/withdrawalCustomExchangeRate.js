Ext.define(
  "Crm.modules.transfers.view.templates.withdrawalCustomExchangeRate",
  {
    extend: "Crm.modules.transfers.view.templates.default",

    build() {
      return `
            <ul>
            <tpl if="data.crypto && !canceled"> <li>Transfer status: <span>{[["","NIL->SK","SK->Monitoring","Monitoring->Final","Completed"][values.status]]}</span></li></tpl>
            <tpl if="!data.crypto && !canceled"><li>Transfer status: <span>{[["","In Progress","In Progress","In Progress","Completed"][values.status]]}</span></li></tpl>
            <tpl if="canceled"><li>Transfer status: <span>{string_status}</span></li></tpl>
            <li>Merchant: <span>{data.organisation_name}</span></li>
            <li>Date: <span>{ctime:date("d.m.Y H:i")}</span></li>
            <li>Withdrawal amount: <span>{data.amount} {data.currency}</span></li>
            <li>Fees and deductions: <span>{[values.data.feesAndDeductions?values.data.feesAndDeductions:""]} {data.currency}</span></li>
            <li>Amount less deductions: <span>{[values.data.sentAmount?values.data.sentAmount:""]} {data.currency}</span></li>
            <li>Exchange rate: <span>{data.custom_exchange_rate}</span></li>
            <li>Converted amount: <span>{[values.data.finAmount?values.data.finAmount:""]} {data.to_currency}</span></li>
            <li>Transaction hash:<br>{txId}</li>
            {[values.monitoring_address?'<li>Monitoring address: <span>{monitoring_address}</span></li>':""]}
            </ul>`;
    }
  }
);
