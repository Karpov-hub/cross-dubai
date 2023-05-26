"use strict";
module.exports = (sequelize, DataTypes) => {
  const client_role = sequelize.define(
    "client_role",
    {
      id: {
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        type: DataTypes.UUID
      },
      name: DataTypes.STRING(40),
      permissions: DataTypes.JSONB,
      is_default: DataTypes.BOOLEAN,
      other_permissions: DataTypes.JSONB,

      ctime: DataTypes.DATE,
      mtime: DataTypes.DATE,
      maker: DataTypes.UUID,
      removed: DataTypes.INTEGER,
      signobject: DataTypes.JSON
    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );
  client_role.associate = function(models) {
    client_role.belongsTo(models.user, {
      foreignKey: "id",
      targetKey: "role"
    });
  };
  return client_role;
};
