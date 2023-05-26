"use strict";
module.exports = (sequelize, DataTypes) => {
  const admin_user = sequelize.define(
    "admin_user",
    {
      _id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      login: DataTypes.STRING(30),
      pass: DataTypes.STRING(100),
      superuser: DataTypes.INTEGER,
      order_status: DataTypes.BOOLEAN,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      signobject: DataTypes.JSON,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      other_configs: DataTypes.JSONB
    },
    {
      id: "_id",
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  admin_user.associate = function(models) {
    // associations can be defined here
  };
  return admin_user;
};
