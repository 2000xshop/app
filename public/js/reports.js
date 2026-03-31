const THAI_MONTHS = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
let allTransactions = [];
let currentStore = null;
let selectedMonth = null;

function summarizeTransactions(transactions) {
  return transactions.reduce((acc, t) => {
    const amount = Number(t.quantity || 0) * Number(t.price || 0);
    const expense = Number(t.expense || 0);
    if (t.type === 'income') {
      acc.totalIncome += amount;
      acc.totalProfit += Number(t.profit || 0);
      acc.totalExpense += expense;
    } else {
      acc.totalExpense += expense;
      acc.totalProfit -= expense;
    }
    acc.totalCount += 1;
    return acc;
  }, { totalIncome: 0, totalExpense: 0, totalProfit: 0, totalCount: 0 });
}

function getMonthTransactions(monthIndex) {
  return allTransactions.filter((t) => {
    const date = new Date(t.date);
    return !Number.isNaN(date.getTime()) && date.getMonth() === monthIndex;
  });
}

function renderMonthButtons() {
  const wrap = document.getElementById('monthTabs');
  wrap.innerHTML = THAI_MONTHS.map((month, index) => `
    <button type="button" class="month-chip ${selectedMonth === index ? 'active' : ''}" data-month="${index}">${month}</button>
  `).join('');

  wrap.querySelectorAll('.month-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedMonth = Number(btn.dataset.month);
      renderMonthButtons();
      renderReport();
    });
  });
}

function drawBar(canvasId, labels, values, color = getComputedStyle(document.documentElement).getPropertyValue('--button-color').trim() || '#24c8f3') {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth * devicePixelRatio;
  const h = canvas.height = 300 * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0, 0, w, h);
  const width = canvas.clientWidth;
  const height = 300;
  const padding = 36;
  const max = Math.max(...values, 1);
  const columnWidth = (width - padding * 2) / Math.max(values.length, 1);
  const barWidth = columnWidth * 0.58;

  values.forEach((v, i) => {
    const x = padding + i * columnWidth + (columnWidth - barWidth) / 2;
    const barH = ((height - padding * 2) * v) / max;
    const y = height - padding - barH;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barH);
    ctx.fillStyle = '#d7e7ff';
    ctx.font = '12px sans-serif';
    ctx.fillText(labels[i], x - 2, height - 12);
  });
}

function drawLine(canvasId, labels, values, color = '#2de39b') {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth * devicePixelRatio;
  const h = canvas.height = 300 * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0, 0, w, h);
  const width = canvas.clientWidth;
  const height = 300;
  const padding = 36;
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

  ctx.beginPath();
  values.forEach((v, i) => {
    const x = padding + step * i;
    const y = height - padding - ((height - padding * 2) * v) / max;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  values.forEach((v, i) => {
    const x = padding + step * i;
    const y = height - padding - ((height - padding * 2) * v) / max;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  ctx.fillStyle = '#d7e7ff';
  ctx.font = '12px sans-serif';
  labels.forEach((label, i) => {
    const x = padding + step * i;
    ctx.fillText(label, x - 10, height - 12);
  });
}

function drawPie(canvasId, values, colors = [getComputedStyle(document.documentElement).getPropertyValue('--button-color').trim() || '#24c8f3', '#ff6b81']) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth * devicePixelRatio;
  const h = canvas.height = 300 * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0, 0, w, h);
  const total = values.reduce((a, b) => a + b, 0) || 1;
  let start = -Math.PI / 2;
  values.forEach((value, index) => {
    const angle = (value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(180, 150);
    ctx.arc(180, 150, 100, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    start += angle;
  });
}

function renderReport() {
  const transactions = selectedMonth === null ? allTransactions : getMonthTransactions(selectedMonth);
  const summary = summarizeTransactions(transactions);
  const label = selectedMonth === null ? 'ทั้งปี' : `เดือน${THAI_MONTHS[selectedMonth]}`;

  document.getElementById('reportSummary').innerHTML = `
    <div class="summary-grid">
      <div class="summary-card"><div class="summary-label">รายรับรวม (${label})</div><div class="summary-value">${currency(summary.totalIncome)}</div></div>
      <div class="summary-card"><div class="summary-label">ค่าใช้จ่ายรวม</div><div class="summary-value">${currency(summary.totalExpense)}</div></div>
      <div class="summary-card"><div class="summary-label">กำไรรวม</div><div class="summary-value">${currency(summary.totalProfit)}</div></div>
      <div class="summary-card"><div class="summary-label">จำนวนรายการ</div><div class="summary-value">${summary.totalCount}</div></div>
    </div>`;

  const barLabels = THAI_MONTHS.map((month, i) => month.slice(0, 3));
  const monthlyIncome = THAI_MONTHS.map((_, i) => summarizeTransactions(getMonthTransactions(i)).totalIncome);
  const monthlyProfit = THAI_MONTHS.map((_, i) => summarizeTransactions(getMonthTransactions(i)).totalProfit);

  drawBar('barChart', barLabels, monthlyIncome);
  drawLine('lineChart', barLabels, monthlyProfit);
  drawPie('pieChart', [summary.totalIncome, summary.totalExpense]);
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireLogin();
  document.getElementById('logoutBtn').addEventListener('click', logout);

  const [{ transactions }, storeRes] = await Promise.all([
    apiFetch('/api/transactions'),
    apiFetch('/api/store')
  ]);

  allTransactions = transactions;
  currentStore = storeRes.store;
  applyStoreTheme(currentStore);

  document.getElementById('storeNameHeading').textContent = currentStore.storeName || 'รายงานร้าน';
  renderMonthButtons();
  renderReport();
});
