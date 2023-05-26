Ext.define("Crm.modules.accountsPlan.view.MerchPlansForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Accounts plan"),

  formLayout: "fit",

  requires: ["Desktop.core.widgets.GridField"],

  formMargin: 0,

  allowImportExport: true,

  controllerCls: "Crm.modules.accountsPlan.view.MerchPlansFormController",

  buildItems() {
    return {
      xtype: "panel",
      layout: "border",
      items: [
        {
          xtype: "fieldcontainer",
          region: "north",
          height: 90,
          padding: 5,
          layout: "anchor",
          defaults: {
            xtype: "textfield",
            anchor: "100%"
          },
          items: [
            {
              name: "id",
              hidden: true
            },

            {
              name: "merchant_id",
              hidden: true
            },
            {
              name: "name",
              fieldLabel: D.t("Plan name")
            },
            this.buildPlanCombo(),
            {
              name: "make_accounts",
              xtype: "checkbox",
              labelWidth: 200,
              fieldLabel: D.t("Сreate missing accounts")
            }
          ]
        },
        {
          xtype: "panel",
          region: "center",
          layout: "fit",
          items: {
            xtype: "gridfield",
            name: "items",
            fields: [
              "descript",
              "acc_no",
              "currency",
              "tag",
              "method",
              "extra"
            ],

            columns: [
              {
                text: D.t("Description"),
                flex: 1,
                sortable: false,
                dataIndex: "descript",
                menuDisabled: true,
                editor: true
              },
              {
                text: D.t("Account"),
                flex: 1,
                sortable: false,
                dataIndex: "acc_no",
                menuDisabled: true,
                editor: true
              },
              {
                text: D.t("Currency"),
                flex: 1,
                sortable: false,
                dataIndex: "currency",
                menuDisabled: true,
                editor: false
              },
              {
                text: D.t("Extra data"),
                flex: 1,
                sortable: false,
                dataIndex: "extra",
                menuDisabled: true,
                editor: true
              },
              {
                text: D.t("Tag"),
                flex: 1,
                sortable: false,
                dataIndex: "tag",
                menuDisabled: true,
                editor: false
              },
              {
                text: D.t("Method"),
                flex: 1,
                sortable: false,
                dataIndex: "method",
                menuDisabled: true,
                editor: false
              }
            ]
          }
        }
      ]
    };
  },

  buildPlanCombo() {
    return Ext.create("Core.form.DependedCombo", {
      valueField: "id",
      displayField: "name",
      displayTpl: Ext.create(
        "Ext.XTemplate",
        '<tpl for=".">',
        "{name}",
        "</tpl>"
      ),
      tpl: Ext.create(
        "Ext.XTemplate",
        '<ul class="x-list-plain"><tpl for=".">',
        '<li role="option" class="x-boundlist-item">{name}</li>',
        "</tpl></ul>"
      ),
      name: "plan_id",
      dataModel: "Crm.modules.accountsPlan.model.PlansModel",
      fieldSet: "id,name,items,description",
      fieldLabel: D.t("Accounts plan")
    });
  }
});
