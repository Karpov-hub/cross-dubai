Ext.define("Crm.modules.telegram.view.LearnMoreWindow", {
  extend: "Ext.window.Window",

  modal: true,
  autoShow: true,

  width: 800,
  height: 550,

  title: D.t("How to use telegram apps"),
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
            Ext.select(".x-autocontainer-innerCt").selectable();
          }
        },
        data: {},
        tpl: `
        <div style="padding: 10px">
          <p>How to use: </p>
          <ol>
            <li>Go to <a target="_blank" href="https://my.telegram.org/apps">Telegram app configuration</a> and create new telegram app. Fill in the required fields: App title, Short name (be careful about the "App title" and "Short name" values. "Short name" should be alpha-numeric, so don't use spaces), Description and select Platform <b>Desktop</b></li>
            <li>Copy <b>api_id</b> and <b>api_hash</b></li>
            <li>Press <b>Add</b> button and fill the form</li>
            <li>Next, open the form again and click the <b>Login</b> button</li>
            <li>Get OTP in your telegram and enter on the form that will open after clicking on the <b>Login</b> button</li>
          </ol>
          <p><b>IMPORTANT NOTE:</b> If you have two-factor authentication enabled, then you definitely need to fill in the <b>Password</b> field, otherwise leave it blank</p>
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
