const express = require('express');
const { files, readJson } = require('../utils/db');
const { requireAuth } = require('../middleware/authMiddleware');
const { groupByPeriod, toNumber } = require('../utils/helpers');

const router = express.Router();
router.use(requireAuth);

router.get('/summary', (req, res) => {
  const transactions = readJson(files.transactions).filter((t) => t.userId === req.session.user.id);

  const summary = transactions.reduce(
    (acc, t) => {
      const gross = toNumber(t.quantity) * toNumber(t.price);
      const expense = toNumber(t.expense);

      if (t.type === 'income') {
        acc.totalIncome += gross;
        acc.totalProfit += toNumber(t.profit);
      } else {
        acc.totalExpense += expense;
      }

      acc.totalExpense += t.type === 'income' ? expense : 0;
      acc.totalCount += 1;
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, totalProfit: 0, totalCount: 0 }
  );

  res.json({
    summary,
    daily: groupByPeriod(transactions, 'daily'),
    weekly: groupByPeriod(transactions, 'weekly'),
    monthly: groupByPeriod(transactions, 'monthly')
  });
});

module.exports = router;
