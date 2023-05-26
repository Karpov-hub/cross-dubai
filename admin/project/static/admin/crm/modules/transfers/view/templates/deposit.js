Ext.define("Crm.modules.transfers.view.templates.deposit", {
  extend: "Crm.modules.transfers.view.templates.default",

  build() {
    return `
        <ul>
            ${this.tpl}
            <tpl if="data.options.bankname"><li>Bank: <span>{data.options.bankname}</span></li></tpl>
            <tpl if="data.options.corr_bank"><li>Correspondent bank: <span>{data.options.corr_bank}</span></li></tpl>
            <tpl if="data.options.corr_swift"><li>Correspondent bank SWIFT: <span>{data.options.corr_swift}</span></li></tpl>
            <tpl if="data.options.corr_acc"><li>Account in correspondent bank: <span>{data.options.corr_acc}</span></li></tpl>
            <tpl if="data.options.swift"><li>SWIFT: <span>{data.options.swift}</span></li></tpl>
            <li>IBAN: <span>{data.options.iban} ({data.options.iban_currency})</span></li>
            <tpl if="data.options.country"><li>Country: <span>{data.options.country}</span></li></tpl>
            <tpl if="data.options.province"><li>Province: <span>{data.options.province}</span></li></tpl>
            <tpl if="data.options.zip"><li>ZIP: <span>{data.options.zip}</span></li></tpl>
        </ul>`;
  }
});
