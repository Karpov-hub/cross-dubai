"use strict";
module.exports = (sequelize, DataTypes) => {
  const notification = sequelize.define(
    "notification",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      sender: DataTypes.STRING(60),
      sender_id: DataTypes.UUID,
      message: DataTypes.STRING,
      new: DataTypes.INTEGER,
      user_id: DataTypes.UUID,

      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      signobject: DataTypes.JSON,
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  notification.associate = function(models) {};
  return notification;
};
