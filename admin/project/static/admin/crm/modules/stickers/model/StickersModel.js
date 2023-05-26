Ext.define("Crm.modules.stickers.model.StickersModel", {
  extend: "Crm.classes.DataModel",

  collection: "stickers",
  idField: "id",
  removeAction: "remove",

  fields: [
    {
      name: "id",
      type: "ObjectID",
      visible: true
    },
    {
      name: "parent_id",
      type: "ObjectID",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "txt",
      type: "string",
      filterable: true,
      editable: true,
      visible: true
    },
    {
      name: "ctime",
      type: "date",
      filterable: true,
      editable: true,
      visible: true,
      sort: -1
    }
  ],

  /* scope:client */
  async getAllStickers(data) {
    return new Promise((resolve, reject) => {
      this.runOnServer("getAllStickers", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $getAllStickers(data, cb) {
    let res = await this.src.db
      .collection("stickers")
      .findAll({ parent_id: data.parent_id });
    if (res && res.length) return cb(res);
    else return cb([]);
  },

  /* scope:client */
  async saveStickers(data, cb) {
    return new Promise((resolve, reject) => {
      this.runOnServer("saveStickers", data, (res) => {
        resolve(res);
      });
    });
  },

  /* scope:server */
  async $saveStickers(data, cb) {
    let uuid = require("uuid/v4");

    let stickersData = [];

    for (const sticker of data.stickers) {
      if (!sticker.ctime)
        stickersData.push({
          id: uuid(),
          parent_id: sticker.parent_id,
          txt: sticker.txt,
          ctime: new Date(),
          mtime: new Date(),
          maker: this.user.id,
          removed: 0
        });
      else stickersData.push(sticker);
    }

    try {
      if (!data.stickers.length)
        await this.src.db
          .collection("stickers")
          .remove({ parent_id: data.parent_id });

      if (data.removedStickers && data.removedStickers.length)
        await this.src.db
          .collection("stickers")
          .remove({ id: { $in: data.removedStickers } });

      for (const sticker of stickersData) {
        let oldsticker = await this.src.db.collection("stickers").findOne({
          id: sticker.id
        });

        if (!oldsticker) {
          await this.src.db.collection("stickers").insert(sticker);
        } else {
          await this.src.db.collection("stickers").update(
            {
              id: sticker.id
            },
            {
              $set: sticker
            }
          );
        }
      }
    } catch (error) {
      cb(false);
    }

    cb(true);
  }
});
