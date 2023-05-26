"use strict";
module.exports = (sequelize, DataTypes) => {
  const tag = sequelize.define(
    "tag",
    {
      entity: {
        allowNull: false,
        type: DataTypes.UUID
      },
      tag: {
        allowNull: false,
        type: DataTypes.STRING(20)
      }
    },
    {
      createdAt: false,
      updatedAt: false,
      deletedAt: false
    }
  );
  tag.removeAttribute("id");
  tag.associate = function(models) {
    // associations can be defined here
  };
  return tag;
};
