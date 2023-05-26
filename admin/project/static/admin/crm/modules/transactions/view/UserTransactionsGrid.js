Ext.define("Crm.modules.transactions.view.UserTransactionsGrid", {
  extend: "Crm.modules.transactions.view.TransactionsGrid",

  title: null,
  iconCls: null,

  buildColumns: function() {
    (this.fields = [
      "id",
      "ref_id",
      "username",
      "realmname",
      "ctime",
      "acc_src",
      "acc_dst",
      "amount",
      "exchange_amount",
      "plan",
      "tariff",
      "canceled",
      "held",
      "description_src",
      "description_dst",
      "description",
      "currency_src",
      "currency_dst",
      "currency"
    ]),
      (this.eventsNames = {});
    this.eventStore = Ext.create("Ext.data.Store", {
      fields: ["key", "name"],
      data: []
    });
    return [
      {
        xtype: "datecolumn",
        text: D.t("Date"),
        flex: 1,
        sortable: true,
        format: "d.m.Y H:i:s",
        filter: {
          xtype: "datefield",
          format: "d.m.Y"
        },
        dataIndex: "ctime"
      },
      {
        text: D.t("Amount"),
        align: "right",
        width: 90,
        sortable: true,
        dataIndex: "amount",
        filter: true
      },
      {
        text: D.t("Currency"),
        width: 70,
        sortable: true,
        dataIndex: "currency",
        filter: true
      },

      {
        text: D.t("Held"),
        width: 60,
        sortable: true,
        dataIndex: "held",
        renderer: (v) => {
          return v ? "Held" : "No";
        },
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          editable: false,
          store: [
            [true, "Held"],
            [false, "No"]
          ],
          operator: "eq"
        }
      },
      {
        text: D.t("Canceled"),
        width: 80,
        sortable: true,
        dataIndex: "canceled",
        renderer: (v) => {
          return v ? "Canceled" : "No";
        },
        filter: {
          xtype: "combo",
          queryMode: "local",
          forceSelection: true,
          triggerAction: "all",
          editable: false,
          store: [
            [true, "Canceled"],
            [false, "No"]
          ],
          operator: "eq"
        }
      }
    ];
  },

  detailsTpl() {
    return new Ext.XTemplate(
      "<p><b>Ref.ID:</b> {ref_id}</p>",
      "<p><b>Date:</b> {ctime}</p>",
      "<p><b>Tariff Plan:</b> {plan}</p>",
      "<p><b>Tariff:</b> {tariff}</p>",
      "<p><b>Source Account:</b> {acc_src}</p>",
      "<p><b>Destination Account:</b> {acc_dst}</p>",
      "<p><b>Amount:</b> {amount} {currency}</p>",
      "<p><b>Held:</b> {held}</p>",
      "<p><b>Canceled:</b> {canceled}</p>",
      "<p><b>Description:</b> {description}</p>"
    );
  }

  // buildTbar() {
  //   let items = this.callParent();
  //   items.push({
  //     text: D.t("Dependent payment"),
  //     tooltip: D.t("Dependent payment"),
  //     iconCls: "x-fa fa-money-bill-alt",
  //     scale: "medium",
  //     action: "dependent_payment"
  //   });
  //   return items;
  // }
});
