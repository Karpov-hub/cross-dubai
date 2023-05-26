"use strict";
module.exports = (sequelize, DataTypes) => {
  const telegram_app = sequelize.define(
    "telegram_app",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      phone: DataTypes.STRING(20),
      app_id: DataTypes.INTEGER,
      api_hash: DataTypes.STRING(50),
      session: DataTypes.TEXT,
      user_id: DataTypes.UUID,
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
  telegram_app.associate = function(models) {
    // associations can be defined here
  };

  return telegram_app;
};
