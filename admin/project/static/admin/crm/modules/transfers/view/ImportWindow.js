Ext.define("Crm.modules.transfers.view.ImportWindow", {
  extend: "Core.grid.ImportWindow",

  buildItems: function() {
    return [
      Ext.create("Ext.form.field.File", {
        //xtype: 'fileuploadfield',
        name: "file",
        anchor: "100%",
        labelWidth: 170,
        fieldLabel: D.t("Choose a file for import")
      }),
      this.buildOnlyFiatCurrencyCombo(),
      this.buildBanksCombo(),
      {
        name: "rows_to_skip",
        xtype: "numberfield",
        minValue: 0,
        labelWidth: 170,
        anchor: "100%",
        fieldLabel: D.t("Rows to skip")
      }
    ];
  },

  buildOnlyFiatCurrencyCombo() {
    return {
      xtype: "combo",
      name: "currency",
      flex: 1,
      labelWidth: 170,
      anchor: "100%",
      fieldLabel: D.t("Currency"),
      valueField: "abbr",
      displayField: "abbr",
      allowBlank: false,
      store: {
        fields: ["abbr"],
        data: [{ abbr: "EUR" }, { abbr: "USD" }]
      }
    };
  },

  buildBanksCombo(parent) {
    return {
      xtype: "dependedcombo",
      valueField: "id",
      displayField: "bank_name",
      name: "bank",
      queryMode: "local",
      dataModel: "Crm.modules.banks.model.DirectoryBanksModel",
      fieldSet: "id,bank_name",
      fieldLabel: D.t("Bank name"),
      labelWidth: 170,
      width: 478,
      allowBlank: false
    };
  },

  callback(res) {
    Ext.create("Crm.modules.orders.view.PreDepositWindow", {
      rows: res.rows,
      bank_conf: res.bank_conf,
      file_name: res.file_name,
      currency: res.currency
    });
    this.close();
  }
});

Ext.define("Crm.modules.transfers.view.ImportResultWindow", {
  extend: "Ext.window.Window",

  modal: true,
  autoShow: true,

  width: 600,
  height: 400,

  tpl: `
  <div style="padding: 10px">
  <p>
  Complited: <span class="provided">{provided}</span>;
  Skipped: <span class="skipped">{skipped}</span>;
  Errors: <span class="deposit_errors">{deposit_errors}</span>
  </p>
  <tpl if="no_deposits">
  <p>There are no deposits in the uploaded file</p>
  </tpl>
  <tpl if="existsRows.length">
  <h3>Exists transfers</h3>
  <tpl for="existsRows">
  {html}
  </tpl></tpl>
  <tpl if="noOrderRows.length">
  <h3>Orders are not found for transfers</h3>
  <tpl for="noOrderRows">
  {html}
  </tpl></tpl>
  <tpl if="depositErrorRows.length">
  <h3>Errors on deposit</h3>
  <tpl for="depositErrorRows">
  {html}
  </tpl></tpl>
  </div>
  `,

  title: D.t("Import data result"),
  layout: "fit",

  initComponent() {
    this.buttons = this.buildButtons();
    this.items = {
      xtype: "form",
      layout: "fit",

      items: this.buildItems()
    };
    this.callParent(arguments);
  },

  fillData(data) {
    this.down("[action=datapanel]").setData(data);
  },

  buildItems: function() {
    return [
      {
        xtype: "panel",
        //padding: 10,
        action: "datapanel",
        cls: "details-panel printcontent",
        scrollable: true,
        listeners: {
          boxready: function() {
            Ext.select(
              ".x-autocontainer-innerCt"
            ).selectable(); /*To enable user selection of text*/
          }
        },
        tpl: this.tpl
      }
    ];
  },

  buildButtons() {
    return [
      {
        text: D.t("Unfulfilled deposits"),
        handler: () => {
          let link = document.createElement("a");
          link.setAttribute(
            "href",
            "#Crm.modules.depositImports.view.depositImportsGrid"
          );
          link.click();
          this.close();
        }
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

Ext.define("Crm.modules.view.CheckboxModel", {
  override: "Ext.selection.CheckboxModel",
  getHeaderConfig: function() {
    return Ext.apply(this.callParent(arguments), {
      header: "Invisible",
      width: 80,
      mode: "MULTI"
    });
  }
});

Ext.define("Crm.modules.orders.view.PreDepositWindow", {
  extend: "Ext.window.Window",

  modal: true,
  autoShow: true,

  width: 1250,
  height: 620,

  syncSize: function() {},

  title: D.t("Details"),

  requires: ["Desktop.core.widgets.GridField"],

  initComponent() {
    this.buttons = this.buildButtons();

    this.columns = [];
    this.fields = [];

    if (this.rows && this.rows.length) {
      for (const key of Object.keys(this.rows[0])) {
        this.columns.push({
          text: D.t(key),
          flex: 1,
          sortable: false,
          dataIndex: key,
          menuDisabled: true,
          editor: ["Betrag ()", "Betrag"].includes(key)
            ? {
                xtype: "numberfield"
              }
            : true
        });
        this.fields.push(key);
      }
    }

    this.columns.push({
      text: D.t("Description"),
      flex: 1,
      sortable: false,
      dataIndex: "description",
      menuDisabled: true,
      editor: true
    });
    this.fields.push("description");

    this.items = {
      xtype: "panel",
      layout: "anchor",
      defaults: {
        xtype: "textfield",
        anchor: "100%"
      },
      items: this.buildItems()
    };

    this.model = Ext.create("Crm.modules.transfers.model.TransfersModel");

    this.callParent(arguments);

    this.down("grid").setStore({ data: this.rows, fields: this.fields });
  },

  buildItems: function() {
    return [this.buildGrid()];
  },

  buildGrid() {
    return {
      xtype: "gridfield",
      region: "center",
      name: "auto_deposits",
      layout: "fit",
      split: true,
      fields: this.fields,
      height: 600,
      columns: this.columns,
      disableRemoveAction: true,
      buildTbar() {},
      gridCfg: {
        selModel: {
          type: "checkboxmodel",
          showHeaderCheckbox: false,
          checkOnly: true
        }
      }
    };
  },

  buildButtons() {
    return [
      "->",
      {
        text: "Confirm",
        id: "confirm_btn",
        handler: async () => {
          let out = [];

          this.down("grid")
            .getStore()
            .each((item) => {
              item.data = Object.keys(item.data)
                .filter((key) => key !== "id")
                .reduce((obj, key) => {
                  obj[key] = item.data[key];
                  return obj;
                }, {});
              item.data.show_to_client = "on";
              out.push(item.data);
            });

          const sel = this.down("grid")
            .getSelectionModel()
            .getSelected()
            .items.map((item) => {
              item.data.show_to_client = false;
              return item.data;
            });

          const res = await this.model.importDataFromGrid({
            rows: out,
            bank_conf: this.bank_conf,
            file_name: this.file_name,
            currency: this.currency
          });

          this.down("[id=confirm_btn]").setDisabled(true);

          Ext.create(
            "Crm.modules.transfers.view.ImportResultWindow",
            {}
          ).fillData(res);

          this.close();
        }
      },
      "-",
      {
        text: D.t("Close"),
        handler: () => {
          this.close();
        }
      }
    ];
  }
});
