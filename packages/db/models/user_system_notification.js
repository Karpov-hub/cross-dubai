"use strict";
module.exports = (sequelize, DataTypes) => {
  const user_system_notification = sequelize.define(
    "user_system_notification",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true
      },
      user_id: DataTypes.UUID,
      message: DataTypes.JSONB,
      system_notification_id: DataTypes.UUID,
      ctime: {
        allowNull: false,
        type: DataTypes.DATE
      },
      new_record: {
        defaultValue: true,
        type: DataTypes.BOOLEAN
      }
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false
    }
  );
  user_system_notification.associate = function(models) {
    // associations can be defined here
  };
  return user_system_notification;
};
