Ext.define("Crm.modules.files.view.FilesFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=downloadFile]": {
        click: () => {
          this.downloadFile();
        }
      }
    });

    this.callParent(arguments);
  },

  async prepareSaveObject(formData, inp) {
    const obj = {
      id: this.view.recordId,
      owner_id: this.view.scope.scope.down("[name=id]").getValue(), //owner_id,
      name: formData.name,
      files: inp.fileInputEl.dom.files,
      type: formData.type
    };
    return obj;
  },
  async save(action, cb) {
    let inp = this.view.down("[name=file]");
    let formData = this.view
      .down("form")
      .getForm()
      .getValues();

    if (inp.fileInputEl.dom.files.length > 0) {
      var p = Ext.create("Ext.ProgressBar", {
        layout: "hbox",
        height: 100,
        width: 300,
        name: "progressBarPanel"
      });

      // Wait for 5 seconds, then update the status el (progress bar will auto-reset)
      p.wait({
        interval: 500, //bar will move fast!
        duration: 50000,
        increment: 15,
        text: "Updating...",
        scope: this,
        fn: function() {
          p.updateText("Done!");
        }
      });

      let progressBar = Ext.create({
        xtype: "window",
        layout: "hbox",
        height: 100,
        width: 300,
        name: "progressBarPanel",
        items: [
          Ext.create("Ext.ProgressBar", {
            renderTo: Ext.getBody(),
            width: 300
          }).wait({
            interval: 100,
            duration: 60000,
            increment: 15,
            text: "Uploading...",
            scope: this,
            fn: function() {
              p.updateText("Something went wrong!");
            }
          })
        ]
      });

      progressBar.show();

      const data = await this.prepareSaveObject(formData, inp);

      let res = await this.model.callApi(
        "merchant-service",
        "uploadFile",
        data,
        formData.user_id,
        formData.realm
      );
      if (res && res.success) {
        this.view.scope.fireEvent("reloadGrid");
        if (progressBar) progressBar.close();
        this.view.close();
      }
    } else {
      let ins = {
        id: this.view.recordId,
        name: formData.name
      };
      await this.model.updateCustomFileName(ins);
      this.view.scope.fireEvent("reloadGrid");
      this.view.close();
    }
  },

  setValues(data) {
    if (window.__CB_REC__) {
      Ext.apply(data, __CB_REC__);
      window.__CB_REC__ = null;
      this.view.s = true;
    }
    data.owner_id = this.view.scope.observeObject.owner_id;
    this.model.getRealm(data, (res) => {
      if (res && res.realm && res.id) {
        data.user_id = res.id;
        data.realm = res.realm;
      }
      this.model.getRealmOrganization(data, (orgRes) => {
        if (orgRes && orgRes.owner_id)
          data.realm_organization = orgRes.owner_id;
        this.view.currentData = data;
        var form = this.view.down("form");
        this.view.fireEvent("beforesetvalues", form, data);
        form.getForm().setValues(data);
        this.view.fireEvent("setvalues", form, data);
      });
    });
  }
});
