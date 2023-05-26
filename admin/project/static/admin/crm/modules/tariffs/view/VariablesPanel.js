Ext.define("Crm.modules.tariffs.view.VariablesPanel", {
  extend: "Desktop.core.widgets.GridField",

  mixins: ["Crm.modules.tariffs.view.VariablesFunctions"],

  title: D.t("Variables"),
  xtype: "gridfield",
  hideLabel: true,
  region: "center",
  name: "variables",
  layout: "fit",
  fields: ["key", "value", "descript", "type", "values"],

  constructor(cfg) {
    this.changeLog = false;

    this.tariiPlanCombo = cfg.tariiPlanCombo;

    this.model = Ext.create("Crm.modules.tariffs.model.VariablesModel");

    this.merchant_accs_search_params = cfg.merchant_accs_search_params;
    this.client_accs_search_params = cfg.client_accs_search_params;

    this.columns = [
      /*{
        text: D.t("Key"),
        width: 200,
        sortable: false,
        dataIndex: "key",
        menuDisabled: true,
        editor: true
      },*/

      {
        text: D.t("Param"),
        flex: 1,
        sortable: false,
        dataIndex: "key",
        menuDisabled: true,
        editor: this.buildParamCombo(),
        renderer: (v, m, r) => {
          return r.data.descript || v;
        }
      },
      {
        text: D.t("Value"),
        width: 330,
        sortable: false,
        dataIndex: "value",
        menuDisabled: true,
        editor: true
      },
      {
        dataIndex: "type",
        menuDisabled: true,
        hidden: true
      },
      {
        dataIndex: "values",
        menuDisabled: true,
        hidden: true
      }
    ];

    this.callParent(arguments);
  },

  initComponent() {
    this.on("change", (a, b, c) => {
      this.onChange();
    });
    this.callParent(arguments);
  },

  buildParamCombo() {
    let me = this;
    this.varsCombo = Ext.create("Core.form.DependedCombo", {
      anchor: "100%",
      displayField: "descript",
      valueField: "key",
      queryMode: "local",
      parentEl: this.tariiPlanCombo,
      parentField: "tariff_plan",
      dataModel: "Crm.modules.tariffs.model.VariablesModel",
      fieldSet: "key,value,descript,type,values",
      listeners: {
        change(el) {
          if (
            el.lastSelection &&
            el.lastSelection[0] &&
            el.lastSelection[0].data.type
          ) {
            el.lastSelection[0].data.value = null;
            me.setEditorForValue(el.lastSelection[0].data);
          }
        }
      }
    });
    return this.varsCombo;
  },
  listeners: {
    beforeedit: function(editor, ctx) {
      this.setEditorForValue(ctx.record.data);
    }
  },

  onChange() {
    if (this.changeLog) {
      this.changeLog = false;
      return;
    }
    const vars = this.getValue();

    const allKeys = [];
    this.varsCombo.store.each((item) => allKeys.push(item.data.key));

    if (
      this.varsCombo.lastValue &&
      !allKeys.includes(this.varsCombo.lastValue)
    ) {
      return D.a(
        D.t("Info"),
        D.t("The variable has been updated, but it is not in tariff plan")
      );
    }

    let log = false;
    this.varsCombo.store.each((item) => {
      for (let v of vars) {
        if (v.key == item.data.key) {
          v.type = item.data.type;
          v.values = item.data.values;
          if (v.descript != item.data.descript) {
            v.descript = item.data.descript;
            log = true;
          }
          break;
        }
      }
    });
    if (log) {
      this.changeLog = true;
      this.setValue(vars);
    }
  },

  async setEditorForValue(data) {
    let values = [];

    if (data.type == "merchant_account") {
      values = await this.model.getMerchantAccounts({
        merchant_search_params: this.merchant_accs_search_params,
        planCurrency: this.planCurrency
      });
    }

    if ((data.type == "select" || data.type == "multiselect") && data.values) {
      values = data.values.map((el) => ({ value: el }));
    }

    if (data.type == "merchant_addr_and_address_book") {
      values = await this.model.getAddressBookByMerchant({
        client_search_params: this.client_accs_search_params,
        merchant_search_params: this.merchant_accs_search_params,
        internalTransfer: this.internalTransfer,
        planCurrency: this.planCurrency
      });
    }

    if (data.type == "merchant_address") {
      values = await this.model.getMerchantAddresses({
        merchant_search_params: this.merchant_accs_search_params,
        planCurrency: this.planCurrency
      });
    }

    if (data.type == "inner_client_address") {
      values = await this.model.getInnerClientAddresses({
        planCurrency: this.planCurrency
      });
    }

    const editor = await this.buildEditor(data.type, values, data.value);
    return this.down("gridcolumn[dataIndex=value]").setEditor(editor);
  }
});
