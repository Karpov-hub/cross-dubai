"use strict";
module.exports = (sequelize, DataTypes) => {
  const tranche = sequelize.define(
    "tranche",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true
      },
      ref_id: DataTypes.UUID,
      no: DataTypes.INTEGER,
      data: DataTypes.JSONB,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      removed: DataTypes.INTEGER,
      maker: DataTypes.UUID,
      signobject: DataTypes.JSONB
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  tranche.associate = function(models) {
    // associations can be defined here
  };
  return tranche;
};
