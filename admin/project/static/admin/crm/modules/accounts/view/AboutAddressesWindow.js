Ext.define("Crm.modules.accounts.view.AboutAddressesWindow", {
  extend: "Ext.window.Window",

  modal: true,
  autoShow: true,

  width: 600,
  height: 350,

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
          <p>If you want to create a new address, leave this field empty, the system will create an address.<p>
          <p>If you already have an address, put it in this field to attach it to this merchant.<p>
          <div style="padding-left: 10px">
            <p> - if this address is linked to another merchant, you will not be able to add it</span>
            <p> - if this address is already linked to this merchant, system will not create any duplicates, however some accounts may be created, if missing</p>
            <p> - you can only add addresses that are created within the system here. If you want to import an address from outside the system, contact the system administrator</p>
          </div>
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
