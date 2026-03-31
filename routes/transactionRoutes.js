const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { files, readJson, writeJson } = require('../utils/db');
const { requireAuth } = require('../middleware/authMiddleware');
const { calculateProfit, toNumber } = require('../utils/helpers');

const router = express.Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const transactions = readJson(files.transactions)
    .filter((t) => t.userId === req.session.user.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ transactions });
});

router.post('/', (req, res) => {
  const { date, itemName, quantity, price, expense, note, type } = req.body;

  if (!date || !itemName || !type) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ' });
  }

  const transactions = readJson(files.transactions);
  const item = {
    id: uuidv4(),
    userId: req.session.user.id,
    storeId: req.session.user.storeId,
    date,
    itemName,
    quantity: toNumber(quantity),
    price: toNumber(price),
    expense: toNumber(expense),
    note: note || '',
    type,
    profit: calculateProfit({ quantity, price, expense, type }),
    createdAt: new Date().toISOString()
  };

  transactions.push(item);
  writeJson(files.transactions, transactions);
  res.status(201).json({ message: 'เพิ่มข้อมูลสำเร็จ', transaction: item });
});

router.put('/:id', (req, res) => {
  const transactions = readJson(files.transactions);
  const index = transactions.findIndex(
    (t) => t.id === req.params.id && t.userId === req.session.user.id
  );

  if (index === -1) {
    return res.status(404).json({ message: 'ไม่พบรายการ' });
  }

  const current = transactions[index];
  const updated = {
    ...current,
    ...req.body,
    quantity: toNumber(req.body.quantity ?? current.quantity),
    price: toNumber(req.body.price ?? current.price),
    expense: toNumber(req.body.expense ?? current.expense)
  };

  updated.profit = calculateProfit(updated);
  transactions[index] = updated;
  writeJson(files.transactions, transactions);

  res.json({ message: 'แก้ไขข้อมูลสำเร็จ', transaction: updated });
});

router.delete('/:id', (req, res) => {
  const transactions = readJson(files.transactions);
  const filtered = transactions.filter(
    (t) => !(t.id === req.params.id && t.userId === req.session.user.id)
  );

  if (filtered.length === transactions.length) {
    return res.status(404).json({ message: 'ไม่พบรายการ' });
  }

  writeJson(files.transactions, filtered);
  res.json({ message: 'ลบรายการสำเร็จ' });
});

module.exports = router;
