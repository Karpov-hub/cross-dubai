"use strict";
module.exports = (sequelize, DataTypes) => {
  const users_memo = sequelize.define(
    "users_memo",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      maker: DataTypes.UUID,
      ref_id: DataTypes.UUID,
      memo: DataTypes.TEXT
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false,
      freezeTableName: true
    }
  );
  users_memo.associate = function(models) {
    // associations can be defined here
  };
  return users_memo;
};
