Ext.define(
  "Crm.modules.systemNotifications.view.systemNotificationsFormController",
  {
    extend: "Core.form.FormController",

    mixins: ["Crm.modules.systemNotifications.view.DatesFunctions"],

    setControls() {
      this.control({
        "[action=open_letter_templates_form]": {
          click: async (el) => {
            let letter_template = this.view
              .down("[name=letter_template]")
              .getValue();
            if (
              !letter_template ||
              !Object.keys(
                await this.model.getLetterTemplate(letter_template, el.value)
              ).length
            )
              return this.openLetterTemplatesForm(el.value);
            return D.a("Error", "Template already exist");
          }
        },
        "[name=letter_template]": {
          change(el, v) {
            if (v)
              this.view
                .down("[name=edit_letter_template_menu]")
                .setVisible(true);
            try {
              if (
                el.lastSelection &&
                el.lastSelection[0] &&
                el.lastSelection[0].data
              ) {
                this.buildDataFieldsPanel(
                  JSON.parse(el.lastSelection[0].data.data).body,
                  this.view.down("[name=lang]").getValue()
                );
              }
            } catch (e) {
              console.log(e);
              D.a(
                "Cannot generate body fields",
                "Corrupted data in letter template"
              );
            }
          }
        },
        "[action=edit_letter_template]": {
          click: async (el) => {
            this.openLetterTemplatesForm(
              el.value,
              this.view.down("[name=letter_template]").getValue()
            );
          }
        },
        "[action=show_preview_window]": {
          click: async () => {
            this.showPreview();
          }
        },
        "[name=lang]": {
          change: (el, v) => {
            let saved_data = this.view.down("[name=data]").getValue();
            try {
              saved_data = JSON.parse(saved_data)[lang];
              this.buildDataFieldsPanel(saved_data, v);
            } catch (e) {
              try {
                let selector = this.view.down("[name=letter_template]");
                if (selector.getValue()) {
                  if (
                    selector.lastSelection &&
                    selector.lastSelection[0] &&
                    selector.lastSelection[0].data
                  ) {
                    this.buildDataFieldsPanel(
                      JSON.parse(selector.lastSelection[0].data.data).body,
                      v
                    );
                  }
                }
              } catch (e) {
                console.log(e);
                D.a(
                  "Cannot generate body fields",
                  "Corrupted data in letter template"
                );
              }
            }
          }
        },
        "[action=warn_and_save]": {
          click: () => {
            let me = this;
            let parsed_original_form_data = null;
            let form = this.view.down("form").getForm();
            if (!form.isValid()) return;
            try {
              if (this.view.originalFormData)
                parsed_original_form_data = JSON.parse(
                  this.view.originalFormData
                );
              parsed_original_form_data.active =
                parsed_original_form_data.hasOwnProperty("active") &&
                parsed_original_form_data.active == "on"
                  ? true
                  : false;
            } catch (e) {}
            form = form.getValues();
            this.showSaveWarning(D.t("Saving warning"), (btn) => {
              if (btn === "yes") {
                if (form.date_from && form.date_to)
                  Ext.toast(
                    D.t(
                      "Notification is saved and will be active according to schedule"
                    ),
                    D.t("Message")
                  );
                if (!form.date_from && !form.date_to && form.active)
                  Ext.toast(D.t("Notification is activated"), D.t("Message"));
                if (
                  parsed_original_form_data &&
                  !!parsed_original_form_data.active &&
                  me.view.down("[name=active]").getValue() !=
                    parsed_original_form_data.active
                ) {
                  me.model.callApi(
                    "auth-service",
                    "removeSystemNotifications",
                    {
                      parent_id: me.view.down("[name=id]").getValue()
                    }
                  );
                }
                this.save(true);
              }
            });
          }
        },
        "[name=title]": {
          validityChange: (el, valid) => {
            this.view.down("[action=warn_and_save]").setDisabled(!valid);
          }
        },
        "[action=send_mail_notification]": {
          click: () => {
            let form = this.view.down("form").getForm();
            if (!form.isValid()) return;
            this.showSaveWarning(D.t("Sending warning"), (btn) => {
              if (btn === "yes") {
                this.save(false, () => {
                  this.sendMessageToRecipient();
                });
              }
            });
          }
        },
        "[name=date_from]": {
          change: (el, v) => {
            this.showSendNotificationToTheEmail();
            let active_field = this.view.down("[name=active]");
            let date_to_field = this.view.down("[name=date_to]");
            active_field.setValue(false);
            active_field.setDisabled(!!v);
            date_to_field.allowBlank = !v;
            date_to_field.setMinValue(
              new Date(new Date(v).getTime() + 3600000)
            );
          }
        },
        "[name=date_to]": {
          change: (el, v) => {
            this.showSendNotificationToTheEmail();
            this.view.down("[name=date_from]").setMaxValue(v);
          }
        },
        "[name=active]": {
          change: (el, v) => {
            this.showSendNotificationToTheEmail();
            let date_from_field = this.view.down("[name=date_from]");
            if (
              (this.original_data ||
                (this.original_data.active != v && v === false)) &&
              !date_from_field.getValue()
            ) {
              this.view.down("[name=mail_sent]").setValue(false);
              this.changeMailButtons(false);
            }
            date_from_field.setDisabled(!!v);
          }
        }
      });
      this.view.on("beforesave", async (el, data) => {
        if (!data.date_from) data.date_from = null;
        if (!data.date_to) data.date_to = null;
        data.data = JSON.parse(data.data);
      });
      this.view.on("save", async () => {
        await this.model.updateData();
      });
      this.filterLettersTemplatesStore();
      return this.callParent(arguments);
    },
    showSaveWarning(title, cb) {
      return Ext.Msg.show({
        title,
        message: D.t("Are you sure you have configured all language versions?"),
        icon: Ext.Msg.QUESTION,
        buttons: Ext.Msg.YESNO,
        fn: cb
      });
    },
    showSendNotificationToTheEmail(data) {
      let isVisible = false;
      if (!data)
        data = {
          date_from: this.view.down("[name=date_from]").getValue(),
          active: this.view.down("[name=active]").getValue()
        };
      if (
        !data.date_from &&
        data.active &&
        !this.view.down("[name=mail_sent]").getValue()
      )
        isVisible = true;
      return this.view
        .down("[action=send_mail_notification]")
        .setVisible(isVisible);
    },

    async sendMessageToRecipient() {
      let data = this.view
        .down("form")
        .getForm()
        .getValues();
      await this.model.callApi("auth-service", "sendMessageToRecipients", {
        letter_data: {
          id: data.id,
          code: data.letter_template,
          data: data.data
        },
        source: "admin",
        notifications_for_activation: [data.id]
      });
      data.sent = true;
      this.view.down("[name=mail_sent]").setValue(true);
      this.changeMailButtons(true);
      await this.model.updateNotificationDeliveringStatus(data);
    },
    changeMailButtons(visible) {
      this.view.down("[name=delivering_status]").setVisible(visible);
      this.showSendNotificationToTheEmail();
    },

    filterLettersTemplatesStore() {
      let store = this.view.down("[name=letter_template]").getStore();
      if (!store) return;
      store.on("load", () => {
        let store_data = store.getData().items;
        if (!store_data) return;
        store_data = store_data.map((el) => el.data);
        this.view
          .down("[name=letter_template]")
          .getStore()
          .setData(
            store_data.filter(
              (el, idx) =>
                el.type === 0 &&
                el.lang === "en" &&
                idx === store_data.map((el) => el.code).indexOf(el.code)
            )
          );
      });
    },

    async showPreview() {
      let data = await this.getDataForPreview();
      let preview_form = Ext.create(
        "Crm.modules.systemNotifications.view.previewForm",
        {
          name: "preview_form"
        }
      );
      preview_form.show();
      preview_form.setData(data);
    },

    async getDataForPreview() {
      let data = {};
      let data_fields_panel = this.view.down("[name=data_fields_panel]");
      for (let field of data_fields_panel.items.items)
        data[field.name.substring(1)] = field.value;
      let letter_template = await this.model.getLetterTemplate(
        this.view.down("[name=letter_template]").getValue(),
        this.view.down("[name=lang]").getValue()
      );
      if (!letter_template) return `<p>Data not found</p>`;

      let res = await this.model.callApi("mail-service", "preview", {
        tpl: letter_template.html,
        data: { body: data }
      });
      if (res && res.html) {
        return res.html;
      }
      return `<p>Data not found</p>`;
    },

    async openLetterTemplatesForm(lang, code = "") {
      let form_data = {
        external_call: true,
        type: 0,
        lang,
        callback: (code, data, lang) => {
          this.view.down("[name=letter_template]").setValue(code);
          try {
            this.buildDataFieldsPanel(JSON.parse(data).body, lang);
          } catch (e) {
            console.log(e);
            D.a(
              "Cannot generate body fields",
              "Corrupted data in letter template"
            );
          }
        }
      };
      if (code) {
        let template = await this.model.getLetterTemplate(
          code,
          lang.toLowerCase()
        );
        if (!template.id) {
          D.a("Error", "Letter template with this language does not exist");
          return;
        }
        form_data.recordId = template.id;
      }
      Ext.create(
        "Crm.modules.letterTemplates.view.letterTemplatesForm",
        form_data
      ).show();
    },

    buildDataFieldsPanel(external_data, lang) {
      let data_structure = this.view.down("[name=letter_template]");
      if (
        data_structure.lastSelection &&
        data_structure.lastSelection[0] &&
        data_structure.lastSelection[0].data
      )
        data_structure = JSON.parse(data_structure.lastSelection[0].data.data)
          .body;

      let data = {};
      for (let key of Object.keys(data_structure))
        data[key] = external_data[key];
      let existed_data = {};
      try {
        existed_data = JSON.parse(this.view.down("[name=data]").getValue());
        if (existed_data[lang])
          for (let key of Object.keys(existed_data[lang])) {
            if (data.hasOwnProperty(key)) data[key] = existed_data[lang][key];
          }
      } catch (e) {
        console.log(e);
        existed_data = {};
      }
      existed_data[lang] = data;
      this.view.down("[name=data]").setValue(JSON.stringify(existed_data));

      let data_fields_panel = this.view.down("[name=data_fields_panel]");
      while (data_fields_panel.items.items[0])
        data_fields_panel.remove(data_fields_panel.items.items[0]);
      let fields_array = [];

      const transformKey2Name = (key) => {
        key = key.replace("_", " ");
        return `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      };
      let me = this;

      if (data)
        for (let key of Object.keys(data)) {
          let xtype =
            typeof data[key] == "number" ? "numberfield" : "textfield";
          fields_array.push({
            xtype,
            name: `_${key}`,
            value: data[key],
            fieldLabel: transformKey2Name(key),
            listeners: {
              change: async (el, v) => {
                if (me.view.down("[name=preview_form]"))
                  me.view
                    .down("[name=preview_form]")
                    .setData(await me.getDataForPreview());
                let data = JSON.parse(me.view.down("[name=data]").getValue());
                data[lang][key] = v;
                me.view.down("[name=data]").setValue(JSON.stringify(data));
              }
            }
          });
        }
      data_fields_panel.add(fields_array);
    },

    setValues(data) {
      data.data = JSON.stringify(data.data || {});
      data.lang = "en";
      if (data.date_from) data.date_from = this.addTimestamp(data.date_from);
      if (data.date_to) data.date_to = this.addTimestamp(data.date_to);

      this.original_data = {};
      if (data.active) this.original_data.active = data.active;
      if (data.mail_sent) this.original_data.mail_sent = data.mail_sent;
      this.callParent(arguments);
      this.showSendNotificationToTheEmail(data);
      if (!data.date_to && !data.date_from && data.active)
        this.changeMailButtons(data.mail_sent);
    }
  }
);
