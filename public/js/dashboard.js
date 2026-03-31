let editingId = null;

function renderTransactions(transactions) {
  const tbody = document.getElementById('transactionBody');
  tbody.innerHTML = transactions
    .map(
      (t) => `
        <tr>
          <td>${formatThaiDate(t.date)}</td>
          <td>
            <strong>${t.itemName}</strong>
            <div class="small-note">${t.note || '-'}</div>
          </td>
          <td>${t.quantity}</td>
          <td>${currency(t.price)}</td>
          <td>${currency(t.expense)}</td>
          <td>${currency(t.profit)}</td>
          <td><span class="badge ${t.type}">${t.type === 'income' ? 'รายรับ' : 'รายจ่าย'}</span></td>
          <td>
            <button class="btn btn-ghost btn-small" onclick='editTransaction(${JSON.stringify(t).replace(/'/g, '&apos;')})'>แก้ไข</button>
            <button class="btn btn-danger btn-small" onclick='deleteTransaction("${t.id}")'>ลบ</button>
          </td>
        </tr>`
    )
    .join('');
}

function fillSummary(summary) {
  document.getElementById('totalIncome').textContent = currency(summary.totalIncome);
  document.getElementById('totalExpense').textContent = currency(summary.totalExpense);
  document.getElementById('totalProfit').textContent = currency(summary.totalProfit);
  document.getElementById('totalCount').textContent = summary.totalCount;
}

function setFormData(data = {}) {
  document.getElementById('date').value = data.date || new Date().toISOString().slice(0, 10);
  document.getElementById('itemName').value = data.itemName || '';
  document.getElementById('quantity').value = data.quantity ?? '';
  document.getElementById('price').value = data.price ?? '';
  document.getElementById('expense').value = data.expense ?? '';
  document.getElementById('note').value = data.note || '';
  document.getElementById('type').value = data.type || 'income';
}

window.editTransaction = function (t) {
  editingId = t.id;
  setFormData(t);
  document.getElementById('submitBtn').textContent = 'บันทึกการแก้ไข';
};

window.deleteTransaction = async function (id) {
  if (!confirm('ยืนยันการลบรายการนี้?')) return;
  try {
    await apiFetch(`/api/transactions/${id}`, { method: 'DELETE' });
    showToast('toast', 'ลบรายการสำเร็จ', 'success');
    await loadDashboard();
  } catch (error) {
    showToast('toast', error.message, 'error');
  }
};

async function loadDashboard() {
  const user = await requireLogin();
  document.getElementById('welcomeText').textContent = `สวัสดี ${user.username}`;

  const [{ transactions }, report, storeRes] = await Promise.all([
    apiFetch('/api/transactions'),
    apiFetch('/api/reports/summary'),
    apiFetch('/api/store')
  ]);

  renderTransactions(transactions);
  fillSummary(report.summary);
  document.getElementById('storeHeadline').textContent = storeRes.store.storeName;
  applyStoreTheme(storeRes.store);
}

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('transactionForm');
  document.getElementById('logoutBtn').addEventListener('click', logout);
  setFormData();
  await loadDashboard();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      if (editingId) {
        await apiFetch(`/api/transactions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      showToast('toast', editingId ? 'อัปเดตรายการสำเร็จ' : 'เพิ่มรายการสำเร็จ', 'success');
      editingId = null;
      form.reset();
      setFormData();
      document.getElementById('submitBtn').textContent = 'เพิ่มข้อมูล';
      await loadDashboard();
    } catch (error) {
      showToast('toast', error.message, 'error');
    }
  });
});
