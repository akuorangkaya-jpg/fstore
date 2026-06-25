// Konfigurasi Google Sheets
// Ganti SHEET_ID dengan ID Google Sheets Anda
const CONFIG = {
  GOOGLE_SHEETS_ID: '1ylZBf1lpTnjn8mteIZQquyOOFm_8u6JleukxvQDqh1A',
  GOOGLE_SHEETS_URL: function() {
    return `https://docs.google.com/spreadsheets/d/${this.GOOGLE_SHEETS_ID}/export?format=csv`;
  },
  GOOGLE_SHEETS_EDIT_URL: function() {
    return `https://docs.google.com/spreadsheets/d/${this.GOOGLE_SHEETS_ID}/edit`;
  }
};
