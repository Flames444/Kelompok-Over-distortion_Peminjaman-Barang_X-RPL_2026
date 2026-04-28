// app.js - Rendering ONLY - Functions centralized in data.js

function getStatusColor(status) {
    const colors = {
        available: 'status-available',
        borrowed: 'status-borrowed',
        returned: 'status-returned'
    };
    return colors[status] || '';
}

// Safe data getter with fallback
function safeGetData() {
    try {
        if (typeof window.getData === 'function') {
            return window.getData();
        }
    } catch (e) {
        console.error('Error getting data:', e);
    }
    return { items: [], history: [] };
}

// Page rendering functions - use getData() from data.js
window.renderPinjamPage = function () {
    try {
        const data = safeGetData();
        const div = document.getElementById('availableItems');
        if (!div || !data.items?.length) {
            if (div) div.innerHTML = '<div class="card"><p>❌ Tidak ada barang tersedia</p></div>';
            return;
        }

        div.innerHTML = data.items
            .filter(i => i.status === 'available')
            .map(item => `
      <div class="card">
        <img src="${item.image || 'https://via.placeholder.com/200x150?text=' + encodeURIComponent(item.name)}" alt="${item.name}" style="width:100%; height:150px; object-fit:cover; border-radius:8px;">
        <h3>${item.name} (${item.code})</h3>
        <p class="item-room">${item.room ? 'Ruang: ' + item.room : ''}</p>
        <button onclick="doBorrow(${item.id})" style="background:#28a745; color:white; padding:12px 24px; border:none; border-radius:5px; font-size:16px; cursor:pointer; width:100%;">📥 PINJAM</button>
      </div>
    `).join('');
    } catch (e) {
        console.error('Error rendering pinjam page:', e);
    }
};

window.renderKembalikanPage = function () {
    try {
        const data = safeGetData();
        const tbody = document.querySelector('#borrowedTable tbody');
        if (!tbody) return;

        if (!data.items?.length) {
            tbody.innerHTML = '<tr><td colspan="7">✅ Semua barang sudah dikembalikan</td></tr>';
            return;
        }

        const borrowedItems = data.items.filter(i => i.status === 'borrowed');
        tbody.innerHTML = borrowedItems.length ? borrowedItems.map(item => `
      <tr class="status-borrowed">
        <td><img src="${item.image || 'https://via.placeholder.com/50?text=' + item.code}" alt="${item.name}"></td>
        <td>${item.code}</td>
        <td>${item.name}</td>
        <td>${item.borrower || '-'}</td>
        <td>${item.borrowDate ? new Date(item.borrowDate).toLocaleDateString('id-ID') : '-'}</td>
        <td>${item.expectedReturnDate ? new Date(item.expectedReturnDate).toLocaleDateString('id-ID') : '-'}</td>
        <td><button onclick="returnItem(${item.id})" class="return-btn">✅ Kembalikan</button></td>
      </tr>
    `).join('') : '<tr><td colspan="7">✅ Semua barang sudah dikembalikan</td></tr>';

        // Return history
        const historyTbody = document.querySelector('#returnHistoryTable tbody');
        if (historyTbody) {
            const returns = (data.history || []).filter(h => h.action === 'returned').slice(-10).reverse();
            historyTbody.innerHTML = returns.length ? returns.map(h => {
                const item = data.items.find(i => i.id == h.itemId);
                return `
      <tr>
        <td>${h.date ? new Date(h.date).toLocaleDateString('id-ID') : '-'}</td>
        <td>${item ? item.name + ' (' + item.code + ')' : 'Unknown'}</td>
        <td>${h.borrower || '-'}</td>
        <td>${h.borrowDate ? new Date(h.borrowDate).toLocaleDateString('id-ID') : '-'}</td>
        <td>${h.expectedReturnDate ? new Date(h.expectedReturnDate).toLocaleDateString('id-ID') : '-'}</td>
      </tr>
            `;
            }).join('') : '<tr><td colspan="5">Belum ada pengembalian</td></tr>';
        }
    } catch (e) {
        console.error('Error rendering kembalikan page:', e);
    }
};

window.renderDataPage = function () {
    try {
        const data = safeGetData();
        const totalEl = document.getElementById('totalItems');
        const availEl = document.getElementById('available');
        const borrowedEl = document.getElementById('borrowed');
        const returnedEl = document.getElementById('returned');
        if (totalEl) totalEl.textContent = data.items?.length || 0;
        if (availEl) availEl.textContent = data.items?.filter(i => i.status === 'available').length || 0;
        if (borrowedEl) borrowedEl.textContent = data.items?.filter(i => i.status === 'borrowed').length || 0;
        if (returnedEl) returnedEl.textContent = data.items?.filter(i => i.status === 'returned').length || 0;

        const itemsTable = document.getElementById('itemsTable');
        if (itemsTable) {
            itemsTable.innerHTML = data.items?.length ? data.items.map(item => `
        <tr class="${getStatusColor(item.status)}">
          <td>${item.code || '-'}</td>
          <td>${item.name || '-'}</td>
          <td>${item.room || '-'}</td>
          <td>${item.borrower || '-'}</td>
          <td><strong>${(item.status || '').toUpperCase()}</strong></td>
          <td>${item.borrowDate ? new Date(item.borrowDate).toLocaleDateString('id-ID') : '-'}</td>
          <td>${item.expectedReturnDate ? new Date(item.expectedReturnDate).toLocaleDateString('id-ID') : '-'}</td>
        </tr>
      `).join('') : '<tr><td colspan="7">No data</td></tr>';
        }

        const historyTable = document.getElementById('historyTable');
        if (historyTable) {
            const historyData = (data.history || []).slice(-20).reverse();
            historyTable.innerHTML = historyData.length ? historyData.map(h => {
                const item = data.items?.find(i => i.id == h.itemId);
                return `
        <tr class="${h.action === 'borrowed' ? 'status-borrowed' : 'status-returned'}">
          <td>${h.date ? new Date(h.date).toLocaleString('id-ID') : '-'}</td>
          <td><strong>${(h.action || '').toUpperCase()}</strong></td>
          <td>${item ? item.name + ' (' + item.code + ')' : '-'}</td>
          <td>${h.room || '-'}</td>
          <td>${h.borrower || '-'}</td>
          <td>${h.borrowDate ? new Date(h.borrowDate).toLocaleDateString('id-ID') : '-'}</td>
          <td>${h.expectedReturnDate ? new Date(h.expectedReturnDate).toLocaleDateString('id-ID') : '-'}</td>
        </tr>
            `;
            }).join('') : '<tr><td colspan="7">Tidak ada riwayat</td></tr>';
        }
    } catch (e) {
        console.error('Error rendering data page:', e);
    }
};

// Nav & auto-render
function updateActiveNav() {
    const navLinks = document.querySelectorAll('nav a');
    const currentPath = location.pathname.split('/').pop() || '1ajar.html';
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath) link.classList.add('active');
    });
}

// Inject nav styles
if (!document.querySelector('#app-nav-style')) {
    const style = document.createElement('style');
    style.id = 'app-nav-style';
    style.textContent = `
        nav { display: flex; gap: 10px; margin: 20px 0; padding: 10px; background: #f8f9fa; border-radius: 8px; flex-wrap: wrap; }
        nav a { padding: 10px 20px; background: #e9ecef; border-radius: 5px; text-decoration: none; color: #333; transition: all 0.3s; }
        nav a.active { background: #007bff; color: white; transform: translateY(-2px); }
        .item-room { color: #666; font-size: 0.9em; margin: 5px 0; }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', function () {
    updateActiveNav();
    const path = location.pathname.split('/').pop() || '1ajar.html';
    const handlers = {
        '1.pinjam.html': () => window.renderPinjamPage(),
        '1kembalikan.html': () => window.renderKembalikanPage(),
        '1data.html': () => window.renderDataPage()
    };
    window.renderPage = handlers[path];
    if (window.renderPage) setTimeout(window.renderPage, 100);

    window.addEventListener('storage', (e) => {
        if (e.key === 'sistemPeminjaman_v3') window.dispatchEvent(new CustomEvent('dataUpdated'));
    });
    window.addEventListener('dataUpdated', () => window.renderPage?.());
});

console.log('✅ app.js cleaned - Rendering only, 6 fixed items enforced');
