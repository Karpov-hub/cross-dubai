Ext.define("Crm.modules.tariffs.view.VariablesInTariffPanel", {
  extend: "Desktop.core.widgets.GridField",

  mixins: ["Crm.modules.tariffs.view.VariablesFunctions"],
  title: D.t("Variables"),
  xtype: "gridfield",
  hideLabel: true,
  region: "center",
  name: "variables",
  layout: "fit",
  fields: ["key", "value", "descript", "type", "values"],

  types_store_data: [
    { label: "String", value: "string" },
    { label: "Number", value: "number" },
    { label: "Select", value: "select" },
    { label: "Boolean", value: "boolean" },
    { label: "Merchant account", value: "merchant_account" },
    { label: "NIL bank account", value: "nil_bank_account" },
    { label: "Tech account", value: "tech_account" },
    { label: "Multiselect", value: "multiselect" },
    {
      label: "Merchant address and Address book",
      value: "merchant_addr_and_address_book"
    },
    { label: "Merchant address", value: "merchant_address" },
    { label: "Inner client address", value: "inner_client_address" }
  ],

  constructor(cfg) {
    let me = this;
    this.columns = [
      {
        text: D.t("Key"),
        width: 200,
        sortable: true,
        dataIndex: "key",
        menuDisabled: true,
        editor: true
      },
      {
        text: D.t("Value"),
        width: 200,
        sortable: true,
        dataIndex: "value",
        menuDisabled: true,
        editor: true
      },
      {
        text: D.t("Description"),
        flex: 1,
        sortable: false,
        dataIndex: "descript",
        menuDisabled: true,
        editor: true
      },
      {
        text: D.t("Type"),
        flex: 1,
        sortable: false,
        dataIndex: "type",
        editor: {
          xtype: "combo",
          editable: !Ext.platformTags.phone,
          forceSelection: true,
          name: "variable_type",
          displayField: "label",
          valueField: "value",
          store: {
            fields: ["label", "value"],
            data: me.types_store_data
          },
          listeners: {
            change(el, v) {
              me.setEditorForValues(v);
            }
          }
        },
        renderer(v) {
          if (!v) return v;
          let found_el = me.types_store_data.find((el) => {
            return el.value == v;
          });
          return found_el.label || v;
        }
      },
      {
        text: D.t("Values"),
        flex: 1,
        sortable: false,
        dataIndex: "values"
      }
    ];
    this.callParent(arguments);
  },

  buildCellEditing() {
    let rowEditor = this.callParent(arguments);
    rowEditor.onEnterKey = (e) => {
      return false;
    };
    return rowEditor;
  },

  listeners: {
    beforeedit: function(editor, ctx) {
      this.setEditorForValues(ctx.record.data.type);
    }
  },

  async setEditorForValues(type) {
    return this.down("gridcolumn[dataIndex=values]").setEditor(
      await this.buildEditor(type)
    );
  }
});
