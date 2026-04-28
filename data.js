// Centralized Local Storage Data Manager - Fixed 6 Items Only
const DATA_KEY = 'sistemPeminjaman_v3';  // Bumped version for clean reset

// Fixed 6 items - NO ADDITIONS
const DEFAULT_ITEMS = [
    { id: 1, name: 'Kabel VGA', code: 'VGA001', image: 'https://images.unsplash.com/photo-1587202372775-989a3a3f5b1c?auto=format&fit=crop&w=400&q=60', status: 'available', room: '', borrower: '', borrowDate: '', expectedReturnDate: '' },
    { id: 2, name: 'Kabel HDMI', code: 'HDMI001', image: 'https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&w=400&q=60', status: 'available', room: '', borrower: '', borrowDate: '', expectedReturnDate: '' },
    { id: 3, name: 'Kabel Olor', code: 'PWR001', image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=400&q=60', status: 'available', room: '', borrower: '', borrowDate: '', expectedReturnDate: '' },
    { id: 4, name: 'Mikrofon', code: 'MIC001', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=60', status: 'available', room: '', borrower: '', borrowDate: '', expectedReturnDate: '' },
    { id: 5, name: 'Proyektor', code: 'PRJ001', image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=400&q=60', status: 'available', room: '', borrower: '', borrowDate: '', expectedReturnDate: '' },
    { id: 6, name: 'Baterai CAS', code: 'BAT001', image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=60', status: 'available', room: '', borrower: '', borrowDate: '', expectedReturnDate: '' }
];

let cachedData = { items: DEFAULT_ITEMS, history: [] };

// Integrity check
function isDataValid(data) {
    return data.items && Array.isArray(data.items) && data.items.length === 6 &&
        data.items.every(i => i.id >= 1 && i.id <= 6 && ['available', 'borrowed'].includes(i.status)) &&
        data.history && Array.isArray(data.history);
}

// Improved init - no auto-reset unless corrupted
function initData(forceReset = false) {
    let stored = localStorage.getItem(DATA_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (isDataValid(parsed) && !forceReset) {
                cachedData = parsed;
                console.log('✅ Loaded valid stored data (6 items)');
                return;
            }
        } catch (e) {
            console.warn('❌ Corrupted data, resetting');
        }
    }
    // Reset to defaults
    cachedData = { items: [...DEFAULT_ITEMS], history: [] };
    saveData(cachedData);
    console.log('🔄 Reset to fixed 6 items');
}

// Get current data
window.getData = function () { return cachedData; };

// Save data
window.saveData = function (data) {
    if (!isDataValid(data)) {
        console.error('❌ Invalid data save blocked');
        return;
    }
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    cachedData = data;
    window.dispatchEvent(new CustomEvent('dataUpdated'));
};

// Core functions - SINGLE SOURCE
window.borrowItem = function (itemId, expectedReturnDate, borrowerName, borrowDateStr, room = '') {
    const data = window.getData();
    const item = data.items.find(i => i.id == itemId);
    if (item && item.status === 'available' && borrowerName) {
        const borrowDate = borrowDateStr ? new Date(borrowDateStr + 'T09:00:00').toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        item.status = 'borrowed';
        item.borrower = borrowerName;
        item.borrowDate = borrowDate;
        item.expectedReturnDate = expectedReturnDate;
        item.room = room;

        data.history.unshift({
            id: Date.now(),
            itemId: itemId,
            action: 'borrowed',
            borrower: borrowerName,
            room: room,
            borrowDate,
            expectedReturnDate,
            date: new Date().toISOString()
        });

        window.saveData(data);
        console.log(`✅ Borrowed item ${itemId}`);
    } else {
        console.error('❌ Cannot borrow: invalid item/status');
    }
};

window.returnItem = function (itemId) {
    const data = window.getData();
    const item = data.items.find(i => i.id == itemId);
    if (item && item.status === 'borrowed') {
        data.history.unshift({
            id: Date.now(),
            itemId: itemId,
            action: 'returned',
            borrower: item.borrower,
            borrowDate: item.borrowDate,
            expectedReturnDate: item.expectedReturnDate,
            date: new Date().toISOString()
        });
        item.status = 'available';
        item.borrower = '';
        item.borrowDate = '';
        item.expectedReturnDate = '';
        item.room = '';
        window.saveData(data);
        console.log(`✅ Returned item ${itemId}`);
    }
};

window.doBorrow = function (itemId) {
    const borrowerName = document.getElementById('borrowerName')?.value?.trim();
    const room = document.getElementById('room')?.value?.trim();
    const borrowDate = document.getElementById('borrowDate')?.value;
    const expectedReturnDate = document.getElementById('expectedReturnDate')?.value;

    if (!borrowerName || !borrowDate || !expectedReturnDate) {
        alert('❌ Lengkapi form peminjaman!');
        return;
    }
    if (new Date(borrowDate) > new Date(expectedReturnDate)) {
        alert('❌ Tanggal pengembalian harus setelah peminjaman!');
        return;
    }

    window.borrowItem(itemId, expectedReturnDate, borrowerName, borrowDate, room);

    // Clear form
    ['borrowerName', 'room', 'borrowDate', 'expectedReturnDate'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    alert('✅ Peminjaman berhasil disimpan!');
};

// Auto init
document.addEventListener('DOMContentLoaded', () => initData(false));

console.log('✅ data.js v3 loaded - Fixed 6 items, centralized functions, validation');

