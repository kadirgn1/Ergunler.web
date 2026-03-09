(() => {
  'use strict';

  /* ---------------------------
     Helpers
  --------------------------- */
  const qs = (selector, root = document) => root.querySelector(selector);

  const normalizeText = (value) => String(value ?? '').trim();

  const slugify = (text) => {
    return String(text ?? '')
      .toLowerCase()
      .trim()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const safeParse = (value, fallback) => {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error('JSON parse hatası:', error);
      return fallback;
    }
  };

  const escapeHTML = (value) => {
    if (value == null) return '';

    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  const isSafeImageUrl = (url) => {
    if (!url) return true;

    const value = String(url).trim().toLowerCase();
    return (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('./') ||
      value.startsWith('../') ||
      value.startsWith('images/') ||
      value.startsWith('/images/')
    );
  };

  const showMessage = (text) => {
    window.alert(text);
  };

  const getMergedStorageData = (storageKey, defaults) => {
    const parsed = safeParse(localStorage.getItem(storageKey), null);
    return parsed ? { ...defaults, ...parsed } : { ...defaults };
  };

  const fillFieldsFromData = (defaults, data, fieldMap = {}) => {
    Object.keys(defaults).forEach((storageKey) => {
      const fieldId = fieldMap[storageKey] || storageKey;
      const element = qs(`#${fieldId}`);

      if (element) {
        element.value = data[storageKey] || '';
      }
    });
  };

  const collectFields = (defaults, fieldMap = {}) => {
    const payload = {};

    Object.keys(defaults).forEach((storageKey) => {
      const fieldId = fieldMap[storageKey] || storageKey;
      const element = qs(`#${fieldId}`);
      payload[storageKey] = element ? normalizeText(element.value) : '';
    });

    return payload;
  };

  const bindLoadButton = (buttonSelector, handler) => {
    const button = qs(buttonSelector);
    if (button) {
      button.addEventListener('click', handler);
    }
  };

  const setupSimpleContentForm = ({
    formSelector,
    storageKey,
    defaults,
    loadButtonSelector,
    successMessage,
    fieldMap = {}
  }) => {
    const form = qs(formSelector);
    if (!form) return;

    const fillForm = () => {
      const data = getMergedStorageData(storageKey, defaults);
      fillFieldsFromData(defaults, data, fieldMap);
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const payload = collectFields(defaults, fieldMap);
      localStorage.setItem(storageKey, JSON.stringify(payload));
      showMessage(successMessage);
    });

    bindLoadButton(loadButtonSelector, fillForm);
    fillForm();
  };

  /* ---------------------------
     1) News Management
  --------------------------- */
  (() => {
    const STORAGE_KEY = 'ergunler_admin_news';

    const form = qs('#newsForm');
    if (!form) return;

    const newsIdHidden = qs('#newsIdHidden');
    const newsTitle = qs('#newsTitle');
    const newsCategory = qs('#newsCategory');
    const newsDate = qs('#newsDate');
    const newsImage = qs('#newsImage');
    const newsExcerpt = qs('#newsExcerpt');
    const newsContent = qs('#newsContent');
    const resetFormBtn = qs('#resetFormBtn');
    const tableBody = qs('#adminNewsTableBody');
    const newsCount = qs('#newsCount');

    const getStoredNews = () => {
      const parsed = safeParse(localStorage.getItem(STORAGE_KEY), []);
      return Array.isArray(parsed) ? parsed : [];
    };

    const saveStoredNews = (items) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    };

    const sortNews = (items) => {
      return [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const generateUniqueId = (baseSlug, items, currentId = '') => {
      const cleanBase = slugify(baseSlug) || `haber-${Date.now()}`;
      let candidate = cleanBase;
      let counter = 2;

      while (items.some((item) => item.id === candidate && item.id !== currentId)) {
        candidate = `${cleanBase}-${counter}`;
        counter += 1;
      }

      return candidate;
    };

    const clearForm = () => {
      newsIdHidden.value = '';
      form.reset();
    };

    const fillForm = (item) => {
      newsIdHidden.value = item.id || '';
      newsTitle.value = item.title || '';
      newsCategory.value = item.category || '';
      newsDate.value = item.date || '';
      newsImage.value = item.image || '';
      newsExcerpt.value = item.excerpt || '';
      newsContent.value = item.content || '';

      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const createPlaceholderThumb = () => {
      const div = document.createElement('div');
      div.style.width = '90px';
      div.style.height = '60px';
      div.style.background = '#eee';
      div.style.borderRadius = '10px';
      return div;
    };

    const createActionButton = (text, className, id) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = className;
      button.dataset.id = id;
      button.textContent = text;
      return button;
    };

    const renderEmptyState = () => {
      const row = document.createElement('tr');
      const cell = document.createElement('td');

      cell.colSpan = 4;
      cell.className = 'text-center text-muted py-4';
      cell.textContent = 'Henüz kayıt yok.';

      row.appendChild(cell);
      tableBody.appendChild(row);
    };

    const renderRow = (item) => {
      const row = document.createElement('tr');

      const imageCell = document.createElement('td');
      if (item.image && isSafeImageUrl(item.image)) {
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title || 'Haber görseli';
        img.width = 90;
        img.height = 60;
        img.loading = 'lazy';
        img.className = 'admin-thumb';
        imageCell.appendChild(img);
      } else {
        imageCell.appendChild(createPlaceholderThumb());
      }

      const infoCell = document.createElement('td');

      const titleDiv = document.createElement('div');
      titleDiv.className = 'fw-bold';
      titleDiv.textContent = item.title || '';

      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'small text-muted';
      categoryDiv.textContent = item.category || '';

      const idDiv = document.createElement('div');
      idDiv.className = 'small text-muted';
      idDiv.textContent = `ID: ${item.id || ''}`;

      infoCell.appendChild(titleDiv);
      infoCell.appendChild(categoryDiv);
      infoCell.appendChild(idDiv);

      const dateCell = document.createElement('td');
      dateCell.textContent = item.date || '';

      const actionsCell = document.createElement('td');
      actionsCell.className = 'admin-actions';

      const actionWrapper = document.createElement('div');
      actionWrapper.className = 'd-flex flex-wrap gap-2';
      actionWrapper.appendChild(
        createActionButton('Düzenle', 'btn btn-sm btn-outline-primary edit-btn', item.id)
      );
      actionWrapper.appendChild(
        createActionButton('Sil', 'btn btn-sm btn-outline-danger delete-btn', item.id)
      );

      actionsCell.appendChild(actionWrapper);

      row.appendChild(imageCell);
      row.appendChild(infoCell);
      row.appendChild(dateCell);
      row.appendChild(actionsCell);

      tableBody.appendChild(row);
    };

    const renderTable = () => {
      if (!tableBody || !newsCount) return;

      const items = sortNews(getStoredNews());
      newsCount.textContent = `${items.length} kayıt`;
      tableBody.innerHTML = '';

      if (!items.length) {
        renderEmptyState();
        return;
      }

      items.forEach(renderRow);
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const title = normalizeText(newsTitle.value);
      const category = normalizeText(newsCategory.value);
      const date = normalizeText(newsDate.value);
      const image = normalizeText(newsImage.value);
      const excerpt = normalizeText(newsExcerpt.value);
      const content = normalizeText(newsContent.value);

      if (!title || !category || !date || !excerpt) {
        showMessage('Başlık, kategori, tarih ve özet alanları zorunludur.');
        return;
      }

      if (image && !isSafeImageUrl(image)) {
        showMessage('Görsel adresi geçersiz. Sadece güvenli URL veya yerel görsel yolu kullan.');
        return;
      }

      const items = getStoredNews();
      const existingId = normalizeText(newsIdHidden.value);
      const finalId = existingId || generateUniqueId(title, items, existingId);

      const payload = {
        id: finalId,
        title: escapeHTML(title),
        category: escapeHTML(category),
        date,
        image,
        excerpt: escapeHTML(excerpt),
        content,
        url: `haber-detay.html?id=${encodeURIComponent(finalId)}`
      };

      const existingIndex = items.findIndex((item) => item.id === finalId);
      if (existingIndex >= 0) {
        items[existingIndex] = payload;
      } else {
        items.push(payload);
      }

      saveStoredNews(items);
      renderTable();
      clearForm();
      showMessage('Haber kaydedildi.');
    });

    if (tableBody) {
      tableBody.addEventListener('click', (event) => {
        const editBtn = event.target.closest('.edit-btn');
        const deleteBtn = event.target.closest('.delete-btn');
        const items = getStoredNews();

        if (editBtn) {
          const id = editBtn.dataset.id;
          const item = items.find((newsItem) => newsItem.id === id);

          if (item) {
            fillForm({
              ...item,
              title: item.title || '',
              category: item.category || '',
              excerpt: item.excerpt || '',
              content: item.content || ''
            });
          }
          return;
        }

        if (deleteBtn) {
          const id = deleteBtn.dataset.id;
          const isConfirmed = window.confirm('Bu haberi silmek istediğine emin misin?');
          if (!isConfirmed) return;

          const filtered = items.filter((newsItem) => newsItem.id !== id);
          saveStoredNews(filtered);
          renderTable();
        }
      });
    }

    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', clearForm);
    }

    renderTable();
  })();

  /* ---------------------------
     2) Corporate Page Management
  --------------------------- */
  setupSimpleContentForm({
    formSelector: '#corporateForm',
    storageKey: 'ergunler_corporate_content',
    loadButtonSelector: '#loadCorporateBtn',
    successMessage: 'Kurumsal sayfa verisi kaydedildi.',
    fieldMap: {
      pageTitle: 'corpPageTitle',
      pageLead: 'corpPageLead',
      mainTitle: 'corpMainTitle',
      mainText: 'corpMainText',
      vision: 'corpVision',
      mission: 'corpMission',
      operation: 'corpOperation'
    },
    defaults: {
      pageTitle: 'Hakkımızda',
      pageLead: 'Üretimden Sahaya • Tek Elden Güçlü Altyapı Çözümleri',
      mainTitle: 'Güçlü Geçmiş, Sağlam Altyapı',
      mainText:
        'Ergünler Yol Yapı Ltd. Şti. olarak; yol, asfalt ve altyapı projelerinde planlama, üretim ve saha uygulamasını tek çatı altında yürüten entegre bir yapı ile çalışıyoruz. Erzurum merkezli operasyon gücümüzü, geniş filomuz ve üretim tesislerimizle destekleyerek projeleri hızlı ve kontrollü şekilde teslim ediyoruz.',
      vision:
        'Yenilikçi teknolojilerle, güvenilir ve sürdürülebilir altyapı projelerinde ilk tercih olmak.',
      mission:
        'Kalite, iş güvenliği ve çevre hassasiyetinden ödün vermeden; hızlı, kontrollü ve doğru üretimle değer katmak.',
      operation: 'Üretim ve saha koordinasyonu için tek noktadan iletişim kurabilirsiniz.'
    }
  });

  /* ---------------------------
     3) Facilities Management
  --------------------------- */
  setupSimpleContentForm({
    formSelector: '#facilitiesForm',
    storageKey: 'ergunler_facilities_content',
    loadButtonSelector: '#loadFacilitiesBtn',
    successMessage: 'Tesisler sayfası verisi kaydedildi.',
    defaults: {
      facility1Top: 'Natro Markası',
      facility1Title: 'Mikronize Kalsit Üretim Tesisi',
      facility1Text:
        'Aziziye / Erzurum’daki modern tesisimizde, kendi ocağımızdan çıkarılan gri kalsit cevherini yüksek hassasiyetle işliyoruz. Yapı kimyasalları sektörünün hammadde ihtiyacını yüksek standartlarda karşılıyoruz.',
      facility1Badge1: '2–5 μ Mikron Hassasiyeti',
      facility1Badge2: 'Yüksek Safiyet',
      facility1Badge3: 'Gri Kalsit Cevheri',
      facility2Top: 'Yol & Altyapı Gücü',
      facility2Title: 'Asfalt Plenti & Kalsit Ocağı',
      facility2Text:
        'Geniş araç filomuz ve modern asfalt plentimiz ile yol projelerine hız katıyoruz. Güçlü filomuz ile lojistik gücümüzü üretim kapasitemizle birleştiriyoruz.',
      facility2Badge1: 'Filo',
      facility2Badge2: 'Modern Plent Teknolojisi',
      facility2Badge3: 'Kesintisiz Sevkiyat'
    }
  });

  /* ---------------------------
     4) White Calcite Management
  --------------------------- */
  setupSimpleContentForm({
    formSelector: '#whiteCalciteForm',
    storageKey: 'ergunler_white_calcite_content',
    loadButtonSelector: '#loadWhiteCalciteBtn',
    successMessage: 'Beyaz Kalsit sayfası verisi kaydedildi.',
    defaults: {
      whiteHeaderTitle: 'Beyaz Kalsit',
      whiteHeaderLead: 'Natro üretim gücü ile mikronize çözümler',
      whiteSummaryTitle: 'Ürün Özeti',
      whiteSummaryText:
        'Beyaz mikronize kalsit; plastik, boya, yapı kimyasalları ve endüstriyel uygulamalarda dolgu/performans malzemesi olarak kullanılır. İstenen mikron aralığında üretim sağlanır.',
      whiteBadge1: '2–5 µ Hassasiyet',
      whiteBadge2: 'Stabil Kalite',
      whiteBadge3: 'Sevkiyata Uygun',
      whiteTechnicalTitle: 'Teknik Bilgiler',
      whiteTech1Name: 'Renk',
      whiteTech1Value: 'Beyaz / Açık ton',
      whiteTech2Name: 'Mikron Aralığı',
      whiteTech2Value: 'Talebe göre',
      whiteTech3Name: 'Paketleme',
      whiteTech3Value: 'Torbalı / Dökme'
    }
  });

  /* ---------------------------
     5) Advanced Facilities Management
  --------------------------- */
  setupSimpleContentForm({
    formSelector: '#facilitiesAdvancedForm',
    storageKey: 'ergunler_facilities_advanced_content',
    loadButtonSelector: '#loadFacilitiesAdvancedBtn',
    successMessage: 'Tesisler sayfası verisi kaydedildi.',
    defaults: {
      facilityAsphaltKicker: 'Asfalt Üretimi',
      facilityAsphaltTitle: 'Asfalt Tesisi',
      facilityAsphaltText:
        'Modern plent altyapımız ile yol projeleri için düzenli, kontrollü ve saha takvimine uyumlu asfalt üretimi sağlıyoruz. Üretim planlamasını sevkiyat ve uygulama temposuna göre organize ediyoruz.',
      facilityAsphaltBadge1: 'Plent Altyapısı',
      facilityAsphaltBadge2: 'Saha Uyumlu Üretim',
      facilityAsphaltBadge3: 'Planlı Sevkiyat',
      facilityGrayKicker: 'Natro Üretim Hattı',
      facilityGrayTitle: 'Gri Kalsit Tesisi',
      facilityGrayText:
        'Kendi hammadde altyapımızdan beslenen gri kalsit üretim sürecinde, istenen mikron aralığında kontrollü öğütme ve düzenli ürün standardı sağlamayı hedefliyoruz.',
      facilityGrayBadge1: '2–5 μ Hassasiyet',
      facilityGrayBadge2: 'Gri Cevher İşleme',
      facilityGrayBadge3: 'Stabil Üretim',
      facilityWhiteKicker: 'Açık Ton Üretim',
      facilityWhiteTitle: 'Beyaz Kalsit Tesisi',
      facilityWhiteText:
        'Beyaz mikronize kalsit tarafında daha hassas kullanım alanlarına uygun, temiz tonlu ve düzenli kalite standardına sahip ürün akışı oluşturuyoruz.',
      facilityWhiteBadge1: 'Açık Ton Üretim',
      facilityWhiteBadge2: 'Hassas Öğütme',
      facilityWhiteBadge3: 'Endüstriyel Uyum',
      facilityAgregaKicker: 'Kırma-Eleme Altyapısı',
      facilityAgregaTitle: 'Agrega Tesisi',
      facilityAgregaText:
        'Kırma-eleme tesisimizde farklı fraksiyonlarda agrega üretimi yapıyor; altyapı, yol ve dolgu projeleri için projeye uygun malzeme akışı ve planlı sevkiyat sağlıyoruz.',
      facilityAgregaBadge1: 'Fraksiyon Yönetimi',
      facilityAgregaBadge2: 'Kırma-Eleme',
      facilityAgregaBadge3: 'Hızlı Yükleme'
    }
  });
})();
