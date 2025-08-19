// API 测试文件
// 用于测试订单创建功能

const testOrderCreation = async () => {
  const orderData = {
    user_id: "550e8400-e29b-41d4-a716-446655440000", // 示例用户ID
    products: [
      {
        product_id: "550e8400-e29b-41d4-a716-446655440001", // 示例产品ID
        quantity: 2
      },
      {
        product_id: "550e8400-e29b-41d4-a716-446655440002", // 示例产品ID
        quantity: 1
      }
    ],
    shipping_address: "北京市朝阳区某某街道123号",
    notes: "请尽快发货"
  };

  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 订单创建成功:', result);
    } else {
      console.error('❌ 订单创建失败:', result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ 请求失败:', error);
    throw error;
  }
};

// 测试获取订单列表
const testGetOrders = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/orders?page=1&limit=5');
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 获取订单列表成功:', result);
    } else {
      console.error('❌ 获取订单列表失败:', result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ 请求失败:', error);
    throw error;
  }
};

// 测试获取单个订单
const testGetOrderById = async (orderId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 获取订单详情成功:', result);
    } else {
      console.error('❌ 获取订单详情失败:', result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ 请求失败:', error);
    throw error;
  }
};

// 测试更新订单状态
const testUpdateOrderStatus = async (orderId) => {
  const updateData = {
    status: 'processing',
    payment_status: 'paid'
  };

  try {
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 订单状态更新成功:', result);
    } else {
      console.error('❌ 订单状态更新失败:', result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ 请求失败:', error);
    throw error;
  }
};

// 运行测试
const runTests = async () => {
  console.log('🚀 开始API测试...\n');
  
  try {
    // 测试1: 创建订单
    console.log('📝 测试1: 创建订单');
    const createResult = await testOrderCreation();
    
    if (createResult.success && createResult.data) {
      const orderId = createResult.data.order_id;
      
      // 等待一下让数据库操作完成
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 测试2: 获取订单列表
      console.log('\n📋 测试2: 获取订单列表');
      await testGetOrders();
      
      // 测试3: 获取单个订单
      console.log('\n🔍 测试3: 获取订单详情');
      await testGetOrderById(orderId);
      
      // 测试4: 更新订单状态
      console.log('\n✏️ 测试4: 更新订单状态');
      await testUpdateOrderStatus(orderId);
    }
    
    console.log('\n🎉 所有测试完成！');
    
  } catch (error) {
    console.error('\n💥 测试过程中发生错误:', error);
  }
};

// 如果直接运行此文件，则执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export {
  testOrderCreation,
  testGetOrders,
  testGetOrderById,
  testUpdateOrderStatus,
  runTests
};
