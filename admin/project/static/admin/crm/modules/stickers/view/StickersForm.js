Ext.define("Crm.modules.stickers.view.StickersForm", {
  extend: "Ext.window.Window",

  autoShow: true,
  modal: true,

  title: D.t("Stickers"),
  layout: "fit",

  width: 1024,
  height: 600,

  initComponent() {
    this.items = {
      xtype: "form",
      layout: "fit",
      items: this.buildItems()
    };

    this.controller = Ext.create(
      "Crm.modules.stickers.view.StickersFormController"
    );

    this.buttons = this.buildButtons();
    this.callParent(arguments);
  },

  buildItems: function() {
    return [this.buildStickersGrid()];
  },

  buildStickersGrid() {
    return {
      xtype: "gridfield",
      region: "west",
      name: "stickers_grid",

      fields: ["ctime", "id", "parent_id", "txt"],

      columns: [
        {
          text: D.t("Date"),
          width: 150,
          sortable: true,
          format: "d.m.Y H:i",
          filter: {
            xtype: "datefield",
            format: "d.m.Y"
          },
          dataIndex: "ctime",
          xtype: "datecolumn",
          renderer: function(val, meta, record) {
            if (val) return Ext.Date.format(new Date(val), "d.m.Y H:i:s");
            return Ext.Date.format(new Date(), "d.m.Y H:i:s");
          }
        },
        {
          text: D.t("Text"),
          flex: 1,
          sortable: true,
          dataIndex: "txt",
          editor: true
        }
      ]
    };
  },

  buildButtons() {
    return [
      {
        iconCls: "x-fa fa-check",
        text: D.t("Save"),
        action: "save_txt"
      },
      "->",
      {
        text: D.t("Close"),
        handler: () => {
          this.close();
        }
      }
    ];
  }
});
