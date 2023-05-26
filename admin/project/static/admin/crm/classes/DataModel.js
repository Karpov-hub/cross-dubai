Ext.define("Crm.classes.DataModel", {
  extend: "Core.data.DataModel",

  callServerMethod(method, data={}) {
    return new Promise((resolve, reject) => {
      try {
        this.runOnServer(method, data, resolve);
      } catch (e) {
        reject(e);
      }
    });
  },

  callApi(service, method, data, realm, user) {
    return new Promise(async (resolve, reject) => {
      this.do_callApi(service, method, data, realm, user, resolve, reject);
    });
  },

  async do_callApi(service, method, data, realm, user, resolve, reject) {
    if (!Glob.ws) {
      setTimeout(() => {
        this.do_callApi(service, method, data, realm, user, resolve, reject);
      }, 1000);
      return;
    }

    if (data.files) {
      data.files = await this.filesToBase64(data.files);
    }

    this.runOnServer(
      "callApi",
      { service, method, data, realm, user },
      (res) => {
        if (res.result) resolve(res.result);
        else resolve(res);
      }
    );
  },

  async filesToBase64(files) {
    let out = [];
    for (let file of files) {
      out.push(await this.fileToBase64(file));
    }
    return out;
  },

  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () =>
        resolve({
          name: file.name,
          data: reader.result
        });
      reader.onerror = (error) => reject(error);
    });
  },

  async getDefaultRealm(params, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getDefaultRealm", {}, resolve);
    });
  }
});
