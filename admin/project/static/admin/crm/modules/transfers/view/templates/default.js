Ext.define("Crm.modules.transfers.view.templates.default", {
  tpl: `
    <li>Transfer type (): <span>{[values.event_name.split(":")[1]]}</span></li>
    <li>Status: <span>
    <tpl if="status == 1">INITIATED</tpl>
    <tpl if="status == 2">PROCESSING</tpl>
    <tpl if="status == 3">TRANSFERRED</tpl>
    <tpl if="status == 4">REJECTED</tpl>
    <tpl if="status == 5">REFUND EXT</tpl>
    <tpl if="status == 6">REFUND</tpl>
    <tpl if="status == 7">CANCELED</tpl>
    </span></li>
    <li>Realm: <span>{realmname}</span></li>
    <li>Client: <span>{username}</span></li>
    <li>Amount: <span>{data.amount} {data.currency}</span></li>
    <li>Date: <span>{ctime:date("d.m.Y H:i")}</span></li>
  `,
  build() {
    return `<ul>${this.tpl}</ul>`;
  }
});
