Ext.define("Crm.modules.tariffs.view.actions.InternalMessage", {
  extend: "Ext.form.FieldContainer",

  layout: "anchor",

  defaults: {
    anchor: "100%",
    labelWidth: 150
  },

  initComponent() {
    let me = this;
    this.items = [
      {
        fieldLabel: D.t("To field"),
        aname: "to",
        xtype: "treecombo",
        store: this.scope.internal_receiver_store
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        items: [
          {
            fieldLabel: D.t("Template"),
            xtype: "combo",
            labelWidth: 150,
            flex: 1,
            aname: "tpl",
            displayField: "letter_name",
            valueField: "code",
            store: Ext.create("Core.data.ComboStore", {
              dataModel: Ext.create(
                "Crm.modules.letterTemplates.model.letterTemplatesModel"
              ),
              fieldSet: ["code", "letter_name"],
              scope: this
            })
          },
          {
            xtype: "button",
            text: D.t("Create template"),
            width: 120,
            handler: () => {
              this.makeMailTemplate();
            }
          }
        ]
      },
      {
        xtype: "fieldcontainer",
        layout: "hbox",
        items: [
          {
            fieldLabel: D.t("Extra params"),
            aname: "extra_params",
            labelWidth: 150,
            flex: 1,
            xtype: "textfield",
            validator: (value) => {
              me.scope.down("[action=accept]").setDisabled(false);
              if (
                /\b(CREATE|COLUMN|DATABASE|TABLE|DROP|INSERT|UPDATE|SCHEMA|SET|DO|THEN|RETURN|ALTER)\b|(\/\*)|(\*\/)|(--)/gi.test(
                  value
                )
              ) {
                me.scope.down("[action=accept]").setDisabled(true);
                return D.t("Forbidden word or symbol");
              }
              return true;
            }
          },
          {
            xtype: "button",
            iconCls: "x-fa fa-question-circle",
            action: "check_query",
            style: "cursor: help;",
            width: 30,
            tooltip: D.t(
              "Check 'WHERE' statement.\nNote: Place here conditions from 'where' of SQL-query, e.g. (name = 'John Doe' AND age = 25) OR (country in ('Ohio', 'New York', 'Philadelphia'))"
            ),
            handler: () => {
              this.checkExtraParamQuery();
            }
          }
        ]
      }
    ];
    this.callParent(arguments);
  },

  async checkExtraParamQuery() {
    const where_statement = this.down("[aname=extra_params]").getValue();
    if (!where_statement)
      return Ext.Msg.alert(
        "Error",
        '"Extra params" field is empty. Nothing to check'
      );
    const model = Ext.create("Crm.modules.tariffs.model.TariffsModel");
    let result = await model.checkAdminActionQuery(where_statement);
    if (result.success) return Ext.Msg.alert("Success", "Query is valid");
    return Ext.Msg.alert("Error", result.message);
  },

  makeMailTemplate() {
    const code = this.down("[aname=tpl]").getValue();
    const data = this.scope.dataField.getValue();

    const win = Ext.create(
      "Crm.modules.letterTemplates.view.letterTemplatesForm",
      {
        noHash: true
      }
    );
    win.down("[name=code]").setValue(code);
    win.down("[name=data]").setValue(
      JSON.stringify(
        {
          code,
          body: data
        },
        null,
        4
      )
    );
  }
});
