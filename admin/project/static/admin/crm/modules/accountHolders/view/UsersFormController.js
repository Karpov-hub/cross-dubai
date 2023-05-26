Ext.define("Crm.modules.accountHolders.view.UsersFormController", {
  extend: "Core.form.FormControllerWithConfirmActive",

  setControls() {
    this.control({
      "[action=formclose]": {
        click: () => {
          this.closeView();
        }
      },
      "[action=remove]": {
        click: () => {
          this.deleteRecord_do(true);
        }
      },
      "[name=trigger]": {
        change: (el, v) => {
          this.onTriggerChange(v);
        }
      },
      "[action=balance_currency]": {
        change: (el, v) => {
          this.showBalance(v);
        }
      },
      "[action=apply]": {
        click: () => {
          this.saveUser(false);
        }
      },
      "[action=save]": {
        click: () => {
          this.saveUser(true);
        }
      },
      "[action=send_pass]": {
        click: () => {
          this.sendTempPass({}, (res) => {
            D.a(
              "Temporary password",
              "The letter was sent to the specified e-mail. If Client have not received your email, please request again."
            );
          });
        }
      },
      "[action=debt_report]": {
        click: () => {
          this.generateDebtReport();
        }
      },
      "[action=accounts_addresses_panel]": {
        afterrender: () => {
          this.showBalance("EUR");
        }
      },
      "[action=get_session]": {
        click: () => {
          this.loginInClient();
        }
      }
    });
    // this.callParent(arguments);
  },
  rolesStoreLoaded: false,
  setDefaultClientRole() {
    let store_roles_combo = this.view.down("[name=role]").getStore();
    if (!this.rolesStoreLoaded && !this.view.down("[name=role]").getValue())
      store_roles_combo.on("load", (el, recs) => {
        let default_role = recs.find((el) => {
          return el.data.is_default == true;
        });
        this.view.down("[name=role]").setValue(default_role);
        this.rolesStoreLoaded = true;
      });
  },
  sendTempPass(data, cb) {
    let formData = this.view
      .down("form")
      .getForm()
      .getValues();
    this.model.sendTempPassToUser(formData, cb);
  },

  validateForm() {
    let items = this.view
      .down("form")
      .getForm()
      .getFields().items;
    let arrWithEmptyFieldLabels = [];
    for (let item of items) {
      if (
        item &&
        item.config &&
        typeof item.config["allowBlank"] !== "undefined"
      )
        if (!!!item.config.allowBlank && !!!item.value)
          arrWithEmptyFieldLabels.push(
            item.config.fieldLabel ? item.config.fieldLabel : item.fieldLabel
          );
    }
    return arrWithEmptyFieldLabels.length == 0
      ? true
      : D.a(
          "Error",
          `Following fields are required: ${arrWithEmptyFieldLabels}`
        );
  },

  async saveUser(needClose, cb) {
    if (this.validateForm()) {
      let data = this.view
        .down("form")
        .getForm()
        .getValues();
      data._admin_id = localStorage.getItem("uid");

      if (data.blocked && data.blocked === "on") {
        await this.model.callApi("auth-service", "closeUserSessions", {
          user_id: data.id
        });
      }

      this.model.checkUserExitst(data, (res) => {
        this.model.checkUsersLogin(data, (checkRes) => {
          if (!checkRes.haveUserWithSuchLogin) {
            this.save(false, async () => {
              if (!res.userExists) {
                this.sendTempPass({});
                return this.bindManagerToTheUser(data, needClose);
              }
              if (needClose) return this.view.close();
            });
          } else D.a("Error", "User with such email already exist");
        });
      });
    }
  },

  async bindManagerToTheUser(data) {
    let creator = await this.model.callServerMethod("getAdminProfile"),
      me = this;
    if (creator.other_configs.is_manager)
      return await this.model.callServerMethod("bindCreatorAsManager", {
        client_id: data.id,
        admin_id: creator._id
      });

    let managers_window = Ext.create("Ext.window.Window", {
      title: D.t("Bind to managers"),
      height: Ext.platformTags.phone ? Ext.Element.getViewportHeight() : 400,
      width: Ext.platformTags.phone ? Ext.Element.getViewportWidth() : 600,
      layout: "fit",
      modal: true,
      resizable: false,
      closable: false,
      draggable: !Ext.platformTags.phone,
      items: [
        {
          name: "managers_grid",
          xtype: "grid",
          store: {
            fields: ["_id", "name", "login"],
            data: await me.model.callServerMethod("getManagers")
          },
          columns: [
            {
              text: D.t("Manager"),
              dataIndex: "_id",
              flex: 1,
              renderer(v, m, r) {
                return r.data.name || r.data.login;
              }
            },
            {
              text: D.t("Bind"),
              dataIndex: "bind",
              flex: 1,
              xtype: "checkcolumn"
            }
          ]
        }
      ],
      buttons: [
        {
          text: D.t("Save"),
          iconCls: "x-fa fa-check-square",
          handler: () => {
            me.saveManagers(managers_window, data.id);
            if (needClose) {
              me.view.close();
            }
            managers_window.close();
          }
        },
        {
          text: D.t("Close"),
          iconCls: "x-fa fa-ban",
          handler: () => {
            managers_window.close();
          }
        }
      ]
    }).show();
    return managers_window;
  },

  saveManagers(view, client_id) {
    let store = view.down("[name=managers_grid]").getStore();
    if (!store || !store.data.items.length) return;
    let binded_managers = store.data.items
      .map((el) => el.data)
      .filter((el) => el.bind);
    this.model.callServerMethod("bindManagers", {
      managers: binded_managers,
      client_id
    });
    Ext.toast("Success");
    return view.close();
  },

  async setValues(data) {
    if (data && data.realm) data.realm = data.realm.id;
    if (!data.hasOwnProperty("activated")) data.activated = true;
    data.type = 0;
    if (this.view.routeId == "Crm.modules.accountHolders.view.ActiveUsersForm")
      data.type = 1;
    let profile = await this.model.callServerMethod("getAdminProfile");
    if (profile.other_configs)
      this.view
        .down("[name=activated]")
        .setVisible(profile.other_configs.can_change_client_status);

    if (!data.communication_lang) data.communication_lang = "en";
    let realm_id = await this.model.getDefaultRealm();
    this.view.down("[name=realm]").setValue(realm_id);

    this.callParent(arguments);
    this.setTelegramComponent(data.id, data.legalname);
    this.setDefaultClientRole();
  },

  setTelegramComponent(id, name) {
    return this.view.down("[name=tg_container_placement]").add(
      Ext.create("Crm.modules.telegram.view.TelegramChannelComponent", {
        ref_id: this.view.recordId || id,
        user_id: this.view.recordId || id,
        title: `Cross ${name}`
      })
    );
  },

  showBalance(currency) {
    this.model.getBalance(
      this.view.down("[name=id]").getValue(),
      currency,
      (res) => {
        this.view.down("[action=total_balance]").setText(res);
      }
    );
  },

  async generateDebtReport() {
    const realm_id = await this.model.getDefaultRealm();
    const user_id = this.view.currentData.id;

    let report = await this.model.callApi(
      "report-service",
      "generateReport",
      {
        report_name: "debt_report",
        client_id: user_id
      },
      realm_id,
      user_id
    );

    if (report && !report.success) {
      this.down("[id=confirm_btn]").setDisabled(false);
      return D.a(
        "Error",
        report.error ||
          "Something went wrong, please try again or contact admin"
      );
    }
    let link = document.createElement("a");
    link.setAttribute("href", `${__CONFIG__.downloadFileLink}/${report.code}`);
    link.click();
  },

  async loginInClient() {
    const result = await this.model.callApi("auth-service", "getUserSession", {
      user_id: this.view.currentData.id
    });
    const url_to_ui = await this.model.getUIUrl();

    let link = document.createElement("a");
    link.setAttribute("href", `${url_to_ui}/auth/?atoken=${result.token}`);
    link.setAttribute("target", "_blank");
    link.click();
  }
});
