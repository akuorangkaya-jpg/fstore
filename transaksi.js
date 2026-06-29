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
    container.innerHTML = `
      <div class="empty-state">
        <p>Tidak ada transaksi yang cocok dengan kriteria pencarian Anda.</p>
      </div>
    `;
    return;
  }

  const grouped = groupTransactionsByMonth(transactions);
  const monthKeys = Object.keys(grouped);

  // 1. RENDER MONTHLY SUMMARY CARDS
  let summaryHTML = '<div class="section-header-inline">';
  summaryHTML += '<h2 class="section-title">Ringkasan Per Periode</h2>';
  summaryHTML += '<p class="section-subtitle">Ikhtisar akumulasi pemasukan, pengeluaran, dan saldo per bulan.</p>';
  summaryHTML += '</div>';
  summaryHTML += '<div class="monthly-summary-grid">';
  
  monthKeys.forEach(key => {
    const group = grouped[key];
    summaryHTML += `
      <div class="monthly-card">
        <div class="monthly-card-header">${group.name}</div>
        <div class="monthly-stats-list">
          <div class="stat-item">
            <span class="stat-label">Total Pemasukan</span>
            <span class="stat-value text-income font-medium">${formatRupiah(group.totalIncome)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Pengeluaran</span>
            <span class="stat-value text-expense font-medium">${formatRupiah(group.totalExpense)}</span>
          </div>
          <div class="stat-item border-top-dash">
            <span class="stat-label font-bold">Net Saldo</span>
            <span class="stat-value font-bold ${group.balance >= 0 ? 'text-income' : 'text-expense'}">${formatRupiah(group.balance)}</span>
          </div>
          <div class="stat-item meta-info">
            <span class="stat-label">Volume Transaksi</span>
            <span class="stat-value">${group.transactionCount} data (${group.proofCount} berbukti)</span>
          </div>
        </div>
      </div>
    `;
  });
  summaryHTML += '</div>';

  // 2. RENDER MAIN TRANSACTION TABLE
  let tableHTML = '<div class="section-header-inline" style="margin-top: 40px;">';
  tableHTML += '<h2 class="section-title">Log Buku Kas Finansial</h2>';
  tableHTML += '<p class="section-subtitle">Daftar rincian transaksi kas masuk dan keluar secara kronologis.</p>';
  tableHTML += '</div>';
  tableHTML += '<div class="card-box table-responsive" style="padding: 0;">'; // Wrapper box putih rapi
  tableHTML += '<table class="clean-table">';
  tableHTML += `
    <thead>
      <tr>
        <th>Tanggal</th>
        <th>Kategori</th>
        <th>Deskripsi</th>
        <th class="text-right">Pendapatan</th>
        <th class="text-right">Pengeluaran</th>
        <th class="text-right">Saldo Arus</th>
        <th class="text-center">Dokumen</th>
      </tr>
    </thead>
    <tbody>
  `;
  
  monthKeys.forEach(key => {
    const group = grouped[key];
    tableHTML += `
      <tr class="month-separator-row">
        <td colspan="7">
          <div class="month-separator-badge">${group.name}</div>
        </td>
      </tr>
    `;
    
    group.transactions.forEach(t => {
      tableHTML += `
        <tr>
          <td style="white-space: nowrap;">${formatDate(t.date)}</td>
          <td><span class="badge-category">${t.category}</span></td>
          <td class="text-description">${t.description}</td>
          <td class="text-right text-income font-medium">${t.income > 0 ? formatRupiah(t.income) : '-'}</td>
          <td class="text-right text-expense font-medium">${t.expense > 0 ? formatRupiah(t.expense) : '-'}</td>
          <td class="text-right text-balance font-medium">${formatRupiah(t.balance)}</td>
          <td class="text-center">
            ${t.proofUrl ? `<a href="${t.proofUrl}" target="_blank" class="btn-proof-link">Lihat Bukti</a>` : '<span class="no-proof">-</span>'}
          </td>
        </tr>
      `;
    });
  });
  tableHTML += '</tbody></table></div>';

  container.innerHTML = summaryHTML + tableHTML;
}

document.addEventListener('DOMContentLoaded', initTransactions);