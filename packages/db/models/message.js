"use strict";
module.exports = (sequelize, DataTypes) => {
  const support_message = sequelize.define(
    "support_message",
    {
      id: {
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: DataTypes.UUID,
      sender: DataTypes.UUID,
      text: DataTypes.TEXT,
      attachments: DataTypes.JSONB,
      is_new: DataTypes.BOOLEAN,

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
      maker: DataTypes.UUID
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  support_message.associate = function(models) {
    // associations can be defined here
  };
  return support_message;
};
