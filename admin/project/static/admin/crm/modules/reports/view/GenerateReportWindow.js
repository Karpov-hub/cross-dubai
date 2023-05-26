Ext.define("Crm.modules.reports.view.GenerateReportWindow", {
  extend: "Ext.window.Window",

  autoShow: true,
  modal: true,

  title: D.t("Generate report"),

  layout: "fit",
  width: 500,
  height: 180,

  initComponent() {
    this.items = this.buildItems();
    this.buttons = this.buildButtons();

    this.model = Ext.create("Crm.modules.reports.model.ReportsQueueModel");

    this.callParent(arguments);
  },

  buildItems() {
    this.setTitle(this.report_data.report_description);

    this.reportCurrencies = ["BNB", "BTC", "USDT", "USTR"];

    return {
      xtype: "form",
      layout: "anchor",
      padding: 5,
      defaults: {
        xtype: "fieldset",
        anchor: "100%",
        defaults: {
          xtype: "textfield",
          anchor: "100%",
          defaults: {
            xtype: "textfield"
          }
        }
      },
      items: [
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          items: [
            {
              xtype: "textfield",
              anchor: "100%",
              fieldLabel: D.t("Address"),
              name: "wallet",
              flex: 1,
              margin: "0 2 0 0",
              listeners: {
                change: async (el, v) => {
                  await this.setCurrencies(v);
                }
              }
            },
            {
              xtype: "button",
              action: "about_address",
              width: 30,
              iconCls: "x-fa fa-question",
              handler: () => {
                this.openAboutAddrWindow();
              }
            }
          ]
        },

        this.buildCurrencyCombo(),
        {
          xtype: "fieldcontainer",
          layout: "hbox",
          fieldLabel: D.t("Period"),
          defaults: {
            xtype: "xdatefield",

            submitFormat: "Y-m-d",
            format: D.t("d/m/Y"),
            flex: 1
          },
          items: [
            {
              name: "start_date",
              margin: "0 3 0 0",
              format: D.t("d/m/Y"),
              emptyText: D.t("Date from")
            },
            {
              name: "end_date",
              margin: "0 0 0 3",
              format: D.t("d/m/Y"),
              emptyText: D.t("Date To")
            }
          ]
        }
      ]
    };
  },

  buildCurrencyCombo() {
    return {
      name: "currency",
      fieldLabel: D.t("Currency"),
      xtype: "combo",
      editable: false,
      queryMode: "local",
      displayField: "abbr",
      flex: 1,
      valueField: "abbr",
      store: {
        fields: ["abbr"],
        data: this.reportCurrencies.map((item) => {
          return { abbr: item };
        })
      }
    };
  },

  buildButtons() {
    return [
      {
        text: D.t("Generate"),
        handler: () => {
          this.generateReport();
        }
      },
      {
        text: D.t("Cancel"),
        handler: () => {
          this.close();
        }
      }
    ];
  },

  async generateReport() {
    const values = this.down("form").getValues();
    const realm_id = await this.model.getDefaultRealm();
    const currency = this.down("[name=currency]").getValue();
    const start_date = this.down("[name=start_date]").getValue();
    const end_date = this.down("[name=end_date]").getValue();

    if (!currency) return D.a("Error", "Please select currency");
    if (!start_date) return D.a("Error", "Please select start date");
    if (!end_date) return D.a("Error", "Please select end date");

    values.service = "ccoin-service";
    values.method = "getWalletReport";
    values.report_type = this.report_data.type;
    values.report_description = `${currency} ${
      this.report_data.report_description
    } ${new Date(start_date).toLocaleDateString()}-${new Date(
      end_date
    ).toLocaleDateString()} | ${values.wallet || "All wallets"}`;

    await this.model.callApi(
      "report-service",
      "requestReport",
      values,
      realm_id
    );

    this.callback();
    this.close();
  },

  async setCurrencies(address) {
    const currencies = await this.model.callApi(
      "ccoin-service",
      "getValidCurrenciesForAddress",
      {
        address
      }
    );

    let currencyList = [];
    const currencyCombo = this.down("[name=currency]");

    if (!address) {
      currencyList = this.reportCurrencies.map((item) => {
        return { abbr: item };
      });
      currencyCombo.getStore().loadData(currencyList);
    } else {
      const availableCurrencies = currencies.filter((item) =>
        this.reportCurrencies.includes(item)
      );
      currencyList = availableCurrencies.map((item) => {
        return { abbr: item };
      });

      currencyCombo.getStore().loadData(currencyList);

      if (currencyList.length) {
        currencyCombo.setValue(currencyList[0].abbr);
      }
    }
  },

  openAboutAddrWindow() {
    return Ext.create("Crm.modules.reports.view.AboutAddressesWindow");
  }
});
