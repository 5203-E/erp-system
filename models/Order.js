const { DataTypes  } = require('sequelize');
const { sequelize  } = require('../config/database.js');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'order_number',
    validate: {
      notEmpty: true,
    },
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'total_amount',
    validate: {
      min: 0,
      isDecimal: true,
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'processing', 'completed', 'cancelled']],
    },
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    defaultValue: 'pending',
    field: 'payment_status',
    validate: {
      isIn: [['pending', 'paid', 'failed']],
    },
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'shipping_address',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
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
  tableName: 'orders',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (order) => {
      if (!order.orderNumber) {
        order.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    },
    beforeValidate: (order) => {
      if (order.totalAmount) {
        order.totalAmount = parseFloat(order.totalAmount).toFixed(2);
      }
    },
  },
});

// 实例方法
Order.prototype.isPending = function() {
  return this.status === 'pending';
};

Order.prototype.isCompleted = function() {
  return this.status === 'completed';
};

Order.prototype.isCancelled = function() {
  return this.status === 'cancelled';
};

Order.prototype.isPaid = function() {
  return this.paymentStatus === 'paid';
};

Order.prototype.canBeCancelled = function() {
  return ['pending', 'processing'].includes(this.status);
};

Order.prototype.canBeCompleted = function() {
  return this.status === 'processing' && this.paymentStatus === 'paid';
};

// 类方法
Order.findByUser = function(userId) {
  return this.findAll({ where: { userId } });
};

Order.findByStatus = function(status) {
  return this.findAll({ where: { status } });
};

Order.findPending = function() {
  return this.findAll({ where: { status: 'pending' } });
};

Order.findCompleted = function() {
  return this.findAll({ where: { status: 'completed' } });
};

Order.findByDateRange = function(startDate, endDate) {
  return this.findAll({
    where: {
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate],
      },
    },
  });
};

Order.getTotalSales = function(startDate, endDate) {
  return this.sum('totalAmount', {
    where: {
      status: 'completed',
      createdAt: {
        [sequelize.Op.between]: [startDate, endDate],
      },
    },
  });
};

// 生成订单号
Order.generateOrderNumber = function() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `ORD-${timestamp}-${random}`;
};

module.exports = Order;
