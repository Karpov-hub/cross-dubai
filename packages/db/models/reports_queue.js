"use strict";
module.exports = (sequelize, DataTypes) => {
  const reports_queue = sequelize.define(
    "reports_queue",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      data: {
        type: DataTypes.JSON
      },
      status: DataTypes.INTEGER,
      ctime: {
        type: DataTypes.DATE
      },
      error: DataTypes.JSONB
    },
    {
      createdAt: "ctime",
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  reports_queue.associate = function(models) {
    // associations can be defined here
  };
  return reports_queue;
};
