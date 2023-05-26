const FileProvider = require("@lib/fileprovider").default;
const config = require("@lib/config");

Ext.define("Crm.classes.DataModel", {
  extend: "Core.data.DataModel",
  mixins: ["Crm.classes.AdminLogs"],

  async $callApi(data, cb) {
    const permis = await this.getPermissions();

    if (!permis.add && !permis.modify)
      return cb({ success: false, message: "Access denied" });

    const res = await this.callApi(data);
    if (res) cb(res);
    else cb({ success: false });
  },

  async getDefaultRealm() {
    const realm = await this.src.db
      .collection("realms")
      .findOne({ admin_realm: true }, { id: 1 });
    return realm ? realm.id : null;
  },

  async callApi(data) {
    if (!data.realm) data.realm = await this.getDefaultRealm();

    if (data.data && data.data.files && Ext.isArray(data.data.files)) {
      data.data.files = await this.prepareFiles(data.data.files);
    }
    const resultData = await this.doJob(
      data.service,
      data.method,
      data.data,
      data.realm,
      data.user
    );
    this.logPush(data, resultData);

    if (resultData.error) return resultData;

    if (resultData) {
      if (data.data && data.data.files)
        await FileProvider.accept(data.data.files);
      return resultData;
    } else {
      if (data.data && data.data.files)
        await this.removeTemplatedFiles(data.data.files);
    }
    return null;
  },

  async prepareFiles(files) {
    let fileData,
      out = [];
    try {
      for (let i = 0; i < files.length; i++) {
        fileData = await FileProvider.push(
          files[i],
          config.new_file_hold_timeout || 300
        );
        if (fileData && fileData.success) {
          out.push({
            name: files[i].name,
            code: fileData.code,
            size: fileData.size
          });
        }
      }
    } catch (e) {
      console.log("e:", e);
      this.error("FILEUPLOADERROR");
    }
    return out;
  },

  async removeTemplatedFiles(files) {
    for (let i = 0; i < files.length; i++) {
      await FileProvider.del(files[i].data);
    }
  },

  async doJob(service, method, data, realmId, userId) {
    const Queue = require("@lib/queue");
    const res = await Queue.newJob(service, {
      method,
      data,
      realmId,
      userId,
      scope: "admin"
    });
    return res;
  },

  async $getDefaultRealm(params, cb) {
    let res = await this.src.db.collection("realms").findOne({
      admin_realm: true
    });
    cb(res ? res.id : {});
  },

  $updateGridData(data, cb) {
    if (!Array.isArray(data.model_name)) data.model_name = [data.model_name];
    for (let model_name of data.model_name)
      this.changeModelData(model_name, "ins", {});
    return cb({ success: true });
  }
});
