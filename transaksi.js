let allTransactions = [];

async function initTransactions() {
  allTransactions = calculateRunningBalance(await fetchTransactions());

  // Update last updated
  document.getElementById('lastUpdated').textContent = `Terakhir diperbarui: ${new Date().toLocaleString('id-ID')}`;

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

  container.innerHTML = `
    <table>
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
        ${transactions.map(t => `
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
        `).join('')}
      </tbody>
    </table>
  `;
}

document.addEventListener('DOMContentLoaded', initTransactions);
