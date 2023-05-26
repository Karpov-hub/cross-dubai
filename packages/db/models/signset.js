"use strict";
module.exports = (sequelize, DataTypes) => {
  const signset = sequelize.define(
    "signset",
    {
      _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      module: DataTypes.STRING(255),
      realm: DataTypes.UUID,
      priority: DataTypes.JSONB,
      active: DataTypes.INTEGER
    },
    {
      id: "_id",
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false,
      freezeTableName: true
    }
  );
  signset.associate = function(models) {
    // associations can be defined here
  };
  return signset;
};
