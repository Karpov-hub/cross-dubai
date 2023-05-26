Ext.define("Crm.modules.clientRoles.view.ClientRolesFormController", {
  extend: "Core.form.FormController",

  async setControls() {
    this.control({
      "[name=is_default]": {
        change: async () => {
          await this.checkOtherDefaultRoles();
        }
      }
    });
    await this.getPermissionsFromConfig();
    this.callParent(arguments);
  },

  async getPermissionsFromConfig() {
    let client_permissions = await this.model.getPermissionsFromConfig();
    let permissions = client_permissions.ui_screens.map((el) => ({
      boxLabel: D.t(el.title),
      name: "permissions",
      inputValue: el.link
    }));
    let other_permissions = client_permissions.other_permissions.map((el) => {
      let key = Object.keys(el)[0];
      return {
        boxLabel: D.t(el[key]),
        name: "other_permissions",
        inputValue: key
      };
    });
    this.view.down("[name=available_permissions]").add(permissions);
    this.view.down("[name=available_other_permissions]").add(other_permissions);
  },

  async checkOtherDefaultRoles() {
    let role = await this.model.checkIfCanSetDefault({
      id: this.view.down("[name=id]").getValue()
    });
    if (!role.allowed_to_set_default) {
      this.view.down("[name=is_default]").setValue(false);
      return D.a(
        "Cannot set role as default",
        "Uncheck previos role if you need to set this role as default"
      );
    }
    return { success: true };
  },

  save: async function(closewin, cb) {
    let me = this,
      form = me.view.down("form").getForm(),
      data = {};
    me.view.originalFormData = me.getStringifyFormData();
    let sb1 = me.view.down("[action=save]");

    if (sb1 && !!sb1.setDisabled) sb1.setDisabled(true);

    if (form) data = form.getValues();

    if (!Array.isArray(data.permissions)) data.permissions = [data.permissions];
    if (!Array.isArray(data.other_permissions))
      data.other_permissions = [data.other_permissions];
    let setButtonsStatus = function() {
      if (sb1 && !!sb1.setDisabled) sb1.setDisabled(false);
    };

    if (me.view.fireEvent("beforesave", me.view, data) === false) {
      setButtonsStatus();
      return;
    }
    me.model.write(data, function(data, err) {
      setButtonsStatus();
      if (err) {
        me.showErrorMessage(err); //win, err)
        return;
      }
      if (me.view.fireEvent("save", me.view, data) === false) {
        if (!!cb) cb(data);
        return;
      }
      if (closewin && !!me.view.close) me.view.close();

      if (!!cb) cb(data);
    });
  }
});
