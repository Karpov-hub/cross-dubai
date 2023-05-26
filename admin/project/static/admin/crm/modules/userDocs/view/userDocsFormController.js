Ext.define("Crm.modules.userDocs.view.userDocsFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=formclose]": {
        click: () => {
          this.closeView();
        }
      },
      "[action=apply]": {
        click: () => {
          this.save();
        }
      },
      "[action=downloadFile]": {
        click: () => {
          this.downloadFile();
        }
      },
      "[name=type]": {
        change: (e, v) => {
          if (this.view.down("[name=status]").getValue() && v) {
            this.view.down("[action=apply]").setDisabled(false);
          }
        }
      },
      "[name=status]": {
        change: (e, v) => {
          if (this.view.down("[name=type]").getValue() && v) {
            this.view.down("[action=apply]").setDisabled(false);
          }
        }
      },
      "[name=name]": {
        change: (e, v) => {
          if (v != null) {
            this.view.down("[action=downloadFile]").setVisible(true);
          }
        }
      }
    });
  },
  setValues: function(data) {
    if (window.__CB_REC__) {
      Ext.apply(data, __CB_REC__);
      window.__CB_REC__ = null;
      this.view.s = true;
    }
    data = {
      id: data.id || null,
      user_id: data.user_id || null,
      name: data.name || null,
      doc_code: data.doc_code || null,
      type: data.type || null,
      status: data.status || null
    };

    this.view.currentData = data;
    let form = this.view.down("form");
    this.view.fireEvent("beforesetvalues", form, data);
    form.getForm().setValues(data);
    this.view.fireEvent("setvalues", form, data);
  },
  async save() {
    let me = this;
    me.model = Ext.create("Crm.modules.userDocs.model.userDocsModel", {
      scope: this
    });

    let formData = me.view
      .down("form")
      .getForm()
      .getValues();
    me.model.runOnServer("checkIfDocumentExist", formData, async function(res) {
      if (res) {
        if (!formData.files[0]) {
          formData.files.push({
            name: res.name || null,
            code: res.doc_code || null
          });
          await me.model.runOnServer("updateDocument", formData, function(r) {
            me.view.close();
          });
        } else {
          await me.model.callApi(
            "auth-service",
            "updateDocument",
            formData,
            null,
            formData.user_id
          );
          me.view.close();
        }
      } else {
        await me.model.callApi(
          "auth-service",
          "uploadDocument",
          formData,
          null,
          formData.user_id
        );
        me.view.close();
      }
    });
  },
  async downloadFile() {
    let me = this;
    let formData = me.view
      .down("form")
      .getForm()
      .getValues();
    let code = formData.doc_code;
    let link = document.createElement("a");
    link.setAttribute(
      "href",
      window.location.protocol +
        "//" +
        window.location.hostname +
        "/download/" +
        code
    );
    link.click();
  }
});
