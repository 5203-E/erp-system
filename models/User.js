const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100],
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash',
  },
  role: {
    type: DataTypes.ENUM('admin', 'employee'),
    allowNull: false,
    defaultValue: 'employee',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (user) => {
      if (user.passwordHash) {
        // 这里可以添加密码哈希逻辑
        user.passwordHash = user.passwordHash;
      }
    },
  },
});

// 实例方法
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

User.prototype.isEmployee = function() {
  return this.role === 'employee';
};

// 类方法
User.findByEmail = function(email) {
  return this.findOne({ where: { email } });
};

User.findActiveUsers = function() {
  return this.findAll({ where: { isActive: true } });
};

module.exports = User;
