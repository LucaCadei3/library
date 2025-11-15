const BASE_URL = 'http://localhost:3333';
let currentPage = 1;
let lastPage = 1;
let allBooks = [];
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  fetchBooks();
  setupEventListeners();
  setTodayDate();
});

function setupEventListeners() {
  document.getElementById('show-login-btn').addEventListener('click', () => openModal('login-modal'));
  document.getElementById('show-register-btn').addEventListener('click', () => openModal('register-modal'));
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);

  document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', (e) => closeModal(e.target.dataset.modal));
  });

  document.getElementById('filter-title').addEventListener('input', applyFilters);
  document.getElementById('filter-author').addEventListener('input', applyFilters);
  document.getElementById('reset').addEventListener('click', resetFilters);

  document.getElementById('prev').addEventListener('click', () => {
    if (currentPage > 1) fetchBooks(currentPage - 1);
  });
  document.getElementById('next').addEventListener('click', () => {
    if (currentPage < lastPage) fetchBooks(currentPage + 1);
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
  });

  document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);

  if (document.getElementById('add-author-form')) {
    document.getElementById('add-author-form').addEventListener('submit', handleAddAuthor);
    document.getElementById('add-book-form').addEventListener('submit', handleAddBook);
  }

  document.getElementById('loan-form').addEventListener('submit', handleLoan);
}

function initAuth() {
  if (token && currentUser) {
    showUserInfo();
    document.getElementById('profile-tab').style.display = 'block';
    document.getElementById('loans-tab').style.display = 'block';
    
    if (currentUser.role === 'admin') {
      document.getElementById('admin-tab').style.display = 'block';
      loadAuthorsForSelect();
      fetchUsers();
    }
  } else {
    showLoginButtons();
  }
}

function showUserInfo() {
  document.getElementById('login-buttons').style.display = 'none';
  document.getElementById('user-info').style.display = 'flex';
  document.getElementById('user-name').textContent = currentUser.fullName || currentUser.email;
  
  const roleBadge = document.getElementById('user-role');
  roleBadge.textContent = currentUser.role === 'admin' ? '👑 Admin' : '👤 Utente';
  roleBadge.className = `badge ${currentUser.role}`;
}

function showLoginButtons() {
  document.getElementById('login-buttons').style.display = 'flex';
  document.getElementById('user-info').style.display = 'none';
  document.getElementById('loans-tab').style.display = 'none';
  document.getElementById('admin-tab').style.display = 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');

  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      errorDiv.textContent = data.error || 'Credenziali non valide';
      return;
    }

    token = data.token.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(currentUser));

    closeModal('login-modal');
    initAuth();
    fetchBooks();
    showNotification('✅ Login effettuato!', 'success');
  } catch (error) {
    errorDiv.textContent = 'Errore di connessione';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const fullName = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const errorDiv = document.getElementById('register-error');

  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      errorDiv.textContent = data.error || 'Errore durante la registrazione';
      return;
    }

    token = data.token.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(currentUser));

    closeModal('register-modal');
    initAuth();
    fetchBooks();
    showNotification('✅ Registrazione completata!', 'success');
  } catch (error) {
    errorDiv.textContent = 'Errore di connessione';
  }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showLoginButtons();
  switchTab('books');
  fetchBooks();
  showNotification('👋 Logout effettuato', 'info');
}

// BOOKS
async function fetchBooks(page = 1) {
  const tbody = document.querySelector("#table-body");
  tbody.innerHTML = `<tr><td colspan="7" class="loading">⏳ Caricamento...</td></tr>`;

  try {
    const response = await fetch(`${BASE_URL}/books?page=${page}`);
    const data = await response.json();

    currentPage = data.meta.currentPage;
    lastPage = data.meta.lastPage;
    allBooks = data.data;

    renderTable(allBooks);
    renderPagination(data.meta);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading">❌ Errore caricamento</td></tr>`;
  }
}

function renderTable(books) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  if (!books || books.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading">Nessun libro trovato</td></tr>`;
    return;
  }

  books.forEach(book => {
    const tr = document.createElement("tr");
    const statusBadge = book.available 
      ? '<span class="badge-success">✅ Disponibile</span>' 
      : '<span class="badge-danger">❌ In prestito</span>';
    
    let actions = '';
    if (token && book.available) {
      actions = `<button class="btn-sm btn-primary" onclick="openLoanModal(${book.id}, '${book.title.replace(/'/g, "\\'")}')">📖 Prendi</button>`;
    }
    if (currentUser && currentUser.role === 'admin') {
      actions += ` <button class="btn-sm btn-danger" onclick="deleteBook(${book.id})">🗑️</button>`;
    }

    tr.innerHTML = `
      <td>${book.id}</td>
      <td><strong>${book.title}</strong></td>
      <td>${book.author?.name || "—"}</td>
      <td>${book.year || "—"}</td>
      <td>${book.isbn || "—"}</td>
      <td>${statusBadge}</td>
      <td>${actions || '—'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderPagination(meta) {
  document.getElementById("page-info").textContent = `Pagina ${meta.currentPage} di ${meta.lastPage}`;
  document.getElementById("prev").disabled = meta.currentPage === 1;
  document.getElementById("next").disabled = meta.currentPage === meta.lastPage;
}

function applyFilters() {
  const titleFilter = document.getElementById("filter-title").value.toLowerCase();
  const authorFilter = document.getElementById("filter-author").value.toLowerCase();

  const filtered = allBooks.filter(book =>
    book.title.toLowerCase().includes(titleFilter) &&
    (book.author?.name?.toLowerCase().includes(authorFilter) || false)
  );

  renderTable(filtered);
}

function resetFilters() {
  document.getElementById("filter-title").value = "";
  document.getElementById("filter-author").value = "";
  renderTable(allBooks);
}

// LOANS
async function fetchLoans() {
  if (!token) return;

  const tbody = document.getElementById('loans-body');
  tbody.innerHTML = '<tr><td colspan="5" class="loading">⏳ Caricamento...</td></tr>';

  try {
    const response = await fetch(`${BASE_URL}/loans`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    renderLoans(data.data);
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">❌ Errore</td></tr>';
  }
}

function renderLoans(loans) {
  const tbody = document.getElementById('loans-body');
  tbody.innerHTML = '';

  if (!loans || loans.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Nessun prestito</td></tr>';
    return;
  }

  loans.forEach(loan => {
    const tr = document.createElement('tr');
    const statusBadge = loan.returned 
      ? '<span class="badge-success">✅ Restituito</span>'
      : '<span class="badge-warning">📖 In corso</span>';
    
    const actions = !loan.returned 
      ? `<button class="btn-sm btn-primary" onclick="returnBook(${loan.id})">↩️ Restituisci</button>`
      : '—';

    tr.innerHTML = `
      <td>${loan.book?.title || 'N/D'}</td>
      <td>${new Date(loan.loan_date).toLocaleDateString()}</td>
      <td>${loan.return_date ? new Date(loan.return_date).toLocaleDateString() : '—'}</td>
      <td>${statusBadge}</td>
      <td>${actions}</td>
    `;
    tbody.appendChild(tr);
  });
}

function openLoanModal(bookId, bookTitle) {
  if (!token) {
    showNotification('⚠️ Devi effettuare il login', 'warning');
    openModal('login-modal');
    return;
  }

  document.getElementById('loan-book-id').value = bookId;
  document.getElementById('loan-book-title').textContent = `Libro: ${bookTitle}`;
  openModal('loan-modal');
}

async function handleLoan(e) {
  e.preventDefault();
  const bookId = document.getElementById('loan-book-id').value;
  const loanDate = document.getElementById('loan-date').value;
  const errorDiv = document.getElementById('loan-error');

  try {
    const response = await fetch(`${BASE_URL}/loans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ book_id: parseInt(bookId), loan_date: loanDate })
    });

    const data = await response.json();

    if (!response.ok) {
      errorDiv.textContent = data.error || 'Errore';
      return;
    }

    closeModal('loan-modal');
    fetchBooks(currentPage);
    showNotification('✅ Prestito creato!', 'success');
  } catch (error) {
    errorDiv.textContent = 'Errore di connessione';
  }
}

async function returnBook(loanId) {
  showConfirmDialog(
    '↩️ Restituisci Libro',
    'Sei sicuro di voler restituire questo libro?',
    async () => {
      try {
        const response = await fetch(`${BASE_URL}/loans/${loanId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            returned: true, 
            return_date: new Date().toISOString().split('T')[0]
          })
        });

        if (response.ok) {
          fetchLoans();
          fetchBooks(currentPage);
          showNotification('✅ Libro restituito!', 'success');
        }
      } catch (error) {
        showNotification('❌ Errore', 'error');
      }
    }
  );
}

// ADMIN
async function loadAuthorsForSelect() {
  try {
    const response = await fetch(`${BASE_URL}/authors`);
    const data = await response.json();
    
    const select = document.getElementById('book-author');
    select.innerHTML = '<option value="">Seleziona autore...</option>';
    
    data.data.forEach(author => {
      const option = document.createElement('option');
      option.value = author.id;
      option.textContent = author.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Errore caricamento autori:', error);
  }
}

async function handleAddAuthor(e) {
  e.preventDefault();
  const name = document.getElementById('author-name').value;
  const bio = document.getElementById('author-bio').value;

  try {
    const response = await fetch(`${BASE_URL}/authors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, bio })
    });

    if (response.ok) {
      e.target.reset();
      loadAuthorsForSelect();
      showNotification('✅ Autore aggiunto!', 'success');
    }
  } catch (error) {
    showNotification('❌ Errore', 'error');
  }
}

async function handleAddBook(e) {
  e.preventDefault();
  const title = document.getElementById('book-title').value;
  const isbn = document.getElementById('book-isbn').value;
  const authorId = document.getElementById('book-author').value;
  const year = document.getElementById('book-year').value;

  try {
    const response = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        title, 
        isbn, 
        author_id: parseInt(authorId), 
        year: year ? parseInt(year) : null,
        available: true 
      })
    });

    if (response.ok) {
      e.target.reset();
      fetchBooks(currentPage);
      showNotification('✅ Libro aggiunto!', 'success');
    }
  } catch (error) {
    showNotification('❌ Errore', 'error');
  }
}

async function deleteBook(bookId) {
  showConfirmDialog(
    '🗑️ Elimina Libro',
    'Sei sicuro di voler eliminare questo libro? L\'azione è irreversibile.',
    async () => {
      try {
        const response = await fetch(`${BASE_URL}/books/${bookId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          fetchBooks(currentPage);
          showNotification('✅ Libro eliminato', 'success');
        }
      } catch (error) {
        showNotification('❌ Errore', 'error');
      }
    }
  );
}

// PROFILE
function loadProfileData() {
  if (!currentUser) return;
  
  document.getElementById('profile-name').value = currentUser.full_name || '';
  document.getElementById('profile-email').value = currentUser.email || '';
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const fullName = document.getElementById('profile-name').value;
  const email = document.getElementById('profile-email').value;
  const password = document.getElementById('profile-password').value;
  const errorDiv = document.getElementById('profile-error');
  const successDiv = document.getElementById('profile-success');

  errorDiv.textContent = '';
  successDiv.textContent = '';

  try {
    const body = {
      full_name: fullName,
      email: email
    };

    if (password) {
      body.password = password;
    }

    const response = await fetch(`${BASE_URL}/users/${currentUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      errorDiv.textContent = data.error || 'Errore durante l\'aggiornamento';
      return;
    }

    currentUser = data;
    localStorage.setItem('user', JSON.stringify(currentUser));
    document.getElementById('user-name').textContent = currentUser.full_name || currentUser.email;
    
    document.getElementById('profile-password').value = '';
    successDiv.textContent = '✅ Profilo aggiornato con successo!';
    
    setTimeout(() => {
      successDiv.textContent = '';
    }, 3000);
  } catch (error) {
    errorDiv.textContent = 'Errore di connessione';
  }
}

// ADMIN - USERS
async function fetchUsers() {
  if (!token || currentUser.role !== 'admin') return;

  const tbody = document.getElementById('users-body');
  tbody.innerHTML = '<tr><td colspan="5" class="loading">⏳ Caricamento...</td></tr>';

  try {
    const response = await fetch(`${BASE_URL}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    renderUsers(data.data || data);
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">❌ Errore caricamento</td></tr>';
  }
}

function renderUsers(users) {
  const tbody = document.getElementById('users-body');
  tbody.innerHTML = '';

  if (!users || users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Nessun utente</td></tr>';
    return;
  }

  users.forEach(user => {
    const tr = document.createElement('tr');
    const roleBadge = user.role === 'admin' 
      ? '<span class="badge-danger">👑 Admin</span>'
      : '<span class="badge-success">👤 Utente</span>';
    
    let actions = '';
    
    if (user.id !== currentUser.id) {
      const toggleRoleBtn = user.role === 'admin'
        ? `<button class="btn-sm btn-warning" onclick="changeUserRole(${user.id}, 'user')">⬇️ Declassa</button>`
        : `<button class="btn-sm btn-success" onclick="changeUserRole(${user.id}, 'admin')">⬆️ Promuovi</button>`;
      
      actions = `${toggleRoleBtn} <button class="btn-sm btn-danger" onclick="deleteUser(${user.id})">🗑️ Elimina</button>`;
    } else {
      actions = '—';
    }

    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.full_name}</td>
      <td>${user.email}</td>
      <td>${roleBadge}</td>
      <td>${actions}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteUser(userId) {
  showConfirmDialog(
    '🗑️ Elimina Utente',
    'Sei sicuro di voler eliminare questo utente? L\'azione è irreversibile.',
    async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          fetchUsers();
          showNotification('✅ Utente eliminato', 'success');
        } else {
          showNotification('❌ Errore eliminazione', 'error');
        }
      } catch (error) {
        showNotification('❌ Errore di connessione', 'error');
      }
    }
  );
}

async function changeUserRole(userId, newRole) {
  const title = newRole === 'admin' ? '⬆️ Promuovi Utente' : '⬇️ Declassa Admin';
  const message = newRole === 'admin' 
    ? 'Sei sicuro di voler promuovere questo utente a admin? Avrà accesso a tutte le funzioni di gestione.'
    : 'Sei sicuro di voler declassare questo admin a utente normale? Perderà i privilegi di amministratore.';
  
  showConfirmDialog(
    title,
    message,
    async () => {
      try {
        const response = await fetch(`${BASE_URL}/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: newRole })
        });

        const data = await response.json();

        if (response.ok) {
          fetchUsers();
          showNotification(newRole === 'admin' ? '✅ Utente promosso!' : '✅ Utente declassato', 'success');
        } else {
          showNotification(data.error || '❌ Errore', 'error');
        }
      } catch (error) {
        showNotification('❌ Errore di connessione', 'error');
      }
    }
  );
}

// UTILS
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab-content`).classList.add('active');

  if (tabName === 'loans') fetchLoans();
  if (tabName === 'profile') loadProfileData();
  if (tabName === 'admin') fetchUsers();
}

function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
}

function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('loan-date').value = today;
}

function showConfirmDialog(title, message, onConfirm) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  
  const confirmBtn = document.getElementById('confirm-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  
  confirmBtn.replaceWith(confirmBtn.cloneNode(true));
  cancelBtn.replaceWith(cancelBtn.cloneNode(true));
  
  document.getElementById('confirm-btn').addEventListener('click', () => {
    closeModal('confirm-modal');
    onConfirm();
  });
  
  document.getElementById('cancel-btn').addEventListener('click', () => {
    closeModal('confirm-modal');
  });
  
  openModal('confirm-modal');
}

function showNotification(message, type = 'info') {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const notif = document.createElement('div');
  notif.className = `notification notification-${type}`;
  notif.innerHTML = `
    <span class="notification-icon">${icons[type] || '📢'}</span>
    <span class="notification-text">${message}</span>
    <button class="notification-close">✕</button>
  `;
  
  document.body.appendChild(notif);

  notif.querySelector('.notification-close').addEventListener('click', () => {
    closeNotification(notif);
  });

  setTimeout(() => {
    notif.classList.add('show');
  }, 10);

  setTimeout(() => {
    closeNotification(notif);
  }, 4000);

  function closeNotification(element) {
    element.classList.add('hide');
    setTimeout(() => {
      element.remove();
    }, 300);
  }
}

window.onclick = (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
};