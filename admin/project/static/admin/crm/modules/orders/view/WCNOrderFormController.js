Ext.define("Crm.modules.orders.view.WCNOrderFormController", {
  extend: "Core.form.FormController",

  mixins: ["Crm.modules.orders.view.FieldsHelper"],

  orders_statuses: ["Created", "In progress", "Completed"],
  data: {},

  setControls() {
    let me = this;
    this.control({
      "[name=organisation]": {
        change: async (e, v) => {
          this.checkOrganisation(v);
        }
      },
      "[name=order_type]": {
        change: (el, v) => {
          this.changePanelAccordingToTheDealType(v);
        }
      },
      "[action=generate_report]": {
        click: () => {
          this.generateReport();
        }
      },
      "[action=copy_short_id_to_clipboard]": {
        click: () => {
          this.copyIdToClipboard();
        }
      },
      "[action=generate_client_report]": {
        click: () => {
          this.generateReport("_client");
        }
      },
      "[action=generate_admin_report]": {
        click: () => {
          this.generateReport("_admin");
        }
      }
    });

    this.MerchantModel = Ext.create(
      "Crm.modules.merchants.model.MerchantsModel"
    );

    this.UserModel = Ext.create("Crm.modules.accountHolders.model.UsersModel");

    this.view.on("beforesave", async (el, data) => {
      data.additional_data = this.prepareAddtitionalWCNOrderData(data);
      if (!data.ctime) {
        data.ctime = new Date();
        me.view.down("[name=ctime]").setValue(data.ctime);
      }
      data.additional_data = Object.assign(data.additional_data, {
        report_erc_address: this.getFieldVal("report_erc_address"),
        report_erc_address_currency: this.getFieldVal(
          "report_erc_address_currency"
        ),
        report_trc_address: this.getFieldVal("report_trc_address"),
        report_trc_address_currency: this.getFieldVal(
          "report_trc_address_currency"
        )
      });
      data.mtime = new Date();
      data.status = this.orders_statuses.indexOf(data.status);
      if (
        !data.organisation ||
        !(await this.model.checkIfMerchantExist({
          organisation: data.organisation
        }))
      ) {
        D.a("Error", "Merchant not exist");
        return false;
      }
      this.disableOrderFieldsOnTransferWithPayments(data.status);
      this.view.down("[action=generate_report]").setDisabled(false);
    });

    this.view.on("save", (el, data) => {
      this.view.down("[name=short_id]").setValue(data.record.short_id);
    });

    this.view.on("statusChanged", async () => {
      me.save(false);
      return true;
    });

    this.view.on("hashSet", async () => {
      await this.setOrderNumber();
      me.save(false);
      return true;
    });

    this.view.on("checkIfOrderHaveTransfers", async () => {
      await this.updateFlagIfOrderHaveTransfers();
      me.save(false);
      return true;
    });

    return this.callParent(arguments);
  },
  getFieldVal(field_name) {
    return this.view.down(`[name=${field_name}]`).getValue();
  },

  copyIdToClipboard() {
    const short_id = this.view.down("[name=short_id]").getValue();
    if (!short_id) {
      return Ext.toast(D.t("Nothing to copy"));
    }
    navigator.clipboard.writeText(short_id);
    return Ext.toast(D.t("ID copied to clipboard"));
  },

  async updateFlagIfOrderHaveTransfers() {
    let has_transfers = await this.model.checkIfOrderHaveTransfers({
      id: this.view.down("[name=id]").getValue()
    });
    return this.view.down("[name=has_transfers]").setValue(has_transfers);
  },

  setOrderFormComponent(xclass, pname) {
    this.view.down("[name=tranche_panel]").removeAll();
    return this.view.down("[name=tranche_panel]").add(
      Ext.create(xclass, {
        scope: this.view,
        pname,
        order_data: this.data
      })
    );
  },

  displayReportButtons(display) {
    this.view.down("[action=generate_report]").setVisible(display);
    this.view.down("[action=generate_admin_report]").setVisible(!display);
    this.view.down("[action=generate_client_report]").setVisible(!display);
  },

  async changePanelAccordingToTheDealType(v) {
    switch (v) {
      case "StartFinal": {
        this.setOrderFormComponent(
          "Crm.modules.orders.view.orderTypes.StartFinal",
          "StartFinal"
        );
        this.view.down("[name=tranche_grid_panel]").setVisible(false);
        this.displayReportButtons(false);
        break;
      }
      case "CardsWithWithdrawalFiat": {
        this.setOrderFormComponent(
          "Crm.modules.orders.view.orderTypes.CardsWithWithdrawalFiat",
          "CardsWithWithdrawalFiat"
        );
        this.view.down("[name=tranche_grid_panel]").setVisible(true);
        this.displayReportButtons(true);
        break;
      }
      case "CardsWithWithdrawal": {
        this.setOrderFormComponent(
          "Crm.modules.orders.view.orderTypes.CardsWithWithdrawal",
          "CardsWithWithdrawal"
        );
        this.view.down("[name=tranche_grid_panel]").setVisible(true);
        this.displayReportButtons(true);
        break;
      }
      case "CryptoFiatWithRate": {
        this.setOrderFormComponent(
          "Crm.modules.orders.view.orderTypes.CryptoFiatWithRate",
          "CryptoFiatWithRate"
        );
        this.view.down("[name=tranche_grid_panel]").setVisible(false);
        this.displayReportButtons(true);
        break;
      }
      case "CryptoFiatWithExchangeRateDelta": {
        this.setOrderFormComponent(
          "Crm.modules.orders.view.orderTypes.CryptoFiatWithExchangeRateDelta",
          "CryptoFiatWithExchangeRateDelta"
        );
        this.view.down("[name=tranche_grid_panel]").setVisible(false);
        this.displayReportButtons(true);
        break;
      }
      case "FiatCryptoWithTariffDelta": {
        this.setOrderFormComponent(
          "Crm.modules.orders.view.orderTypes.FiatCryptoWithTariffDelta",
          "FiatCryptoWithTariffDelta"
        );
        this.view.down("[name=tranche_grid_panel]").setVisible(false);
        this.displayReportButtons(true);
        break;
      }
      case "FiatCryptoWithExchangeRateDelta": {
        this.setOrderFormComponent(
          "Crm.modules.orders.view.orderTypes.FiatCryptoWithExchangeRateDelta",
          "FiatCryptoWithExchangeRateDelta"
        );
        this.view.down("[name=tranche_grid_panel]").setVisible(false);
        this.displayReportButtons(true);
        break;
      }
      // case "CryptoFiatWithTariffDeltaMultipleCurrencies": {
      //   this.setOrderFormComponent(
      //     "Crm.modules.orders.view.orderTypes.CryptoFiatWithTariffDeltaMultipleCurrencies",
      //     "CryptoFiatWithTariffDeltaMultipleCurrencies"
      //   );
      //   this.view.down("[name=tranche_grid_panel]").setVisible(false);
      //   break;
      // }
      default: {
        this.setOrderFormComponent(
          "Crm.modules.orders.view.orderTypes.StartFinal",
          "StartFinal"
        );
        break;
      }
    }
    this.disableOrderFieldsOnTransferWithPayments();
    return;
  },

  prepareAddtitionalWCNOrderData(data) {
    let output_object = {};
    let fields_arr = [];
    fields_arr = this.view
      .down("[name=tranche_panel]")
      .items.items[0].getAdditionalFields();
    for (let key of fields_arr) output_object[key] = data[key];
    return output_object;
  },

  async setValues(data) {
    data = Object.assign(data, data.additional_data);
    if (!data.status) data.status = this.orders_statuses[0];
    else data.status = this.orders_statuses[data.status];
    if (data.organisation && data.organisation.id)
      data.organisation = data.organisation.id;
    if (!data.order_type) data.order_type = "StartFinal";

    let settings = await this.model.getSettings([
      "report_erc_address",
      "report_erc_address_currency",
      "report_trc_address",
      "report_trc_address_currency"
    ]);

    for (let key of Object.keys(settings))
      if (!data[key]) data[key] = settings[key];

    this.data = data;
    await this.disableOrderTypeSelectionIfTranchesExists();
    if (await this.model.checkIfNonAdOrderExists({ id: data.id })) {
      this.view.down("[action=generate_report]").setDisabled(false);
      this.view.down("[action=generate_client_report]").setDisabled(false);
      this.view.down("[action=generate_admin_report]").setDisabled(false);
    }
    this.callParent(arguments);
    this.view.down("[name=tranches_grid]").store.on("datachanged", () => {
      this.view
        .down("[name=tranche_panel]")
        .items.items[0].updateGeneralOrderData();
    });
  },

  async setOrderNumber() {
    if (!this.view.currentData.no)
      this.view.down("[name=no]").setValue(await this.model.getOrderNo());
    return true;
  },

  async disableOrderFieldsOnTransferWithPayments(status = null) {
    if ((status || this.view.currentData.status) == this.orders_statuses[0])
      return;
    let general_order_fields = [
      "merchant",
      "organisation",
      "no",
      "order_type",
      "ctime",
      "status"
    ];
    this.disableFields(this.view, general_order_fields);
    this.view
      .down("[name=tranche_panel]")
      .items.items[0].disableAdditionalOrderFields();
    this.view.down("[action=add_new_tranche]").setDisabled(true);
    return true;
  },

  async checkOrganisation(org_id) {
    if (!org_id) return;
    this.merchant = await this.MerchantModel.getMerchantById({ id: org_id });
    if (this.merchant && this.merchant.id) {
      const res = await this.UserModel.getUserById({
        id: this.merchant.user_id
      });
      this.view.down("[name=merchant]").setValue(res.id);
      if (this.view.currentData.status == this.orders_statuses[0])
        this.view.down("[action=add_new_tranche]").setDisabled(false);
      this.fireEvent("merchantChanged");
    }

    return;
  },

  setTitle: function(data) {
    let types_for_title = {
      CardsWithWithdrawalFiat: D.t("Cards with withdrawal fiat"),
      CardsWithWithdrawal: D.t("Cards with withdrawal"),
      CryptoFiatWithRate: D.t("Crypto-fiat with tariff delta"),
      CryptoFiatWithExchangeRateDelta: D.t(
        "Crypto-fiat with exchange rate delta"
      ),
      FiatCryptoWithTariffDelta: D.t("Fiat-crypto with tariff delta"),
      FiatCryptoWithExchangeRateDelta: D.t(
        "Fiat-crypto with exchange rate delta"
      ),
      StartFinal: D.t("Start/Final")
    };
    data.title_order_type = types_for_title[data.order_type];
    this.callParent(arguments);
  },

  async generateReport(suffix) {
    let me = this;
    let order_data = {
      id: this.view.down("[name=id]").getValue(),
      order_type:
        this.view.down("[name=order_type]").getValue() + (suffix ? suffix : ""),
      merchant: this.view.down("[name=merchant]").getValue()
    };
    if (!this.checkIfObjectValid(order_data))
      return Ext.toast(D.t("Not all data was filled"));
    this.save(false);
    Ext.toast(D.t("Order data was saved"));
    let preview_html_string = await this.model.generateReport(order_data);
    if (!preview_html_string) return Ext.toast(D.t("Generating report error"));
    let field_container = Ext.create("Ext.form.FieldContainer", {
      cls: "details-panel printcontent",
      listeners: {
        boxready: function() {
          Ext.select(
            ".x-autocontainer-innerCt"
          ).selectable(); /*To enable user selection of text*/
        }
      }
    });
    field_container.setData(preview_html_string);
    let report_panel = Ext.create("Ext.window.Window", {
      modal: true,
      layout: "anchor",
      title: D.t("Report preview"),
      height: 600,
      items: [field_container],
      scrollable: {
        y: true
      },
      buttons: [
        {
          text: D.t("Generate PDF"),
          listeners: {
            click: async () => {
              let generation_report_result = await me.model
                .callApi("report-service", "generateReport", {
                  report_name: order_data.order_type,
                  order_id: order_data.id,
                  format: "pdf",
                  get_file_instantly: true,
                  returning: true
                })
                .catch((e) => {
                  return Ext.toast(D.t("Cannot generate report"));
                });
              let a = document.createElement("a");
              a.download = `${generation_report_result.data.filename}.pdf`;
              a.href = `data:application/octet-stream;base64,${generation_report_result.file_data}`;
              return a.click();
            }
          }
        },
        {
          text: D.t("Send via telegram"),
          listeners: {
            click: async () => {
              await me.model
                .callApi("telegram-service", "sendMessage", {
                  message: preview_html_string
                    .replaceAll(/<head>(?:.|\n|\r)+?<\/head>|<[^>]*>/g, "")
                    .replaceAll("&nbsp;", "")
                    .replaceAll(/\n(?!.+[\s\r\n])/g, ""),
                  ref_id: order_data.merchant
                })
                .catch((e) => {
                  return Ext.toast(D.t("Cannot send via telegram"));
                });
              return Ext.toast(D.t("Report sent to tg channel"));
            }
          }
        },
        "->",
        {
          text: D.t("Close"),
          listeners: {
            click: () => {
              report_panel.close();
            }
          }
        }
      ]
    });
    report_panel.show();
    return;
  }
});
