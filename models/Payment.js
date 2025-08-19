const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * 支付模型
 * 存储支付相关的所有信息
 */
const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  
  // 订单ID（外键）
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  
  // 用户ID（外键）
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  
  // 支付金额
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01,
      max: 999999.99
    }
  },
  
  // 支付方式
  paymentMethod: {
    type: DataTypes.ENUM(
      'credit_card',    // 信用卡
      'debit_card',     // 借记卡
      'bank_transfer',  // 银行转账
      'digital_wallet', // 数字钱包
      'cash'            // 现金
    ),
    allowNull: false
  },
  
  // 支付状态
  status: {
    type: DataTypes.ENUM(
      'pending',     // 待处理
      'processing',  // 处理中
      'completed',   // 已完成
      'failed',      // 失败
      'cancelled',   // 已取消
      'refunding',   // 退款中
      'refunded'     // 已退款
    ),
    defaultValue: 'pending',
    allowNull: false
  },
  
  // 交易ID（第三方支付平台返回）
  transactionId: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true
  },
  
  // 支付处理时间
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // 交易日期
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  // 退款原因
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // 退款申请时间
  refundRequestedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // 退款完成时间
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // 退款交易ID
  refundTransactionId: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true
  },
  
  // 支付备注
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // 支付网关响应
  gatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true
  },
  
  // 错误信息
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // 重试次数
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 10
    }
  },
  
  // 最后重试时间
  lastRetryAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // 创建时间
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  // 更新时间
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  
  // 索引
  indexes: [
    {
      name: 'idx_payment_order_id',
      fields: ['order_id']
    },
    {
      name: 'idx_payment_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_payment_status',
      fields: ['status']
    },
    {
      name: 'idx_payment_method',
      fields: ['payment_method']
    },
    {
      name: 'idx_payment_transaction_id',
      fields: ['transaction_id'],
      unique: true
    },
    {
      name: 'idx_payment_created_at',
      fields: ['created_at']
    },
    {
      name: 'idx_payment_composite',
      fields: ['user_id', 'status', 'created_at']
    }
  ],
  
  // 钩子函数
  hooks: {
    beforeCreate: (payment) => {
      // 生成交易ID（如果没有提供）
      if (!payment.transactionId) {
        payment.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      }
    },
    
    beforeUpdate: (payment) => {
      // 如果状态变为已完成，设置处理时间
      if (payment.changed('status') && payment.status === 'completed' && !payment.processedAt) {
        payment.processedAt = new Date();
      }
      
      // 如果状态变为已退款，设置退款时间
      if (payment.changed('status') && payment.status === 'refunded' && !payment.refundedAt) {
        payment.refundedAt = new Date();
      }
    }
  }
});

// 实例方法
Payment.prototype.isRefundable = function() {
  return this.status === 'completed' && 
         this.paymentMethod !== 'cash' && 
         new Date() - this.processedAt < 30 * 24 * 60 * 60 * 1000; // 30天内可退款
};

Payment.prototype.canRetry = function() {
  return this.status === 'failed' && 
         this.retryCount < 3 && 
         (!this.lastRetryAt || new Date() - this.lastRetryAt > 5 * 60 * 1000); // 5分钟后可重试
};

Payment.prototype.getStatusText = function() {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
    refunding: '退款中',
    refunded: '已退款'
  };
  return statusMap[this.status] || this.status;
};

Payment.prototype.getPaymentMethodText = function() {
  const methodMap = {
    credit_card: '信用卡',
    debit_card: '借记卡',
    bank_transfer: '银行转账',
    digital_wallet: '数字钱包',
    cash: '现金'
  };
  return methodMap[this.paymentMethod] || this.paymentMethod;
};

// 类方法
Payment.findByTransactionId = function(transactionId) {
  return this.findOne({ where: { transactionId } });
};

Payment.findByOrderId = function(orderId) {
  return this.findAll({ 
    where: { orderId },
    order: [['createdAt', 'DESC']]
  });
};

Payment.getTotalAmountByUser = function(userId, status = 'completed') {
  return this.sum('amount', { 
    where: { userId, status }
  });
};

module.exports = Payment;
