// Data transaksi fallback (untuk tampilan contoh ketika sheet belum terhubung)
const SAMPLE_TRANSACTIONS = [
  {
    date: '2025-06-01',
    category: 'Pendapatan',
    description: 'Donasi anggota',
    income: 500000,
    expense: 0,
    notes: '',
    proofUrl: ''
  },
  {
    date: '2025-06-02',
    category: 'Pengeluaran',
    description: 'Beli perlengkapan kantor',
    income: 0,
    expense: 150000,
    notes: '',
    proofUrl: 'https://drive.google.com/file/d/example1'
  },
  {
    date: '2025-06-05',
    category: 'Pendapatan',
    description: 'Sponsor acara',
    income: 2000000,
    expense: 0,
    notes: '',
    proofUrl: ''
  },
  {
    date: '2025-06-10',
    category: 'Pengeluaran',
    description: 'Sewa venue',
    income: 0,
    expense: 750000,
    notes: '',
    proofUrl: 'https://drive.google.com/file/d/example2'
  },
  {
    date: '2025-06-15',
    category: 'Pendapatan',
    description: 'Penjualan merchandise',
    income: 800000,
    expense: 0,
    notes: '',
    proofUrl: ''
  },
  {
    date: '2025-06-20',
    category: 'Pengeluaran',
    description: 'Konsumsi acara',
    income: 0,
    expense: 300000,
    notes: '',
    proofUrl: 'https://drive.google.com/file/d/example3'
  },
  {
    date: '2025-05-05',
    category: 'Pendapatan',
    description: 'Donasi awal bulan',
    income: 1000000,
    expense: 0,
    notes: '',
    proofUrl: ''
  },
  {
    date: '2025-05-12',
    category: 'Pengeluaran',
    description: 'Listrik & internet',
    income: 0,
    expense: 250000,
    notes: '',
    proofUrl: 'https://drive.google.com/file/d/example4'
  },
  {
    date: '2025-05-25',
    category: 'Pendapatan',
    description: 'Iuran anggota',
    income: 600000,
    expense: 0,
    notes: '',
    proofUrl: ''
  },
  {
    date: '2025-05-28',
    category: 'Pengeluaran',
    description: 'Print materi',
    income: 0,
    expense: 100000,
    notes: '',
    proofUrl: 'https://drive.google.com/file/d/example5'
  }
];

// Fungsi untuk parsing CSV
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const transactions = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length >= 6) {
      transactions.push({
        date: values[0] || '',
        category: values[1] || '',
        description: values[2] || '',
        income: parseFloat(values[3]) || 0,
        expense: parseFloat(values[4]) || 0,
        notes: values[5] || '',
        proofUrl: values[6] || ''
      });
    }
  }

  return transactions;
}

// Fungsi untuk format mata uang Rupiah
function formatRupiah(amount) {
  return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Fungsi untuk format tanggal
function formatDate(dateString) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// Fungsi untuk fetch data dari Google Sheets
async function fetchTransactions() {
  try {
    const response = await fetch(CONFIG.GOOGLE_SHEETS_URL());
    if (!response.ok) throw new Error('Gagal mengambil data');
    const csvText = await response.text();
    const transactions = parseCSV(csvText);
    if (transactions.length === 0) return SAMPLE_TRANSACTIONS;
    return transactions;
  } catch (error) {
    console.warn('Menggunakan data sampel:', error);
    return SAMPLE_TRANSACTIONS;
  }
}

// Fungsi untuk menghitung ringkasan keuangan
function calculateSummary(transactions) {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(t => {
    totalIncome += t.income;
    totalExpense += t.expense;
  });

  const balance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, balance };
}

// Fungsi untuk menghitung saldo berjalan
function calculateRunningBalance(transactions) {
  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  let balance = 0;
  return sorted.map(t => {
    balance += t.income - t.expense;
    return { ...t, balance };
  });
}

// Fungsi untuk mendapatkan transaksi bulanan untuk chart
function getMonthlyCashflow(transactions) {
  const monthlyData = {};

  transactions.forEach(t => {
    const date = new Date(t.date);
    if (isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!monthlyData[key]) {
      monthlyData[key] = { income: 0, expense: 0 };
    }
    monthlyData[key].income += t.income;
    monthlyData[key].expense += t.expense;
  });

  const sortedKeys = Object.keys(monthlyData).sort();
  return sortedKeys.map(key => ({
    month: key,
    ...monthlyData[key]
  }));
}
