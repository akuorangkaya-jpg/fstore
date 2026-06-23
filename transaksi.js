let allTransactions = [];

// Helper to get month key (YYYY-MM) and month name
function getMonthInfo(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const monthKey = `${year}-${(month + 1).toString().padStart(2, '0')}`;
  
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  return {
    key: monthKey,
    name: `${monthNames[month]} ${year}`
  };
}

// Group transactions by month
function groupTransactionsByMonth(transactions) {
  const groups = {};
  
  transactions.forEach(t => {
    const monthInfo = getMonthInfo(t.date);
    if (!groups[monthInfo.key]) {
      groups[monthInfo.key] = {
        name: monthInfo.name,
        transactions: [],
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: 0,
        proofCount: 0
      };
    }
    groups[monthInfo.key].transactions.push(t);
    groups[monthInfo.key].totalIncome += t.income;
    groups[monthInfo.key].totalExpense += t.expense;
    groups[monthInfo.key].transactionCount++;
    if (t.proofUrl) {
      groups[monthInfo.key].proofCount++;
    }
  });
  
  // Calculate monthly balance
  Object.keys(groups).forEach(key => {
    groups[key].balance = groups[key].totalIncome - groups[key].totalExpense;
  });
  
  // Sort groups by month descending
  const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
  const sortedGroups = {};
  sortedKeys.forEach(key => {
    sortedGroups[key] = groups[key];
  });
  
  return sortedGroups;
}

async function initTransactions() {
  const rawTransactions = await fetchTransactions();
  allTransactions = calculateRunningBalance(rawTransactions);

  // Update last updated
  const lastUpdatedElement = document.getElementById('lastUpdated');
  const latestDate = getLatestTransactionDate(rawTransactions);
  if (latestDate) {
    lastUpdatedElement.textContent = `Terakhir diperbarui: ${formatDate(latestDate)}`;
  } else {
    lastUpdatedElement.textContent = 'Terakhir diperbarui: Belum tersedia';
  }

  // Add event listeners
  document.getElementById('searchInput').addEventListener('input', filterTransactions);
  document.getElementById('categoryFilter').addEventListener('change', filterTransactions);
  document.getElementById('monthFilter').addEventListener('change', filterTransactions);
  document.getElementById('startDateFilter').addEventListener('change', filterTransactions);
  document.getElementById('endDateFilter').addEventListener('change', filterTransactions);

  // Initial render
  filterTransactions();
}

function filterTransactions() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const month = document.getElementById('monthFilter').value;
  const startDate = document.getElementById('startDateFilter').value;
  const endDate = document.getElementById('endDateFilter').value;

  let filtered = [...allTransactions];

  // Filter by search
  if (search) {
    filtered = filtered.filter(t => t.description.toLowerCase().includes(search));
  }

  // Filter by category
  if (category) {
    filtered = filtered.filter(t => t.category === category);
  }

  // Filter by month
  if (month) {
    filtered = filtered.filter(t => {
      const tDate = new Date(t.date);
      const tMonth = `${tDate.getFullYear()}-${(tDate.getMonth() + 1).toString().padStart(2, '0')}`;
      return tMonth === month;
    });
  }

  // Filter by date range
  if (startDate) {
    filtered = filtered.filter(t => new Date(t.date) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(t => new Date(t.date) <= new Date(endDate));
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  renderTransactions(filtered);
}

function renderTransactions(transactions) {
  const container = document.getElementById('transactionsContainer');

  if (transactions.length === 0) {
    container.innerHTML = '<div class="loading">Tidak ada transaksi ditemukan.</div>';
    return;
  }

  const grouped = groupTransactionsByMonth(transactions);
  const monthKeys = Object.keys(grouped);

  // Render monthly summary
  let summaryHTML = '<div class="section-header">';
  summaryHTML += '<h2 class="section-title">Ringkasan Per Bulan</h2>';
  summaryHTML += '<p class="section-subtitle">Ikhtisar pemasukan, pengeluaran, saldo, dan bukti transaksi berdasarkan periode.</p>';
  summaryHTML += '</div>';
  summaryHTML += '<div class="monthly-summary">';
  monthKeys.forEach(key => {
    const group = grouped[key];
    summaryHTML += `
      <div class="monthly-card">
        <div class="monthly-header">
          <h3>${group.name}</h3>
        </div>
        <div class="monthly-stats">
          <div class="stat-row">
            <span class="stat-label">Total Pemasukan</span>
            <span class="stat-value income-text">${formatRupiah(group.totalIncome)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Total Pengeluaran</span>
            <span class="stat-value expense-text">${formatRupiah(group.totalExpense)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Saldo Bulan Ini</span>
            <span class="stat-value ${group.balance >= 0 ? 'income-text' : 'expense-text'}">${formatRupiah(group.balance)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Jumlah Transaksi</span>
            <span class="stat-value">${group.transactionCount}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Bukti Tersedia</span>
            <span class="stat-value">${group.proofCount}</span>
          </div>
        </div>
      </div>
    `;
  });
  summaryHTML += '</div>';

  // Render transaction table
  let tableHTML = '<div class="section-header">';
  tableHTML += '<h2 class="section-title">Daftar Transaksi</h2>';
  tableHTML += '<p class="section-subtitle">Seluruh riwayat transaksi yang tercatat berdasarkan data keuangan Fstore.</p>';
  tableHTML += '</div>';
  tableHTML += '<div class="table-container">';
  tableHTML += '<table>';
  tableHTML += `
    <thead>
      <tr>
        <th>Tanggal</th>
        <th>Kategori</th>
        <th>Deskripsi</th>
        <th>Pendapatan</th>
        <th>Pengeluaran</th>
        <th>Saldo</th>
        <th>Bukti</th>
      </tr>
    </thead>
    <tbody>
  `;
  monthKeys.forEach(key => {
    const group = grouped[key];
    tableHTML += `
      <tr class="month-separator">
        <td colspan="7">
          <div class="month-separator-text">${group.name}</div>
        </td>
      </tr>
    `;
    group.transactions.forEach(t => {
      tableHTML += `
        <tr>
          <td>${formatDate(t.date)}</td>
          <td>${t.category}</td>
          <td>${t.description}</td>
          <td class="income-text">${t.income > 0 ? formatRupiah(t.income) : '-'}</td>
          <td class="expense-text">${t.expense > 0 ? formatRupiah(t.expense) : '-'}</td>
          <td>${formatRupiah(t.balance)}</td>
          <td>
            ${t.proofUrl ? `<a href="${t.proofUrl}" target="_blank" class="proof-link">Lihat Bukti</a>` : '-'}
          </td>
        </tr>
      `;
    });
  });
  tableHTML += '</tbody></table></div>';

  container.innerHTML = summaryHTML + tableHTML;
}

document.addEventListener('DOMContentLoaded', initTransactions);
