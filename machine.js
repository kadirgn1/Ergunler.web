(() => {
  'use strict';

  const ui = window.ErgunlerUI;
  if (!ui) return;

  const { qs, qsa, normTR, prefersReducedMotion } = ui;

  const escapeHTML = (value) => {
    if (value == null) return '';

    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  const initMachineParkuru = () => {
    const grid = qs('#machineGrid');
    if (!grid) return;

    const filterButtons = qsa('.filter-btn');
    const items = qsa('.machine-item', grid);
    const searchInput = qs('#machineSearch');
    const clearButton = qs('#machineClear');
    const resultEl = qs('#machineResult');

    const modalTitle = qs('#machineModalTitle');
    const modalBody = qs('#machineModalBody');
    const modalImg = qs('#machineModalImg');

    let activeFilter = 'all';
    let query = '';

    const itemText = (item) => {
      const title = qs('h4', item)?.textContent || '';
      const specs = qsa('.spec-pill', item).map((pill) => pill.textContent).join(' ');
      const category = item.getAttribute('data-cat') || '';
      return normTR(`${title} ${specs} ${category}`);
    };

    const updateButtonCounts = () => {
      const counts = { all: 0, hafriyat: 0, uretim: 0, lojistik: 0, destek: 0 };

      items.forEach((item) => {
        const matchesSearch = !query || itemText(item).includes(query);
        if (!matchesSearch) return;

        const category = item.getAttribute('data-cat') || '';
        counts.all += 1;

        if (counts[category] != null) counts[category] += 1;
      });

      filterButtons.forEach((button) => {
        const filter = button.getAttribute('data-filter') || 'all';
        const baseLabel =
          button.getAttribute('data-label') ||
          button.textContent.replace(/\s*\(\d+\)\s*$/, '').trim();

        button.setAttribute('data-label', baseLabel);
        button.textContent = `${baseLabel} (${counts[filter] ?? 0})`;
      });
    };

    const renderEmptyState = (show) => {
      const emptyId = 'machineEmpty';
      let emptyEl = qs(`#${emptyId}`);

      if (show) {
        if (!emptyEl) {
          emptyEl = document.createElement('div');
          emptyEl.id = emptyId;
          emptyEl.className = 'col-12';
          emptyEl.innerHTML = `
            <div class="content-card text-center p-4">
              <div class="fw-bold mb-1">Sonuç bulunamadı</div>
              <div class="text-muted">Filtreyi değiştir veya aramayı temizle.</div>
            </div>
          `;
          grid.appendChild(emptyEl);
        }
      } else if (emptyEl) {
        emptyEl.remove();
      }
    };

    const fillModalFromItem = (item) => {
      if (!item) return;

      const card = qs('.machine-card', item);
      if (!card) return;

      const title = qs('h4', card)?.textContent?.trim() || 'Ekipman Detayı';
      if (modalTitle) modalTitle.textContent = title;

      const rowsHtml = qsa('.spec-pill', card).map((pill) => {
        const label = qs('.spec-label', pill)?.textContent?.trim() || '';
        const value = qs('.spec-data', pill)?.textContent?.trim() || '';

        return `
          <tr>
            <td>${escapeHTML(label)}</td>
            <td class="fw-bold">${escapeHTML(value)}</td>
          </tr>
        `;
      }).join('');

      if (modalBody) {
        modalBody.innerHTML = rowsHtml || '<tr><td colspan="2" class="text-muted">Detay eklenmedi.</td></tr>';
      }

      const imageUrl = card.getAttribute('data-img') || item.getAttribute('data-img') || '';

      if (modalImg) {
        if (imageUrl) {
          modalImg.style.backgroundImage = `url("${String(imageUrl).replaceAll('"', '\\"')}")`;
          modalImg.classList.remove('is-empty');
        } else {
          modalImg.style.backgroundImage = 'none';
          modalImg.classList.add('is-empty');
        }
      }
    };

    const applyFilters = () => {
      let shown = 0;

      items.forEach((item) => {
        const category = item.getAttribute('data-cat');
        const matchesFilter = activeFilter === 'all' || category === activeFilter;
        const matchesSearch = !query || itemText(item).includes(query);
        const shouldShow = matchesFilter && matchesSearch;

        item.hidden = !shouldShow;

        if (shouldShow) {
          shown += 1;
          const card = qs('.machine-card', item);
          if (card && !prefersReducedMotion) {
            card.classList.remove('fade-in');
            void card.offsetWidth;
            card.classList.add('fade-in');
          }
        }
      });

      if (resultEl) resultEl.textContent = `${shown} ekipman grubu`;
      renderEmptyState(shown === 0);
      updateButtonCounts();
    };

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        filterButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');
        activeFilter = button.getAttribute('data-filter') || 'all';
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        query = normTR(searchInput.value).trim();
        applyFilters();
      });
    }

    if (clearButton) {
      clearButton.addEventListener('click', () => {
        activeFilter = 'all';
        query = '';

        if (searchInput) searchInput.value = '';

        filterButtons.forEach((btn) => btn.classList.remove('active'));
        const allButton = filterButtons.find((btn) => (btn.getAttribute('data-filter') || '') === 'all');
        if (allButton) allButton.classList.add('active');

        applyFilters();
        if (searchInput) searchInput.focus();
      });
    }

    qsa('.machine-card', grid).forEach((card) => {
      const handler = () => {
        const item = card.closest('.machine-item');
        fillModalFromItem(item);
      };

      card.addEventListener('click', handler);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          card.click();
        }
      });
    });

    updateButtonCounts();
    applyFilters();
  };

  window.ErgunlerMachine = {
    initMachineParkuru
  };
})();
