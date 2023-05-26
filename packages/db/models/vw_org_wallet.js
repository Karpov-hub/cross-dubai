"use strict";
module.exports = (sequelize, DataTypes) => {
  const vw_org_wallet = sequelize.define(
    "vw_org_wallet",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      name: DataTypes.STRING,
      org: DataTypes.UUIDV1,
      num: DataTypes.STRING,
      curr_name: DataTypes.STRING,
      user_id: DataTypes.UUID,
      mtime: DataTypes.DATE,
      ctime: DataTypes.DATE
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );

  return vw_org_wallet;
};
