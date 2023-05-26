Ext.define("Crm.modules.currency.view.CurrencyRateValuesGrid", {
  extend: "Core.grid.EditableGrid",

  title: D.t("Currency"),
  iconCls: "x-fa fa-dollar-sign",

  fields: ["code", "abbr", "name"],

  buildColumns: function() {
    return [
      {
        text: D.t("Code"),
        flex: 1,
        sortable: true,
        dataIndex: "code",
        filter: true,
        editor: true
      },
      {
        text: D.t("Abbreviation"),
        flex: 1,
        sortable: true,
        dataIndex: "abbr",
        filter: true,
        editor: true
      },
      {
        text: D.t("Description"),
        flex: 1,
        sortable: true,
        dataIndex: "name",
        filter: true,
        editor: true
      }
    ];
  }
});
