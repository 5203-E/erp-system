import { sequelize } from '../config/database.js';
import '../models/index.js';

// 数据库初始化函数
export const initializeDatabase = async () => {
  try {
    console.log('🔄 正在初始化数据库...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 同步所有模型（创建表）
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ 数据库表同步完成');
    
    console.log('🎉 数据库初始化完成！');
    return true;
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
};

// 重置数据库（删除所有表并重新创建）
export const resetDatabase = async () => {
  try {
    console.log('🔄 正在重置数据库...');
    
    // 删除所有表并重新创建
    await sequelize.sync({ force: true });
    console.log('✅ 数据库重置完成');
    
    return true;
  } catch (error) {
    console.error('❌ 数据库重置失败:', error);
    throw error;
  }
};

// 关闭数据库连接
export const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log('✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 关闭数据库连接失败:', error);
  }
};

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      initializeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    case 'reset':
      resetDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
    default:
      console.log('使用方法:');
      console.log('  node init.js init   - 初始化数据库');
      console.log('  node init.js reset  - 重置数据库');
      process.exit(1);
  }
}
