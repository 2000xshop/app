function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function calculateProfit({ quantity, price, expense, type }) {
  const q = toNumber(quantity);
  const p = toNumber(price);
  const e = toNumber(expense);

  if (type === 'expense') return -e;
  return q * p - e;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function groupByPeriod(transactions, period) {
  const map = {};

  transactions.forEach((t) => {
    const date = new Date(t.date);
    if (Number.isNaN(date.getTime())) return;
    let key;

    if (period === 'daily') {
      key = date.toISOString().slice(0, 10);
    } else if (period === 'weekly') {
      const start = new Date(date);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      key = start.toISOString().slice(0, 10);
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    if (!map[key]) {
      map[key] = { label: key, income: 0, expense: 0, profit: 0, count: 0 };
    }

    const amount = toNumber(t.quantity) * toNumber(t.price);
    const expense = toNumber(t.expense);

    if (t.type === 'income') {
      map[key].income += amount;
      map[key].profit += toNumber(t.profit);
    } else {
      map[key].expense += expense;
      map[key].profit -= expense;
    }

    map[key].count += 1;
  });

  return Object.values(map).sort((a, b) => a.label.localeCompare(b.label));
}

module.exports = {
  toNumber,
  calculateProfit,
  isValidEmail,
  groupByPeriod
};
