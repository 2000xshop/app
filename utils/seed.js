const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { files, writeJson, ensureDataFiles } = require('./db');
const { calculateProfit } = require('./helpers');

(async () => {
  ensureDataFiles();
  const userId = uuidv4();
  const storeId = uuidv4();
  const passwordHash = await bcrypt.hash('123456', 10);
  const now = new Date().toISOString();

  const users = [
    {
      id: userId,
      username: 'demo',
      email: 'demo@example.com',
      passwordHash,
      storeId,
      createdAt: now
    }
  ];

  const stores = [
    {
      id: storeId,
      ownerUserId: userId,
      storeName: 'ร้านเดโม่',
      logo: '',
      themeColor: '#24c8f3',
      backgroundImage: '',
      createdAt: now
    }
  ];

  const transactions = [
    {
      id: uuidv4(),
      userId,
      storeId,
      date: '2026-03-28',
      itemName: 'เสื้อยืด',
      quantity: 3,
      price: 250,
      expense: 120,
      note: 'ขายผ่านไลฟ์สด',
      type: 'income',
      profit: calculateProfit({ quantity: 3, price: 250, expense: 120, type: 'income' }),
      createdAt: now
    },
    {
      id: uuidv4(),
      userId,
      storeId,
      date: '2026-03-29',
      itemName: 'ค่ากล่องพัสดุ',
      quantity: 1,
      price: 0,
      expense: 80,
      note: 'อุปกรณ์แพ็กของ',
      type: 'expense',
      profit: -80,
      createdAt: now
    }
  ];

  writeJson(files.users, users);
  writeJson(files.stores, stores);
  writeJson(files.transactions, transactions);
  console.log('Seed data created');
})();
