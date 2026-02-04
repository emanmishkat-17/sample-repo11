// Simple contact manager using localStorage
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const contactsTableBody = document.querySelector('#contactsTable tbody');
  const contactModalEl = document.getElementById('contactModal');
  const contactModal = new bootstrap.Modal(contactModalEl);
  const contactModalLabel = document.getElementById('contactModalLabel');
  const searchInput = document.getElementById('searchInput');
  const emptyMsg = document.getElementById('emptyMsg');

  let contacts = loadContacts();
  renderContacts();

  // Events
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('contactId').value.trim();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const company = document.getElementById('company').value.trim();
    const notes = document.getElementById('notes').value.trim();

    if (!name || !email) return; // simple validation

    if (id) {
      // edit
      const idx = contacts.findIndex(c => c.id === id);
      if (idx !== -1) {
        contacts[idx] = { id, name, email, phone, company, notes };
      }
    } else {
      // add
      contacts.push({ id: generateId(), name, email, phone, company, notes });
    }
    saveContacts();
    renderContacts();
    contactForm.reset();
    contactModal.hide();
  });

  // Clear form when modal opens for Add
  document.getElementById('addBtn').addEventListener('click', () => {
    contactForm.reset();
    document.getElementById('contactId').value = '';
    contactModalLabel.textContent = 'Add Contact';
  });

  // Delegated actions for edit/delete
  contactsTableBody.addEventListener('click', (e) => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const id = tr.getAttribute('data-id');
    if (e.target.matches('.btn-delete')) {
      if (confirm('Delete this contact?')) {
        contacts = contacts.filter(c => c.id !== id);
        saveContacts();
        renderContacts();
      }
    } else if (e.target.matches('.btn-edit')) {
      const c = contacts.find(x => x.id === id);
      if (!c) return;
      document.getElementById('contactId').value = c.id;
      document.getElementById('name').value = c.name;
      document.getElementById('email').value = c.email;
      document.getElementById('phone').value = c.phone;
      document.getElementById('company').value = c.company;
      document.getElementById('notes').value = c.notes;
      contactModalLabel.textContent = 'Edit Contact';
      contactModal.show();
    }
  });

  searchInput.addEventListener('input', () => renderContacts(searchInput.value.trim()));

  // Helpers
  function renderContacts(filter = '') {
    contactsTableBody.innerHTML = '';
    const f = filter.toLowerCase();
    const visible = contacts.filter(c => {
      return [c.name, c.email, c.phone, c.company].join(' ').toLowerCase().includes(f);
    });

    if (visible.length === 0) {
      emptyMsg.style.display = 'block';
      const tr = document.createElement('tr');
      tr.className = 'empty-row';
      tr.innerHTML = '<td colspan="5">No matching contacts found.</td>';
      contactsTableBody.appendChild(tr);
      return;
    }

    emptyMsg.style.display = 'none';

    visible.forEach(c => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-id', c.id);
      tr.innerHTML = `
        <td>${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.email)}</td>
        <td>${escapeHtml(c.phone || '')}</td>
        <td>${escapeHtml(c.company || '')}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary btn-edit">Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-delete">Delete</button>
        </td>
      `;
      contactsTableBody.appendChild(tr);
    });
  }

  function loadContacts() {
    try {
      return JSON.parse(localStorage.getItem('contacts') || '[]');
    } catch (e) {
      return [];
    }
  }
  function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }
  function generateId() {
    return 'c_' + Math.random().toString(36).slice(2, 9);
  }
  function escapeHtml(s) {
    return (s || '').replace(/[&<>"]+/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  }
});
