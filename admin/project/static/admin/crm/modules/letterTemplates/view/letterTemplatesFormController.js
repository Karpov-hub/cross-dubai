Ext.define("Crm.modules.letterTemplates.view.letterTemplatesFormController", {
  extend: "Core.form.FormController",

  init() {
    this.callParent(arguments);
    if (this.view.config.external_call) {
      this.view.onActivate = () => {};
      this.view.onClose = () => {};
      this.view.down("[action=apply]").setVisible(false);
    }
  },
  setControls() {
    this.control({
      "[name=html]": {
        change: () => {
          this.changeHtml();
        }
      }
    });

    this.view.previewPanel.on("activate", () => {
      setTimeout(() => {
        this.buildPreview();
      }, 1000);
    });
    this.view.on("save", () => {
      if (this.view && this.view.callback) {
        let form = this.view
          .down("form")
          .getForm()
          .getValues();
        return this.view.callback(form.code, form.data, form.lang);
      }
    });
    this.callParent(arguments);
  },

  changeHtml() {
    if (this.tout) clearTimeout(this.tout);
    this.tout = setTimeout(() => {
      this.buildPreview();
    }, 2000);
  },

  async buildPreview() {
    const data = this.view.down("form").getValues();
    if (!data.html || !data.data) return;
    const res = await this.model.callApi("mail-service", "preview", {
      tpl: data.html,
      data: JSON.parse(data.data)
    });
    if (res && res.html) {
      this.view.previewPanel
        .getEl()
        .down("iframe", true).contentWindow.document.body.innerHTML = res.html;
    }
  },

  setValues(data) {
    if (data && data.realm) data.realm = data.realm.id;
    console.log(data);
    if (this.view.config.type || this.view.config.type === 0) {
      data.type = this.view.config.type;
      data.lang = this.view.config.lang;
      this.view.down("[name=lang]").setReadOnly(true);
      this.view.down("[name=type]").setReadOnly(true);
    }
    this.callParent(arguments);
  }
});
