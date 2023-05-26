Ext.define("Crm.modules.currency.view.CurrencyRateForm", {
  extend: "Core.form.FormWindow",

  titleTpl: "Currency rate: {name}",
  iconCls: "x-fa fa-list",

  requires: [
    "Core.form.DateField",
    "Ext.form.field.Tag",
    "Desktop.core.widgets.GridField"
  ],

  formLayout: "border",

  formMargin: 0,

  controllerCls: "Crm.modules.currency.view.CurrencyRateFormController",

  buildItems: function() {
    return [
      {
        xtype: "panel",
        region: "west",
        width: "50%",
        split: true,
        layout: "anchor",
        defaults: {
          anchor: "100%",
          xtype: "textfield",
          margin: 5
        },
        items: this.buildFormFields()
      },
      {
        xtype: "panel",
        region: "center",
        layout: "fit",
        items: this.buildValuesGrid()
      }
    ];
  },

  buildFormFields() {
    this.serviceStore = Ext.create("Ext.data.Store", {
      fields: ["code"],
      data: []
    });
    return [
      {
        name: "id",
        hidden: true
      },
      {
        name: "name",
        fieldLabel: D.t("Title")
      },
      {
        name: "service",
        fieldLabel: D.t("Service"),
        xtype: "combo",
        displayField: "code",
        valueField: "code",
        queryMode: "local",
        store: this.serviceStore
      },
      this.buildRealmsMulticombo(),
      {
        name: "ctime",
        xtype: "xdatefield",

        readOnly: true,
        fieldLabel: D.t("Date")
      },
      {
        name: "active",
        xtype: "checkbox",
        fieldLabel: D.t("Activated")
      }
    ];
  },

  buildRealmsMulticombo() {
    return {
      xtype: "tagfield",
      name: "realms",
      valueField: "id",
      displayField: "name",
      queryMode: "local",
      fieldLabel: D.t("For realms"),
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.realm.model.RealmModel"),
        fieldSet: ["id", "name"],
        scope: this
      })
    };
  },

  buildValuesGrid() {
    return {
      xtype: "gridfield",
      region: "west",
      name: "values",

      fields: ["abbr", "amount", "value"],

      columns: [
        {
          text: D.t("Currency abbr"),
          flex: 1,
          sortable: false,
          dataIndex: "abbr",
          menuDisabled: true,
          editor: true
        },
        {
          text: D.t("Amount"),
          flex: 1,
          sortable: false,
          dataIndex: "amount",
          menuDisabled: true,
          editor: true,
          renderer: v => {
            return v ? v : "default";
          }
        },
        {
          text: D.t("Rate"),
          flex: 1,
          sortable: false,
          dataIndex: "value",
          menuDisabled: true,
          editor: true
        }
      ]
    };
  },
  buildButtons() {
    let buttons = this.callParent(arguments);
    buttons.splice(1, 0, {
      action: "getrates",
      text: D.t("Update rates")
    });
    return buttons;
  }
});
