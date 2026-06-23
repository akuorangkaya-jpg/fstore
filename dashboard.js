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
    <div class="card income">
      <h3>Total Pendapatan</h3>
      <div class="amount">${formatRupiah(summary.totalIncome)}</div>
    </div>
    <div class="card expense">
      <h3>Total Pengeluaran</h3>
      <div class="amount">${formatRupiah(summary.totalExpense)}</div>
    </div>
    <div class="card balance">
      <h3>Saldo Saat Ini</h3>
      <div class="amount">${formatRupiah(summary.balance)}</div>
    </div>
  `;
}

function renderChart(monthlyCashflow) {
  const container = document.getElementById('chartContainer');
  if (monthlyCashflow.length === 0) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'block';

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
          backgroundColor: '#75c900',
          borderRadius: 8,
          borderSkipped: false
        },
        {
          label: 'Pengeluaran',
          data: monthlyCashflow.map(m => m.expense),
          backgroundColor: '#ff6b1a',
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              family: 'Inter',
              size: 14
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
              family: 'Inter'
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: 'Inter'
            }
          }
        }
      }
    }
  });
}

function renderRecentTransactions(transactions) {
  const container = document.getElementById('recentTransactionsContainer');
  if (transactions.length === 0) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'block';

  const tbody = document.querySelector('#recentTransactionsTable tbody');
  tbody.innerHTML = transactions.map(t => `
    <tr>
      <td>${formatDate(t.date)}</td>
      <td>${t.category}</td>
      <td>${t.description}</td>
      <td class="income-text">${t.income > 0 ? formatRupiah(t.income) : '-'}</td>
      <td class="expense-text">${t.expense > 0 ? formatRupiah(t.expense) : '-'}</td>
    </tr>
  `).join('');
}

document.addEventListener('DOMContentLoaded', initDashboard);
