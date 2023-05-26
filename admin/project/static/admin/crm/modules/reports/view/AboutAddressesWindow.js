Ext.define("Crm.modules.reports.view.AboutAddressesWindow", {
  extend: "Ext.window.Window",

  modal: true,
  autoShow: true,

  width: 500,
  height: 250,

  title: D.t("About address field"),
  layout: "fit",

  initComponent() {
    this.buttons = this.buildButtons();
    this.items = {
      xtype: "form",
      layout: "fit",
      items: this.buildItems()
    };

    this.callParent(arguments);
  },

  buildItems: function() {
    return [
      {
        xtype: "panel",
        scrollable: true,
        action: "datapanel",
        cls: "details-panel printcontent",
        scrollable: true,
        listeners: {
          boxready: function() {
            Ext.select(
              ".x-autocontainer-innerCt"
            ).selectable(); /*To enable user selection of text*/
          }
        },
        data: {},
        tpl: `
        <div style="padding: 10px">
          <p>Provide the system address to get the report with its data.<p>
          <p>Leave the address field empty and choose the currency to get the aggregate report for all system addresses in this currency.<p>
        </div>`
      }
    ];
  },

  buildButtons() {
    return [
      {
        text: D.t("Close"),
        handler: () => {
          this.close();
        }
      }
    ];
  }
});
