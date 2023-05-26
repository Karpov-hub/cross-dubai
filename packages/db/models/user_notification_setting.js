"use strict";
module.exports = (sequelize, DataTypes) => {
  const user_notification_setting = sequelize.define(
    "user_notification_setting",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        primaryKey: true
      },
      user_id: DataTypes.UUID,
      notification_settings: DataTypes.JSONB
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false
    }
  );
  user_notification_setting.associate = function(models) {
    // associations can be defined here
  };
  return user_notification_setting;
};
