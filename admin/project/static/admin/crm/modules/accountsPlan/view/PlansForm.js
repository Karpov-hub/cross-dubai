Ext.define("Crm.modules.accountsPlan.view.PlansForm", {
  extend: "Core.form.FormWindow",

  titleTpl: D.t("Accounts plan: {name}"),

  formLayout: "fit",

  requires: ["Desktop.core.widgets.GridField"],

  formMargin: 0,

  allowImportExport: true,

  buildItems() {
    return {
      xtype: "tabpanel",
      layout: "fit",
      items: [
        this.buildGeneral(),
        this.buildVars(),
        this.buildTagsPanel()
        //, this.buildAlgoPanel()
      ]
    };
  },

  buildGeneral() {
    return {
      xtype: "panel",
      title: D.t("Plan settings"),
      layout: "border",
      items: [
        {
          xtype: "fieldcontainer",
          region: "north",
          height: 120,
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
              name: "name",
              fieldLabel: D.t("Plan Name")
            },
            {
              name: "description",
              fieldLabel: D.t("Description")
            },
            {
              xtype: "tagfield",
              name: "tags",
              fieldLabel: D.t("Tags"),
              valueField: "name",
              displayField: "name",
              queryMode: "local",
              store: Ext.create("Core.data.ComboStore", {
                dataModel: Ext.create(
                  "Crm.modules.accountsPlan.model.TagsModel"
                ),
                fieldSet: ["name"],
                scope: this
              })
            }
            /*{
              name: "method_amount",
              fieldLabel: D.t("API method for calculating amounts")
            }*/
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
              "condition",
              "extra",
              "method"
            ],

            columns: [
              {
                text: D.t("Description"),
                flex: 1,
                sortable: false,
                dataIndex: "descript",
                menuDisabled: true,
                editor: this.buildPlanDescriptionCombo()
              },
              {
                text: D.t("Account"),
                flex: 1,
                sortable: false,
                dataIndex: "acc_no",
                menuDisabled: true,
                editor: this.buildAccountVariableCombo()
              },
              {
                text: D.t("Currency"),
                flex: 1,
                sortable: false,
                dataIndex: "currency",
                menuDisabled: true,
                editor: this.buildCurrencyCombo()
              },
              {
                text: D.t("Extra param"),
                flex: 1,
                sortable: false,
                dataIndex: "extra",
                menuDisabled: true,
                editor: this.buildExtraVariableCombo()
              },
              {
                text: D.t("Condition"),
                flex: 1,
                sortable: false,
                dataIndex: "condition",
                menuDisabled: true,
                editor: true
              },
              {
                text: D.t("Tag"),
                flex: 1,
                sortable: false,
                dataIndex: "tag",
                menuDisabled: true,
                editor: true
              },
              {
                text: D.t("Method"),
                flex: 1,
                sortable: false,
                dataIndex: "method",
                menuDisabled: true,
                editor: true
              }
            ]
          }
        }
      ]
    };
  },

  buildPlanDescriptionCombo() {
    return Ext.create("Core.form.DependedCombo", {
      anchor: "100%",
      valueField: "descript",
      displayField: "descript",
      dataModel: "Crm.modules.accountsPlan.model.PlansDescriptModel",
      fieldSet: "descript"
    });
  },

  buildAccountVariableCombo() {
    return Ext.create("Core.form.DependedCombo", {
      anchor: "100%",
      valueField: "acc_no",
      displayField: "acc_no",
      dataModel: "Crm.modules.accountsPlan.model.PlansAccVarModel",
      fieldSet: "acc_no"
    });
  },

  buildExtraVariableCombo() {
    return Ext.create("Core.form.DependedCombo", {
      anchor: "100%",
      valueField: "extra",
      displayField: "extra",
      dataModel: "Crm.modules.accountsPlan.model.PlansExtraVarModel",
      fieldSet: "extra"
    });
  },

  buildCurrencyCombo() {
    return {
      name: "currency",
      xtype: "combo",
      editable: false,
      queryMode: "local",
      displayField: "abbr",
      valueField: "abbr",
      store: Ext.create("Core.data.ComboStore", {
        dataModel: Ext.create("Crm.modules.currency.model.CurrencyModel"),
        fieldSet: ["abbr"],
        scope: this,
        sorters: [{ property: "abbr", direction: "asc" }]
      })
    };
  },

  buildVars() {
    return {
      xtype: "panel",
      title: D.t("Variables"),
      region: "center",
      layout: "fit",
      items: {
        xtype: "gridfield",
        name: "variables",
        fields: ["key", "value", "descript"],

        columns: [
          {
            text: D.t("Name"),
            width: 150,
            sortable: false,
            dataIndex: "key",
            menuDisabled: true,
            editor: true
          },
          {
            text: D.t("Value"),
            width: 200,
            sortable: false,
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
          }
        ]
      }
    };
  },
  buildTagsPanel() {
    return {
      xtype: "panel",
      title: D.t("Accounts plans tags"),
      iconCls: "x-fa fa-list-ul",
      layout: "fit",
      items: [
        Ext.create("Crm.modules.accountsPlan.view.TagsGrid", {
          scope: this,
          iconCls: null,
          title: null
        })
      ]
    };
  },

  buildAlgoPanel() {
    return {
      xtype: "panel",
      title: D.t("Amount calculator code"),
      layout: "fit",
      items: {
        xtype: "textarea",
        name: "algo_amount",
        value: `// Available variables
// amount_src - source amount
// currency_src - source currency
// amount_dst - distination amount
// currency_dst - distination currency
// tariff_variables
        `
      }
    };
  }
});
