Ext.define("Crm.modules.clientRoles.model.ClientRolesModel", {
  extend: "Crm.classes.DataModel",

  collection: "client_roles",
  idField: "id",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "is_default",
      type: "boolean",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "permissions",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "other_permissions",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  checkIfCanSetDefault(data) {
    return new Promise((resolve) => {
      this.runOnServer("checkIfCanSetDefault", { id: data.id }, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $checkIfCanSetDefault(data, cb) {
    let res = await this.src.db.collection("client_roles").findOne(
      {
        id: { $ne: data.id },
        is_default: true
      },
      { id: 1 }
    );
    return cb({ allowed_to_set_default: res && res.id ? false : true });
  },

  /* scope:client */
  getPermissionsFromConfig(data) {
    return new Promise((resolve) => {
      this.runOnServer("getPermissionsFromConfig", {}, (res) => {
        return resolve(res);
      });
    });
  },

  /* scope:server */
  async $getPermissionsFromConfig(data, cb) {
    return cb({
      ui_screens: this.config.ui_screens,
      other_permissions: this.config.other_permissions
    });
  }
});
