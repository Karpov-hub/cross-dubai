Ext.define("Crm.modules.stickers.view.StickersFormController", {
  extend: "Core.form.FormController",

  setControls() {
    this.control({
      "[action=save_txt]": {
        click: () => {
          this.saveStickers();
        }
      }
    });

    this.model = Ext.create("Crm.modules.stickers.model.StickersModel");
    this.callParent(arguments);
  },

  async saveStickers() {
    const stickersGrid = this.view.down("[name=stickers_grid]");
    const removedStickers = stickersGrid.store.removed.map((item) => item.id);
    let stickersGridData = stickersGrid.getValue();

    for (const sticker of stickersGridData) {
      if (!sticker.parent_id) {
        sticker.parent_id = this.view.scope.recordId;
      }
    }

    let res = await this.model.saveStickers({
      stickers: stickersGridData,
      removedStickers,
      parent_id: this.view.scope.recordId
    });

    if (res) return D.a("Change stickers", "Success");
    return D.a("Error", "Something went wrong");
  },

  async afterDataLoad(data, cb) {
    const stickersGrid = this.view.down("[name=stickers_grid]");

    stickersGrid.setLoading(true);

    const stickers = await this.model.getAllStickers({
      parent_id: this.view.scope.recordId
    });

    stickersGrid.setValue(stickers);
    stickersGrid.setLoading(false);

    cb(data);
  }
});
