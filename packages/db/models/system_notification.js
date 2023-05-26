"use strict";
module.exports = (sequelize, DataTypes) => {
  const system_notification = sequelize.define(
    "system_notification",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      date_from: DataTypes.DATE,
      date_to: DataTypes.DATE,
      letter_template: DataTypes.STRING,
      data: DataTypes.JSONB,
      active: DataTypes.BOOLEAN,

      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      mtime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      mail_sent: DataTypes.BOOLEAN,
      title: DataTypes.STRING(100)
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  system_notification.associate = function(models) {};
  return system_notification;
};
