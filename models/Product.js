const { DataTypes  } = require('sequelize');
const { sequelize  } = require('../config/database.js');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true,
    },
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      isInt: true,
    },
    field: 'stock_quantity',
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      notEmpty: true,
    },
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
  tableName: 'products',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (product) => {
      if (product.price) {
        product.price = parseFloat(product.price).toFixed(2);
      }
    },
  },
});

// 实例方法
Product.prototype.isInStock = function() {
  return this.stockQuantity > 0;
};

Product.prototype.isLowStock = function(threshold = 10) {
  return this.stockQuantity <= threshold;
};

Product.prototype.getStockStatus = function() {
  if (this.stockQuantity === 0) return 'Out of Stock';
  if (this.stockQuantity <= 10) return 'Low Stock';
  return 'In Stock';
};

// 类方法
Product.findByCategory = function(category) {
  return this.findAll({ where: { category, isActive: true } });
};

Product.findLowStock = function(threshold = 10) {
  return this.findAll({
    where: {
      stockQuantity: { [sequelize.Op.lte]: threshold },
      isActive: true,
    },
  });
};

Product.findActive = function() {
  return this.findAll({ where: { isActive: true } });
};

Product.searchByName = function(searchTerm) {
  return this.findAll({
    where: {
      name: { [sequelize.Op.iLike]: `%${searchTerm}%` },
      isActive: true,
    },
  });
};

module.exports = Product;
