Ext.define("Crm.modules.users.controller.UsersController", {
  extend: "Core.form.FormController",

  setControls: function() {
    this.view.on("beforesave", function(view, data) {
      data.other_configs = {
        need_checker_widget: data.need_checker_widget,
        is_manager: data.is_manager,
        can_change_wallet_status: data.can_change_wallet_status,
        can_change_client_status:data.can_change_client_status,
        tg_create: data.tg_create,
        tg_edit: data.tg_edit,
        tg_delete: data.tg_delete
      };
    });
    this.callParent(arguments);
  },
  setValues(data) {
    if (data.other_configs && Object.keys(data.other_configs).length)
      for (let cfg of Object.keys(data.other_configs))
        data[cfg] = data.other_configs[cfg];
    this.callParent(arguments);
  }
});
