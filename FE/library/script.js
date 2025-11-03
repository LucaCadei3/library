// ✅ CONFIGURAZIONE
const BASE_URL = 'http://172.16.0.31:3333/books';
let currentPage = 1;
let lastPage = 1;
let allBooks = [];

// ✅ FUNZIONE PRINCIPALE
async function fetchBooks(page = 1) {
  const tbody = document.querySelector("#table-body");
  tbody.innerHTML = `<tr><td colspan="5" class="loading">⏳ Caricamento pagina ${page}...</td></tr>`;

  try {
    // 🔹 Costruisco la URL corretta
    const url = `${BASE_URL}?page=${page}`;
    console.log("📡 Fetching:", url);

    const res = await fetch(url);
    const data = await res.json();

    // 🔹 Aggiorno i dati globali
    currentPage = data.meta.currentPage;
    lastPage = data.meta.lastPage;
    allBooks = data.data;

    // 🔹 Stampo la tabella e i pulsanti
    renderTable(allBooks);
    renderPagination(data.meta);

  } catch (err) {
    console.error("❌ Errore:", err);
    tbody.innerHTML = `<tr><td colspan="5" class="loading">Errore nel caricamento</td></tr>`;
  }
}

// ✅ RENDER TABELLA
function renderTable(books) {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  if (!books || books.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="loading">Nessun risultato trovato.</td></tr>`;
    return;
  }

  books.forEach(book => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${book.id}</td>
      <td>${book.title}</td>
      <td>${book.author?.name || "—"}</td>
      <td>${book.year || "—"}</td>
      <td>${book.isbn || "—"}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ✅ RENDER PAGINAZIONE
function renderPagination(meta) {
  document.getElementById("page-info").textContent = `Pagina ${meta.currentPage} di ${meta.lastPage}`;
  document.getElementById("prev").disabled = meta.currentPage === 1;
  document.getElementById("next").disabled = meta.currentPage === meta.lastPage;
}

// ✅ FILTRI LOCALI
function applyFilters() {
  const titleFilter = document.getElementById("filter-title").value.toLowerCase();
  const authorFilter = document.getElementById("filter-author").value.toLowerCase();

  const filtered = allBooks.filter(book =>
    book.title.toLowerCase().includes(titleFilter) &&
    (book.author?.name?.toLowerCase().includes(authorFilter) || "")
  );

  renderTable(filtered);
}

// ✅ EVENTI FILTRI
document.getElementById("filter-title").addEventListener("input", applyFilters);
document.getElementById("filter-author").addEventListener("input", applyFilters);
document.getElementById("reset").addEventListener("click", () => {
  document.getElementById("filter-title").value = "";
  document.getElementById("filter-author").value = "";
  renderTable(allBooks);
});

// ✅ EVENTI PAGINAZIONE
document.getElementById("prev").addEventListener("click", () => {
  if (currentPage > 1) fetchBooks(currentPage - 1);
});

document.getElementById("next").addEventListener("click", () => {
  if (currentPage < lastPage) fetchBooks(currentPage + 1);
});

// ✅ AVVIO
fetchBooks();
