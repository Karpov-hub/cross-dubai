"use strict";
module.exports = (sequelize, DataTypes) => {
  const telegram_channel = sequelize.define(
    "telegram_channel",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      channel_id: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ref_id: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false
      },
      telegram_app: {
        type: DataTypes.UUID,
        allowNull: false
      },
      join_link: {
        type: DataTypes.STRING(40),
        allowNull: false
      },
      removed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      signobject: DataTypes.JSON,
      maker: DataTypes.UUID,
      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE
    },
    { createdAt: "ctime", updatedAt: "mtime", deletedAt: null }
  );
  telegram_channel.associate = function(models) {
    // associations can be defined here
  };
  return telegram_channel;
};
