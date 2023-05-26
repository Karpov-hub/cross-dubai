Ext.define("Crm.modules.support.view.CommentGridController", {
  extend: "Core.grid.GridController",

  setControls() {
    this.control({
      "[action=attach]": {
        click: (el, v) => {
          this.showHideAttachment();
        }
      },
      "[action=send]": {
        click: (el, v) => {
          this.send();
        }
      }
    });
    this.callParent(arguments);
  },

  // показать/скрыть панель аттача
  showHideAttachment() {
    if ((this.shoAttach = !this.shoAttach)) this.view.attachPanel.show();
    else this.view.attachPanel.hide();
  },

  gotoRecordHash() {}, // переопределяем эту функцию, что бы при двойном клике не переходило к редактированию

  async send() {
    const data = {
      ticket_id: this.view.observeObject.ticket_id,
      sender: localStorage.uid,
      message: this.view.down("[name=message]").getValue(),
      files: this.view.down("[name=files]").getValue(),
      realm_id: this.view.scope.down("[name=realm_id]").getValue(),
      is_user_message: false
    };
    if (data.ticket_id && (data.message || data.files.length)) {
      const res = await this.model.callApi(
        "support-service",
        "createComment",
        data,
        data.realm_id,
        localStorage.uid
      );
      this.view.store.reload();
      this.view.down("[name=message]").setValue("");
    }
  }
});
