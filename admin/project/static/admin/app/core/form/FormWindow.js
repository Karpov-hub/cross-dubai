Ext.define("Core.form.FormWindow", {
  extend: "Core.window.Window",

  formMargin: "10",
  formLayout: "anchor",

  requires: [
    "Ext.tab.Panel",
    "Ext.layout.container.Border",
    "Ext.form.field.ComboBox",
    "Ext.form.field.Number",
    "Ext.form.FieldContainer"
  ],

  stickerable: true,

  initComponent: function() {
    if (this.controllerCls) {
      this.controller = Ext.create(this.controllerCls);
    } else if (!this.controller)
      this.controller = Ext.create("Core.form.FormController");

    if (this.stickerable) {
      this.setStickerBtn();
    }

    this.buttons = this.buildButtons();
    this.items = this.buildForm();
    this.callParent(arguments);
  },

  setStickerBtn() {
    this.header = {
      titlePosition: 0,
      title: "title",
      items: [
        {
          xtype: "button",
          margin: "0 10 0 0",
          text: "Stickers",
          name: "sticker_btn",
          hidden: true,
          handler: () => {
            Ext.create("Crm.modules.stickers.view.StickersForm", {
              scope: this
            });
          }
        }
      ]
    };
  },

  buildButtons: function() {
    var btns = [
      {
        tooltip: D.t("Remove this record"),
        iconCls: "x-fa fa-trash-alt",
        action: "remove"
      },
      "->"
    ];
    if (!Ext.platformTags.phone)
      btns.push({
        text: D.t("Save and close"),
        iconCls: "x-fa fa-check-square",
        scale: "medium",
        action: "save"
      });
    btns.push(
      {
        text: D.t("Save"),
        iconCls: Ext.platformTags.phone ? null : "x-fa fa-check",
        action: "apply"
      },
      "-",
      {
        text: D.t("Close"),
        iconCls: Ext.platformTags.phone ? null : "x-fa fa-ban",
        action: "formclose"
      }
    );
    if (this.allowCopy)
      btns.splice(1, 0, {
        tooltip: Ext.platformTags.phone ? "" : D.t("Make a copy"),
        iconCls: "x-fa fa-copy",
        action: "copy"
      });

    if (this.allowImportExport) {
      btns.splice(1, 0, "-", {
        text: D.t("Export/Import"),
        menu: [
          {
            text: Ext.platformTags.phone ? "" : D.t("Export to file"),
            xtype: "button",
            margin: 5,
            action: "exportjson"
          },
          {
            xtype: "filefield",
            buttonOnly: true,
            margin: 5,
            action: "importjson",
            buttonConfig: {
              text: D.t("Import from file"),
              width: "100%"
            }
          }
        ]
      });
    }

    return btns;
  },

  buildForm: function() {
    return {
      xtype: "form",
      layout: this.formLayout,
      margin: this.formMargin,
      defaults: {
        xtype: "textfield",
        anchor: "100%",
        labelWidth: 150
      },
      items: this.buildAllItems()
    };
  },

  buildAllItems: function() {
    var items = this.buildItems();

    if (!Ext.isArray(items)) items = [items];

    items.push({
      name:
        this.controller &&
        this.controller.model &&
        this.controller.model.idField
          ? this.controller.model.idField
          : "_id",
      hidden: true
    });

    return items;
  },

  buildItems: function() {
    return [];
  },

  addSignButton: function(signobject) {
    var bPanel = this.getDockedItems('toolbar[dock="bottom"]');
    if (bPanel && bPanel[0]) {
      bPanel[0].insert(
        0,
        Ext.create("Core.sign.SignButton", {
          parentView: this,
          signobject: signobject
        })
      );
      bPanel[0].insert(1, "-");
    }
  }
});
