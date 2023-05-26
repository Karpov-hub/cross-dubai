Ext.define("Crm.modules.finance.model.DashboardModel", {
  extend: "Core.data.DataModel",

  collection: "dashboard_settings",
  idField: "id",
  removeAction: "remove",
  strongRequest: true,

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "pid",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "width",
      type: "string",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "height",
      type: "string",
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "indx",
      type: "int",
      sort: 1,
      filterable: false,
      editable: true,
      visible: true
    },
    {
      name: "settings",
      type: "ObjectID",
      filterable: false,
      editable: true,
      visible: true
    }
  ],

  /* scope:client */
  addDashboard(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("addDashboard", data, resolve);
    });
  },

  /* scope:server */
  async $addDashboard(data, cb) {
    const maxRec = await this.src.db.query(
      "SELECT max(indx) as indx FROM dashboards WHERE user_id=$1",
      [this.user.id]
    );
    let indx = maxRec && maxRec[0] ? maxRec[0].indx || 0 : 0;
    indx++;

    const insData = {
      id: this.src.db.createObjectId(),
      user_id: this.user.id,
      name: data.title,
      indx
    };

    await this.src.db.collection("dashboards").insert(insData);

    cb(insData);
  },

  /* scope:client */
  getDashboards() {
    return new Promise((resolve, reject) => {
      this.runOnServer("getDashboards", {}, resolve);
    });
  },

  /* scope:server */
  async $getDashboards(data, cb) {
    const res = await this.src.db.query(
      "SELECT * FROM dashboards WHERE user_id=$1 ORDER BY indx",
      [this.user.id]
    );
    cb({
      list: res.map(item => {
        item.settings = [];
        return item;
      })
    });
  },

  /* scope:client */
  removeDashboard(id) {
    return new Promise((resolve, reject) => {
      this.runOnServer("removeDashboard", { id }, resolve);
    });
  },

  /* scope:server */
  async $removeDashboard(data, cb) {
    const res = await this.src.db.collection("dashboards").remove({
      user_id: this.user.id,
      id: data.id
    });
    cb({
      success: res && res.rowCount === 1
    });
  },

  /* scope:client */
  getMetrics(id) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getMetrics", { id }, resolve);
    });
  },

  /* scope:server */
  async $getMetrics(data, cb) {
    const res = await this.src.db.query(
      "SELECT s.id, s.width, s.height, f.name, f.gtype, f.description, f.accounts, f.duration, f.currency, f.status_pending, f.status_approved, f.status_canceled, f.status_refund  FROM dashboard_settings s, finance_settings f WHERE s.pid=$1 and s.settings = f.id ORDER BY s.indx",
      [data.id]
    );
    cb({
      list: res
    });
  }
});
