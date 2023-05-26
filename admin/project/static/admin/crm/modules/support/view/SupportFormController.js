Ext.define("Crm.modules.support.view.SupportFormController", {
  extend: "Core.form.FormController",

  setControls: function() {
    this.control({
      "[action=resolve_ticket]": {
        click: (el) => {
          this.changeStatus(1);
        },
      },
      "[action=close_ticket]": {
        click: (el) => {
          this.changeStatus(2);
        },
      },
      "[action=formclose]": {
        click: (el) => {
          this.changeNew();
        },
      },
      "[action=open_user_profile]": {
        click: (el) => {
          this.openProfile();
        },
      },
    });
    this.callParent(arguments);
  },

  changeStatus: function(status) {
    const data = this.view.down("form").getValues();
    data.status = status;
    data.new = 1;
    this.model.write(data, () => {
      this.closeView();
    });
  },

  changeNew: function() {
    const data = this.view.down("form").getValues();
    data.new = 1;
    this.model.write(data, () => {
      this.closeView();
    });
  },
  openProfile: function() {
    var me = this;
    var e = document.createElement("a");
    const data = this.view.down("form").getValues();
    e.setAttribute(
      "href",
      "/admin/#Crm.modules.accountHolders.view.UsersForm~" + data.user_id + ""
    );
    e.setAttribute("target", "_blank");
    e.click();
  },
});
