Ext.define("Crm.modules.finance.view.AddGroupForm", {
  extend: "Core.form.FormWindow",
  title: D.t("Add group"),
  iconCls: "x-fa fa-users-cog",
  controllerCls: "Crm.modules.finance.view.AddGroupFormController",
  model: "Crm.modules.finance.model.ReportSettingsModel",

  syncSize() {},
  width: 500,
  height: 250,
  buildItems() {
    let groupCombo = Ext.create("Ext.form.field.ComboBox", {
      name: "group",
      displayField: "legalname",
      valueField: "id",
      fieldLabel: D.t("Group"),
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.accountHolders.model.UsersModel"),
        fieldSet: ["id", "legalname"]
      })
    });
    return {
      xtype: "panel",
      layout: "anchor",
      defaults: { anchor: "100%" },
      items: [
        groupCombo,
        {
          xtype: "dependedcombo",
          name: "company",
          fieldSet: "id,name",
          displayField: "name",
          valueField: "id",
          parentEl: groupCombo,
          parentField: "user_id",
          dataModel: "Crm.modules.merchants.model.MerchantsModel",
          fieldLabel: D.t("Merchant")
        },
        {
          xtype: "combo",
          name: "currency",
          displayField: "abbr",
          valueField: "abbr",
          fieldLabel: D.t("Currency"),
          store: Ext.create("Core.data.ComboStore", {
            dataModel: Ext.create("Crm.modules.currency.model.CurrencyModel"),
            fieldSet: ["abbr"]
          })
        },
        {
          xtype: "combo",
          name: "dir",
          displayField: "dir",
          valueField: "dir",
          fieldLabel: D.t("Directory"),
          store: {
            fields: ["dir"],
            data: [{ dir: "income" }, { dir: "spending" }, { dir: "profit" }]
          },
          value: "profit"
        }
      ]
    };
  },
  buildButtons() {
    let items = this.callParent(arguments);
    items.shift();
    items[1].text = D.t("Save");
    delete items[1].scale;
    items.splice(2, 1);
    return items;
  }
});
