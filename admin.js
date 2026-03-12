(() => {
  'use strict';

  /* =========================================================
     ERGÜNLER ADMIN JS
     - Haber CRUD
     - İçerik formları yönetimi
     - Yükleniyor durumları
     - Form doğrulama
     - Sekme hafızası
     - Değişiklik takibi
     - İstatistik güncelleme
     - Daha profesyonel bildirim sistemi
  ========================================================= */

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const endpoints = {
    getNews: 'get_news.php',
    saveNews: 'save_news.php',
    deleteNews: 'delete_news.php',
    getContent: 'get_content.php',
    saveContent: 'save_content.php'
  };

  const STORAGE_KEYS = {
    activeTab: 'ergunler_admin_active_tab',
    draftPrefix: 'ergunler_admin_draft_'
  };

  const state = {
    newsItems: [],
    dirtyForms: new Set(),
    loading: false
  };

  const formConfigs = [
    {
      formId: 'corporateForm',
      loadBtnId: 'loadCorporateBtn',
      group: 'corporate',
      label: 'Kurumsal'
    },
    {
      formId: 'facilitiesForm',
      loadBtnId: 'loadFacilitiesBtn',
      group: 'facilities',
      label: 'Tesisler'
    },
    {
      formId: 'whiteCalciteForm',
      loadBtnId: 'loadWhiteCalciteBtn',
      group: 'white_calcite',
      label: 'Beyaz Kalsit'
    },
    {
      formId: 'facilitiesAdvancedForm',
      loadBtnId: 'loadFacilitiesAdvancedBtn',
      group: 'facilities_advanced',
      label: 'Gelişmiş Tesisler'
    }
  ];

  const newsForm = qs('#newsForm');
  const newsIdHidden = qs('#newsIdHidden');
  const newsTitle = qs('#newsTitle');
  const newsCategory = qs('#newsCategory');
  const newsDate = qs('#newsDate');
  const newsImage = qs('#newsImage');
  const newsExcerpt = qs('#newsExcerpt');
  const newsContent = qs('#newsContent');
  const resetFormBtn = qs('#resetFormBtn');
  const newsTableBody = qs('#adminNewsTableBody');
  const newsCount = qs('#newsCount');
  const newsCountBadge = qs('#newsCountBadge');

  const escapeHTML = (value) => {
    if (value == null) return '';
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  const formatDateTR = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const safeJSONParse = (raw, fallback = null) => {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const showAlert = (message, type = 'success') => {
    const rootId = 'adminToastRoot';
    let root = qs(`#${rootId}`);

    if (!root) {
      root = document.createElement('div');
      root.id = rootId;
      root.className = 'admin-toast-root';
      document.body.appendChild(root);
    }

    const toast = document.createElement('div');
    toast.className = `admin-toast is-${type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'error'}`;

    toast.innerHTML = `
      <div class="admin-toast-icon">
        <i class="bi ${
          type === 'success'
            ? 'bi-check-circle-fill'
            : type === 'warning'
            ? 'bi-exclamation-triangle-fill'
            : 'bi-x-circle-fill'
        }"></i>
      </div>
      <div class="admin-toast-body">
        <div class="admin-toast-title">${
          type === 'success' ? 'Başarılı' : type === 'warning' ? 'Uyarı' : 'Hata'
        }</div>
        <div class="admin-toast-text">${escapeHTML(message)}</div>
      </div>
      <button type="button" class="admin-toast-close" aria-label="Kapat">
        <i class="bi bi-x-lg"></i>
      </button>
    `;

    root.appendChild(toast);

    const closeToast = () => {
      toast.classList.add('is-leaving');
      window.setTimeout(() => toast.remove(), 220);
    };

    qs('.admin-toast-close', toast)?.addEventListener('click', closeToast);
    window.setTimeout(closeToast, 3200);
  };

  const setButtonLoading = (button, isLoading, loadingText = 'İşleniyor...') => {
    if (!button) return;

    if (isLoading) {
      if (!button.dataset.originalHtml) {
        button.dataset.originalHtml = button.innerHTML;
      }

      button.disabled = true;
      button.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        ${loadingText}
      `;
    } else {
      button.disabled = false;
      if (button.dataset.originalHtml) {
        button.innerHTML = button.dataset.originalHtml;
      }
    }
  };

  const apiJson = async (url, options = {}) => {
    const fetchOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    const response = await fetch(url, fetchOptions);

    let data = null;
    try {
      data = await response.json();
    } catch {
      throw new Error('Sunucudan geçerli JSON yanıtı alınamadı.');
    }

    if (!response.ok || data?.status !== 'success') {
      throw new Error(data?.message || 'İşlem başarısız.');
    }

    return data;
  };

  const updateNewsCounters = () => {
    const count = Array.isArray(state.newsItems) ? state.newsItems.length : 0;

    if (newsCount) {
      newsCount.textContent = `${count} kayıt`;
    }

    if (newsCountBadge) {
      newsCountBadge.textContent = `${count} haber`;
    }
  };

  const getNewsFormPayload = () => ({
    id: newsIdHidden?.value?.trim() || '',
    title: newsTitle?.value?.trim() || '',
    category: newsCategory?.value?.trim() || '',
    date: newsDate?.value?.trim() || '',
    image: newsImage?.value?.trim() || '',
    excerpt: newsExcerpt?.value?.trim() || '',
    content: newsContent?.value?.trim() || ''
  });

  const validateNewsPayload = (payload) => {
    if (!payload.title) return 'Haber başlığı zorunludur.';
    if (!payload.category) return 'Kategori zorunludur.';
    if (!payload.date) return 'Tarih zorunludur.';
    if (!payload.excerpt) return 'Kısa özet zorunludur.';
    if (payload.title.length < 3) return 'Başlık en az 3 karakter olmalıdır.';
    if (payload.excerpt.length < 10) return 'Kısa özet daha açıklayıcı olmalıdır.';
    return '';
  };

  const clearNewsForm = () => {
    if (!newsForm) return;
    newsForm.reset();

    if (newsIdHidden) {
      newsIdHidden.value = '';
    }

    newsForm.classList.remove('is-editing');
    state.dirtyForms.delete('newsForm');
    removeDraft('newsForm');
  };

  const fillNewsForm = (item) => {
    if (!item) return;

    if (newsIdHidden) newsIdHidden.value = item.id ?? '';
    if (newsTitle) newsTitle.value = item.title ?? '';
    if (newsCategory) newsCategory.value = item.category ?? '';
    if (newsDate) newsDate.value = item.date ?? '';
    if (newsImage) newsImage.value = item.image ?? '';
    if (newsExcerpt) newsExcerpt.value = item.excerpt ?? '';
    if (newsContent) newsContent.value = item.content ?? '';

    newsForm?.classList.add('is-editing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortNewsItems = (items) => {
    return [...items].sort((a, b) => {
      const aDate = new Date(a.date || 0).getTime();
      const bDate = new Date(b.date || 0).getTime();

      if (bDate !== aDate) return bDate - aDate;
      return Number(b.id || 0) - Number(a.id || 0);
    });
  };

  const renderNewsTable = (items) => {
    if (!newsTableBody) return;

    if (!Array.isArray(items) || !items.length) {
      newsTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-5">
            <div class="admin-empty-state">
              <i class="bi bi-inbox"></i>
              <div class="admin-empty-title">Henüz haber kaydı yok</div>
              <div class="admin-empty-text">Yeni haber ekleyerek listeyi oluşturmaya başlayabilirsin.</div>
            </div>
          </td>
        </tr>
      `;
      state.newsItems = [];
      updateNewsCounters();
      return;
    }

    state.newsItems = sortNewsItems(items);

    newsTableBody.innerHTML = state.newsItems
      .map((item) => {
        const isMissingImage = !item.image;
        const excerpt = (item.excerpt || '').trim();
        const shortExcerpt = excerpt.length > 120 ? `${excerpt.slice(0, 120)}…` : excerpt;

        return `
          <tr>
            <td>
              ${
                isMissingImage
                  ? `
                    <div class="admin-thumb admin-thumb-placeholder">
                      <i class="bi bi-image"></i>
                    </div>
                  `
                  : `
                    <img
                      src="${escapeHTML(item.image)}"
                      alt="${escapeHTML(item.title)}"
                      class="admin-thumb"
                      loading="lazy"
                    >
                  `
              }
            </td>

            <td>
              <div class="admin-table-title">${escapeHTML(item.title)}</div>
              <div class="admin-table-meta">
                <span class="admin-inline-badge">${escapeHTML(item.category || 'Kategori yok')}</span>
              </div>
              <div class="admin-table-desc">${escapeHTML(shortExcerpt || 'Özet yok')}</div>
            </td>

            <td>
              <div class="admin-date-cell">${escapeHTML(formatDateTR(item.date))}</div>
            </td>

            <td class="admin-actions">
              <div class="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary"
                  data-action="edit"
                  data-id="${escapeHTML(item.id)}"
                >
                  <i class="bi bi-pencil-square me-1"></i>Düzenle
                </button>

                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  data-action="delete"
                  data-id="${escapeHTML(item.id)}"
                >
                  <i class="bi bi-trash3 me-1"></i>Sil
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    updateNewsCounters();
  };

  const fetchNews = async () => {
    const result = await apiJson(endpoints.getNews, {
      headers: { Accept: 'application/json' }
    });

    return Array.isArray(result.data) ? result.data : [];
  };

  const refreshNewsTable = async () => {
    if (!newsTableBody) return;

    newsTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-5">
          <div class="admin-empty-state">
            <div class="spinner-border text-warning mb-3" role="status"></div>
            <div class="admin-empty-title">Haberler yükleniyor</div>
          </div>
        </td>
      </tr>
    `;

    try {
      const items = await fetchNews();
      renderNewsTable(items);
    } catch (error) {
      renderNewsTable([]);
      showAlert(error.message, 'error');
    }
  };

  const handleNewsSubmit = async (event) => {
    event.preventDefault();

    const submitBtn = qs('button[type="submit"]', newsForm);
    const payload = getNewsFormPayload();
    const validationError = validateNewsPayload(payload);

    if (validationError) {
      showAlert(validationError, 'warning');
      return;
    }

    try {
      setButtonLoading(submitBtn, true, 'Kaydediliyor...');
      const result = await apiJson(endpoints.saveNews, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showAlert(result.message || 'Haber kaydedildi.', 'success');
      clearNewsForm();
      await refreshNewsTable();
    } catch (error) {
      showAlert(error.message, 'error');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  };

  const handleNewsTableClick = async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.getAttribute('data-action');
    const id = button.getAttribute('data-id');
    if (!id) return;

    if (action === 'edit') {
      const item = state.newsItems.find((row) => String(row.id) === String(id));
      fillNewsForm(item);
      showAlert('Haber düzenleme modunda açıldı.', 'success');
      return;
    }

    if (action === 'delete') {
      const confirmed = window.confirm('Bu haberi silmek istediğine emin misin?');
      if (!confirmed) return;

      try {
        setButtonLoading(button, true, 'Siliniyor...');
        const result = await apiJson(endpoints.deleteNews, {
          method: 'POST',
          body: JSON.stringify({ id: Number(id) })
        });

        showAlert(result.message || 'Haber silindi.', 'success');
        await refreshNewsTable();
      } catch (error) {
        showAlert(error.message, 'error');
      } finally {
        setButtonLoading(button, false);
      }
    }
  };

  const serializeFormFields = (form) => {
    const data = {};
    qsa('input[id], textarea[id], select[id]', form).forEach((field) => {
      const key = field.id;
      if (!key) return;
      data[key] = field.value ?? '';
    });
    return data;
  };

  const fillFormFields = (form, values) => {
    if (!form || !values || typeof values !== 'object') return;

    qsa('input[id], textarea[id], select[id]', form).forEach((field) => {
      const key = field.id;
      if (!key) return;
      field.value = values[key] ?? '';
    });
  };

  const markFormDirty = (formId, isDirty = true) => {
    if (!formId) return;

    if (isDirty) {
      state.dirtyForms.add(formId);
    } else {
      state.dirtyForms.delete(formId);
    }

    const form = qs(`#${formId}`);
    form?.classList.toggle('is-dirty', state.dirtyForms.has(formId));
  };

  const saveDraft = (formId, data) => {
    try {
      localStorage.setItem(`${STORAGE_KEYS.draftPrefix}${formId}`, JSON.stringify(data));
    } catch {
      // sessiz geç
    }
  };

  const loadDraft = (formId) => {
    try {
      return safeJSONParse(localStorage.getItem(`${STORAGE_KEYS.draftPrefix}${formId}`), null);
    } catch {
      return null;
    }
  };

  const removeDraft = (formId) => {
    try {
      localStorage.removeItem(`${STORAGE_KEYS.draftPrefix}${formId}`);
    } catch {
      // sessiz geç
    }
  };

  const saveContentGroup = async (group, form) => {
    const data = serializeFormFields(form);

    return apiJson(endpoints.saveContent, {
      method: 'POST',
      body: JSON.stringify({ group, data })
    });
  };

  const loadContentGroup = async (group) => {
    const result = await apiJson(`${endpoints.getContent}?group=${encodeURIComponent(group)}`, {
      headers: { Accept: 'application/json' }
    });

    return result.data || {};
  };

  const bindDraftSupport = (form) => {
    if (!form) return;

    const formId = form.id;

    qsa('input[id], textarea[id], select[id]', form).forEach((field) => {
      field.addEventListener('input', () => {
        const data = serializeFormFields(form);
        saveDraft(formId, data);
        markFormDirty(formId, true);
      });
    });
  };

  const restoreDraftIfAny = (form) => {
    if (!form) return false;

    const draft = loadDraft(form.id);
    if (!draft) return false;

    const hasAnyValue = Object.values(draft).some((value) => String(value || '').trim() !== '');
    if (!hasAnyValue) return false;

    fillFormFields(form, draft);
    markFormDirty(form.id, true);
    return true;
  };

  const bindContentForms = () => {
    formConfigs.forEach((config) => {
      const form = qs(`#${config.formId}`);
      const loadBtn = qs(`#${config.loadBtnId}`);

      if (!form) return;

      bindDraftSupport(form);

      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitBtn = qs('button[type="submit"]', form);

        try {
          setButtonLoading(submitBtn, true, 'Kaydediliyor...');
          const result = await saveContentGroup(config.group, form);

          removeDraft(config.formId);
          markFormDirty(config.formId, false);

          showAlert(result.message || `${config.label} verisi kaydedildi.`, 'success');
        } catch (error) {
          showAlert(error.message, 'error');
        } finally {
          setButtonLoading(submitBtn, false);
        }
      });

      if (loadBtn) {
        loadBtn.addEventListener('click', async () => {
          try {
            setButtonLoading(loadBtn, true, 'Yükleniyor...');
            const data = await loadContentGroup(config.group);
            fillFormFields(form, data);

            saveDraft(config.formId, serializeFormFields(form));
            markFormDirty(config.formId, false);

            showAlert('Kayıtlı veri getirildi.', 'success');
          } catch (error) {
            showAlert(error.message, 'error');
          } finally {
            setButtonLoading(loadBtn, false);
          }
        });
      }

      restoreDraftIfAny(form);
    });
  };

  const bindNewsDraft = () => {
    if (!newsForm) return;

    qsa('input[id], textarea[id], select[id]', newsForm).forEach((field) => {
      field.addEventListener('input', () => {
        saveDraft('newsForm', getNewsFormPayload());
        markFormDirty('newsForm', true);
      });
    });

    const restored = restoreDraftIfAny(newsForm);
    if (restored) {
      const draft = loadDraft('newsForm');
      if (draft) {
        if (newsIdHidden) newsIdHidden.value = draft.id || '';
        if (newsTitle) newsTitle.value = draft.title || '';
        if (newsCategory) newsCategory.value = draft.category || '';
        if (newsDate) newsDate.value = draft.date || '';
        if (newsImage) newsImage.value = draft.image || '';
        if (newsExcerpt) newsExcerpt.value = draft.excerpt || '';
        if (newsContent) newsContent.value = draft.content || '';
      }
    }
  };

  const persistActiveTab = () => {
    const tabButtons = qsa('#adminTabs [data-bs-toggle="tab"]');
    if (!tabButtons.length) return;

    tabButtons.forEach((button) => {
      button.addEventListener('shown.bs.tab', (event) => {
        const targetId = event.target.getAttribute('data-bs-target') || '';
        if (!targetId) return;

        try {
          localStorage.setItem(STORAGE_KEYS.activeTab, targetId);
        } catch {
          // sessiz geç
        }
      });
    });
  };

  const restoreActiveTab = () => {
    const savedTab = (() => {
      try {
        return localStorage.getItem(STORAGE_KEYS.activeTab);
      } catch {
        return '';
      }
    })();

    if (!savedTab) return;

    const trigger = qs(`#adminTabs [data-bs-target="${savedTab}"]`);
    if (!trigger || !window.bootstrap?.Tab) return;

    const tab = new bootstrap.Tab(trigger);
    tab.show();
  };

  const bindKeyboardShortcuts = () => {
    document.addEventListener('keydown', (event) => {
      const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
      if (!isSaveShortcut) return;

      const activePane = qs('.tab-pane.active.show');
      if (!activePane) return;

      const activeForm = qs('form', activePane);
      if (!activeForm) return;

      event.preventDefault();

      const submitBtn = qs('button[type="submit"]', activeForm);
      submitBtn?.click();
    });
  };

  const bindBeforeUnloadWarning = () => {
    window.addEventListener('beforeunload', (event) => {
      if (!state.dirtyForms.size) return;

      event.preventDefault();
      event.returnValue = '';
    });
  };

  const initNewsForm = () => {
    if (newsForm) {
      newsForm.addEventListener('submit', handleNewsSubmit);
    }

    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', () => {
        const confirmed = window.confirm('Formu temizlemek istediğine emin misin?');
        if (!confirmed) return;

        clearNewsForm();
        showAlert('Haber formu temizlendi.', 'success');
      });
    }

    if (newsTableBody) {
      newsTableBody.addEventListener('click', handleNewsTableClick);
    }

    bindNewsDraft();
  };

  const init = async () => {
    initNewsForm();
    bindContentForms();
    persistActiveTab();
    restoreActiveTab();
    bindKeyboardShortcuts();
    bindBeforeUnloadWarning();

    await refreshNewsTable();

    const hasDrafts =
      !!loadDraft('newsForm') ||
      formConfigs.some((config) => !!loadDraft(config.formId));

    if (hasDrafts) {
      showAlert('Kaydedilmemiş taslak alanlar geri yüklendi.', 'warning');
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();