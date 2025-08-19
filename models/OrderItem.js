const { DataTypes  } = require('sequelize');
const { sequelize  } = require('../config/database.js');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'order_id',
    references: {
      model: 'orders',
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id',
    references: {
      model: 'products',
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      isInt: true,
    },
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_price',
    validate: {
      min: 0,
      isDecimal: true,
    },
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_price',
    validate: {
      min: 0,
      isDecimal: true,
    },
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
  tableName: 'order_items',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (orderItem) => {
      if (orderItem.unitPrice) {
        orderItem.unitPrice = parseFloat(orderItem.unitPrice).toFixed(2);
      }
      if (orderItem.quantity && orderItem.unitPrice) {
        orderItem.totalPrice = (orderItem.quantity * orderItem.unitPrice).toFixed(2);
      }
    },
    beforeCreate: (orderItem) => {
      if (orderItem.quantity && orderItem.unitPrice) {
        orderItem.totalPrice = (orderItem.quantity * orderItem.unitPrice).toFixed(2);
      }
    },
    beforeUpdate: (orderItem) => {
      if (orderItem.quantity && orderItem.unitPrice) {
        orderItem.totalPrice = (orderItem.quantity * orderItem.unitPrice).toFixed(2);
      }
    },
  },
});

// 实例方法
OrderItem.prototype.getSubtotal = function() {
  return this.quantity * this.unitPrice;
};

OrderItem.prototype.updateQuantity = function(newQuantity) {
  this.quantity = newQuantity;
  this.totalPrice = (newQuantity * this.unitPrice).toFixed(2);
  return this.save();
};

// 类方法
OrderItem.findByOrder = function(orderId) {
  return this.findAll({ where: { orderId } });
};

OrderItem.findByProduct = function(productId) {
  return this.findAll({ where: { productId } });
};

OrderItem.getOrderTotal = function(orderId) {
  return this.sum('totalPrice', { where: { orderId } });
};

OrderItem.getProductSales = function(productId, startDate, endDate) {
  return this.findAll({
    where: {
      productId,
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate],
      },
    },
    include: [{
      model: sequelize.models.Order,
      where: { status: 'completed' },
    }],
  });
};

module.exports = OrderItem;
