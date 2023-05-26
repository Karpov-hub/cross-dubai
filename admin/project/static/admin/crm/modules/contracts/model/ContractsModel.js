Ext.define("Crm.modules.contracts.model.ContractsModel", {
  extend: "Crm.classes.DataModel",

  idField: "id",

  collection: "contracts",

  fields: [
    {
      name: "owner_id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "contract_id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "name",
      type: "string",
      sort: 1,
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "description",
      sort: 1,
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "code",
      sort: 1,
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "status",
      sort: 1,
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "contract_date",
      sort: 1,
      type: "datetime",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "expiration_date",
      sort: 1,
      type: "datetime",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      sort: 1,
      type: "datetime",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "mtime",
      sort: 1,
      type: "datetime",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "contract_subject",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "director_name",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "director_name_history",
      type: "array",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "memo",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "automatic_renewal",
      type: "bool",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "tariff",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "variables",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "other_signatories",
      type: "object",
      filterable: true,
      editable: true,
      visible: true
    }
  ],

  getData(data, cb) {
    this.collection = "vw_orgs_contract";
    this.dbCollection = this.src.db.collection("vw_orgs_contract");
    this.callParent(arguments);
  },

  /* scope:clinet */
  async getMerchantOrganization(data, cb) {
    this.runOnServer("getMerchantOrganization", data, cb);
  },
  /* scope:server */
  async $getMerchantOrganization(data, cb) {
    let res = await this.src.db
      .collection("vw_orgs_contract")
      .findOne(
        { id: data.id, owner_id: { $ne: data.owner_id } },
        { owner_id: 1 }
      );
    if (!res) return cb({});
    let user = await this.src.db
      .collection("merchants")
      .findOne({ id: res.owner_id }, { user_id: 1 });
    return cb({ org_id: res.owner_id, user_id: user.user_id });
  },

  /* scope:client */
  async getRealmByRealmOrgOwner(data, cb) {
    this.runOnServer("getRealmByRealmOrgOwner", data, cb);
  },

  /* scope:server */
  async $getRealmByRealmOrgOwner(data, cb) {
    return cb(
      await this.src.db
        .collection("realmdepartments")
        .findOne({ id: data.owner_id })
    );
  },

  /* scope:client */
  async getRealm(data, cb) {
    this.runOnServer("getRealm", data, cb);
  },

  /* scope:server */
  async $getRealm(data, cb) {
    let org = await this.src.db
      .collection("merchants")
      .findOne({ id: data.owner_id }, { user_id: 1 });
    return cb(
      await this.src.db
        .collection("users")
        .findOne({ id: org.user_id }, { id: 1, realm: 1 })
    );
  },

  /* scope:client */
  getRealmOrganization(data, cb) {
    this.runOnServer("getRealmOrganization", data, cb);
  },

  /* scope:server */
  async $getRealmOrganization(data, cb) {
    let res = await this.src.db
      .collection("vw_orgs_contract")
      .findOne(
        { id: data.id, owner_id: { $ne: data.owner_id } },
        { owner_id: 1 }
      );
    return cb(res ? res : {});
  },

  /* scope:client */
  updateGrid() {
    return new Promise((resolve, reject) => {
      this.runOnServer("updateGrid", {}, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  $updateGrid(data, cb) {
    this.changeModelData(
      "Crm.modules.contracts.model.ContractsModel",
      "ins",
      {}
    );
    cb({ result: true });
  },

  /* scope:server */
  async beforeRemove(data, cb) {
    this.src.db.query(
      "UPDATE account_contracts SET removed=1 where owner_id = $1",
      [data[0]],
      (err, resp) => {
        if (err) {
          console.error("ContractsModel.js fn : beforeRemove, error: ", err);
          return cb([]);
        }
        cb(data);
      }
    );
  }
});
