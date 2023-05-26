Ext.define("Crm.modules.tariffs.view.actions.Message", {
  extend: "Ext.form.FieldContainer",

  layout: "anchor",

  defaults: {
    anchor: "100%",
    labelWidth: 150
  },

  initComponent() {
    this.items = [
      {
        fieldLabel: D.t("To field"),
        aname: "to",
        xtype: "treecombo",
        store: this.scope.to_store
      },
      {
        fieldLabel: D.t("Subject"),
        aname: "subject",
        xtype: "textfield"
      },
      // {
      //   xtype: "combo",
      //   fieldLabel: D.t("Channel"),
      //   aname: "channel",
      //   displayField: "channel",
      //   valueField: "channel",
      //   store: {
      //     fields: ["channel"],
      //     data: [
      //       { channel: "email" },
      //       { channel: "telegram" }
      //     ]
      //   }
      // },
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
            listeners: {
              change: (el, v) => {
                //this.down("[aname=text]").setDisabled(!!v);
              }
            },
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
      } /*,
      {
        fieldLabel: D.t("Text"),
        aname: "text",
        xtype: "textarea",
        height: 120
      }*/
    ];
    this.callParent(arguments);
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
