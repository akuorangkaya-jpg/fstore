let chart = null;

async function initDashboard() {
  const transactions = await fetchTransactions();
  const summary = calculateSummary(transactions);
  const monthlyCashflow = getMonthlyCashflow(transactions);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  // Update last updated
  const lastUpdatedElement = document.getElementById('lastUpdated');
  const latestDate = getLatestTransactionDate(transactions);
  if (latestDate) {
    lastUpdatedElement.textContent = `Terakhir diperbarui: ${formatDate(latestDate)}`;
  } else {
    lastUpdatedElement.textContent = 'Terakhir diperbarui: Belum tersedia';
  }

  renderSummaryCards(summary);
  renderChart(monthlyCashflow);
  renderRecentTransactions(recentTransactions);
}

function renderSummaryCards(summary) {
  const container = document.getElementById('summaryCards');
  container.innerHTML = `
    <div class="card card-summary income">
      <div class="card-summary-label">Total Pendapatan</div>
      <div class="card-summary-amount text-income">${formatRupiah(summary.totalIncome)}</div>
    </div>
    <div class="card card-summary expense">
      <div class="card-summary-label">Total Pengeluaran</div>
      <div class="card-summary-amount text-expense">${formatRupiah(summary.totalExpense)}</div>
    </div>
    <div class="card card-summary balance">
      <div class="card-summary-label">Saldo Saat Ini</div>
      <div class="card-summary-amount text-balance">${formatRupiah(summary.balance)}</div>
    </div>
  `;
}

function renderChart(monthlyCashflow) {
  const container = document.getElementById('chartContainer');
  if (monthlyCashflow.length === 0) {
    container.classList.add('hidden');
    return;
  }
  container.classList.remove('hidden');

  const ctx = document.getElementById('cashflowChart').getContext('2d');
  const labels = monthlyCashflow.map(m => {
    const [year, month] = m.month.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${months[parseInt(month) - 1]} ${year}`;
  });

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Pendapatan',
          data: monthlyCashflow.map(m => m.income),
          backgroundColor: '#0d9488', // Corporate Mint Green
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: 'Pengeluaran',
          data: monthlyCashflow.map(m => m.expense),
          backgroundColor: '#ef4444', // Soft Red / Coral untuk Pengeluaran
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Menyesuaikan tinggi kontainer CSS dengan lebih fleksibel
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true, // Bentuk legenda lingkaran agar lebih modern
            font: {
              family: 'Inter',
              size: 13,
              weight: '500'
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#f1f5f9'
          },
          ticks: {
            font: {
              family: 'Inter',
              size: 12
            },
            color: '#64748b'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: 'Inter',
              size: 12
            },
            color: '#64748b'
          }
        }
      }
    }
  });
}

function renderRecentTransactions(transactions) {
  const container = document.getElementById('recentTransactionsContainer');
  if (transactions.length === 0) {
    container.classList.add('hidden');
    return;
  }
  container.classList.remove('hidden');

  const tbody = document.querySelector('#recentTransactionsTable tbody');
  tbody.innerHTML = transactions.map(t => `
    <tr>
      <td>${formatDate(t.date)}</td>
      <td><span class="badge-category">${t.category}</span></td>
      <td>${t.description}</td>
      <td class="text-right text-income font-medium">${t.income > 0 ? formatRupiah(t.income) : '-'}</td>
      <td class="text-right text-expense font-medium">${t.expense > 0 ? formatRupiah(t.expense) : '-'}</td>
    </tr>
  `).join('');
}

document.addEventListener('DOMContentLoaded', initDashboard);