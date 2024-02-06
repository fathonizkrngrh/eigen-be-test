const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('borrows', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'members',
        key: 'id'
      }
    },
    member_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    member_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    book_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    book_title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('borrowed','returned'),
      allowNull: false
    },
    borrowed_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now')
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    returned_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    returned_to: {
      type: DataTypes.JSON,
      allowNull: true
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now')
    },
    modified_on: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'borrows',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "member_id",
        using: "BTREE",
        fields: [
          { name: "member_id" },
        ]
      },
      {
        name: "book_id",
        using: "BTREE",
        fields: [
          { name: "book_id" },
        ]
      },
    ]
  });
};
