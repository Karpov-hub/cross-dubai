"use strict";
module.exports = (sequelize, DataTypes) => {
  const realm = sequelize.define(
    "realm",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      pid: DataTypes.UUID,
      tariff: DataTypes.UUID,
      name: DataTypes.STRING,
      token: DataTypes.STRING,
      ip: DataTypes.STRING,
      domain: DataTypes.STRING,
      permissions: DataTypes.JSON,
      variables: DataTypes.JSON,
      cors: DataTypes.JSON,
      activateuserlink: DataTypes.STRING,
      payment_details: DataTypes.STRING,
      admin_realm: DataTypes.BOOLEAN
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  realm.associate = function(models) {
    // associations can be defined here
  };
  return realm;
};
