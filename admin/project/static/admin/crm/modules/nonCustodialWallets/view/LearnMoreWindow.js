Ext.define("Crm.modules.nonCustodialWallets.view.LearnMoreWindow", {
  extend: "Ext.window.Window",

  autoShow: true,
  modal: true,
  closable: false,
  resizable: !Ext.platformTags.phone,
  draggable: !Ext.platformTags.phone,

  width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 800,
  height: Ext.platformTags.phone ? Ext.Element.getViewportHeight() : 550,

  title: D.t("About off-system addresses"),
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
          <p> On this page you can: </p>
          <ol>
            <li>Create addresses intended for use outside this system for yourself and third parties and</li>
            <li>get private keys to access them.</li>
          </ol>
          <p> In this regard: </p>
          <ol>
            <li>Using the addresses created here requires a third party app/device, access is granted by sending a private key.</li>
            <li>Our company is not responsible for the funds on the user's address in case of using an insecure application / device or insecure storage of the private key by the user.</li>
            <li>
              The key is sent in parts via two channels in order to reduce the risk of piracy interception of information.
              <p> • The first part of the key will be displayed on this page, it must be copied and, if necessary, transferred to the recipient in any convenient way; the second part of the key is sent by email.</p>
              <p> • If you are creating an address for yourself, enter your email to receive the second part of the key.</p>
              <p> • When creating an address for a third party, only the recipient of the email will have access to the address after communicating to him the first part of the key.</p>
            </li>
            <li> We have retained the ability to send the private key again - to restore access if it is lost. Remember: having a private key gives full access to the address and the funds available on it. We display the date the key was last sent, and you also have the opportunity to make notes on the created addresses in order to reduce the likelihood of an error. We hope the responsible use this feature. </li>
          </ol>
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
