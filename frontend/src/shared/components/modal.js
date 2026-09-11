/**
 * Universal Modal Dialog Manager
 */

let activeModalCleanup = null;

export function openModal({ title = '', subtitle = '', contentHtml = '', size = 'medium', onClose = null }) {
  closeModal();

  let modalOverlay = document.getElementById('tm-modal-overlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'tm-modal-overlay';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="modal-dialog modal-${size}" role="dialog" aria-modal="true">
      <div class="modal-head">
        <div class="modal-title-group">
          ${subtitle ? `<p class="eyebrow">${subtitle}</p>` : ''}
          <h3>${title}</h3>
        </div>
        <button class="icon-button modal-close-btn" aria-label="Close modal">×</button>
      </div>
      <div class="modal-body">
        ${contentHtml}
      </div>
    </div>
  `;

  modalOverlay.classList.add('active');
  document.body.classList.add('modal-open');

  const closeBtn = modalOverlay.querySelector('.modal-close-btn');
  const close = () => {
    modalOverlay.classList.remove('active');
    document.body.classList.remove('modal-open');
    if (activeModalCleanup) {
      activeModalCleanup();
      activeModalCleanup = null;
    }
  };

  activeModalCleanup = () => {
    if (typeof onClose === 'function') onClose();
  };

  closeBtn?.addEventListener('click', close);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) close();
  });

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      close();
      window.removeEventListener('keydown', onKeyDown);
    }
  };
  window.addEventListener('keydown', onKeyDown);

  return modalOverlay.querySelector('.modal-dialog');
}

export function closeModal() {
  const modalOverlay = document.getElementById('tm-modal-overlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    modalOverlay.innerHTML = '';
  }
  document.body.classList.remove('modal-open');
  if (activeModalCleanup) {
    activeModalCleanup();
    activeModalCleanup = null;
  }
}
