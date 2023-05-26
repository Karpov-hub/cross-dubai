Ext.define("Crm.modules.chainOfWallets.view.WalletsForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Chain"),
  titleTpl: D.t(
    `Chain ({[values.status ? "<span style='color: #ff7a7a;'>Deactivated</span>":"<span style='color: #4bad4b;'>Active</span>"]})`
  ),

  iconCls: "x-fa fa-link",

  formLayout: "anchor",

  formMargin: 0,

  width: 1000,
  height: 400,

  onActivate: function() {},
  onClose: function() {},
  syncSize: function() {},

  controllerCls: "Crm.modules.chainOfWallets.view.WalletsFormController",

  buildItems() {
    return {
      xtype: "panel",
      layout: "border",
      height: 600,
      items: [
        {
          title: D.t("General"),
          xtype: "panel",
          layout: "anchor",
          region: "center",
          defaults: {
            xtype: "textfield",
            readOnly: true,
            anchor: "100%",
            margin: 5
          },
          items: [
            { name: "id", hidden: true },
            {
              name: "merchant_id",
              hidden: true
            },
            {
              name: "merchant_name",
              fieldLabel: D.t("Merchant")
            },
            {
              name: "wallet_sender",
              fieldLabel: D.t("Wallet sender")
            },
            {
              name: "wallet_receiver",
              fieldLabel: D.t("Wallet receiver")
            },
            {
              xtype: "xdatefield",
              name: "first_payment_date",
              fieldLabel: D.t("First payment date"),
              format: "d.m.Y H:i:s"
            },
            {
              name: "lifespan",
              fieldLabel: D.t("Lifespan (days)")
            }
          ]
        },
        {
          title: D.t("Wallets in a chain"),
          xtype: "panel",
          layout: "anchor",
          region: "east",
          width: "50%",
          split: true,
          items: [
            {
              xtype: "gridfield",
              disableRemoveAction: true,
              layout: "fit",
              name: "wallets",
              fields: ["wallet"],
              buildButtonsColumns() {},
              buildTbar() {},
              columns: [
                {
                  flex: 1,
                  text: D.t("Wallet"),
                  dataIndex: "wallet",
                  renderer(v, m, r) {
                    return r.data;
                  }
                }
              ]
            }
          ]
        }
      ]
    };
  },

  buildButtons() {
    return [
      {
        text: D.t("Deactivate"),
        action: "deactivate_chain"
      },
      "->",
      {
        text: D.t("Close"),
        handler: () => {
          this.close();
        }
      }
    ];
  }
});
