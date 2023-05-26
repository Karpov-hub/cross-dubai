"use strict";
module.exports = (sequelize, DataTypes) => {
  const ticket = sequelize.define(
    "ticket",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        unique: true,
        primaryKey: true
      },
      number_of_ticket: DataTypes.STRING,
      status: DataTypes.INTEGER,
      type: DataTypes.INTEGER,
      title: DataTypes.STRING,
      category: DataTypes.STRING,
      message: DataTypes.TEXT,
      file_id: DataTypes.JSON,
      file_name: DataTypes.JSON,
      file_size: DataTypes.JSON,
      user_id: DataTypes.UUID,
      realm_id: DataTypes.UUID,
      new_message: DataTypes.BOOLEAN,
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
      }
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  return ticket;
};
