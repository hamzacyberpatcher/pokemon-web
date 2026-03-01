document.querySelector('.search-icon-btn').addEventListener('click', () => {
    const query = document.getElementById('headerSearch').value.toLowerCase().trim();
    if (query) {
        window.location.href = `pokepage.html?pokemon=${query}`;
    }
});

// Also allow pressing "Enter"
document.getElementById('headerSearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.toLowerCase().trim();
        if (query) window.location.href = `pokepage.html?pokemon=${query}`;
    }
});