"use strict";
module.exports = (sequelize, DataTypes) => {
  const sticker = sequelize.define(
    "sticker",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      parent_id: DataTypes.UUID,
      txt: DataTypes.TEXT,

      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      signobject: DataTypes.JSON,
      removed: DataTypes.INTEGER
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  sticker.associate = function(models) {
    // associations can be defined here
  };
  return sticker;
};
