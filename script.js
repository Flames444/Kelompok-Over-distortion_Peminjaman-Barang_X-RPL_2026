// script.js - Cleaned: Functions moved to data.js
// Only event listeners remain

// Listen for data changes across tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'sistemPeminjaman_v3') {
        window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
});

window.addEventListener('dataUpdated', () => {
    if (window.renderPage) {
        window.renderPage();
    }
});

console.log('✅ script.js cleaned - Only listeners');

