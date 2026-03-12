(() => {
  'use strict';

  const ui = window.ErgunlerUI;
  if (!ui) return;

  const { qs, qsa } = ui;

  const escapeHTML = (value) => {
    if (value == null) return '';
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  const setBg = (element, url) => {
    if (!element) return;
    const safeUrl = url ? `url("${String(url).replaceAll('"', '\\"')}")` : 'none';
    element.style.setProperty('--bg', safeUrl);
  };

  const getQueryParam = (name) => new URL(window.location.href).searchParams.get(name);

  const dateFormatterTR = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const formatDateTR = (value) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return dateFormatterTR.format(date);
  };

  const sanitizeNewsHTML = (html) => {
    if (!html) return '';
    const template = document.createElement('template');
    template.innerHTML = String(html);
    return template.innerHTML;
  };

  const loadNews = async () => {
    try {
      const response = await fetch('get_news.php', {
        headers: { Accept: 'application/json' }
      });

      const result = await response.json();

      if (!response.ok || result?.status !== 'success') {
        console.error('get_news.php hata döndürdü:', result);
        return [];
      }

      const rawItems = Array.isArray(result.data) ? result.data : [];

      return rawItems
        .map((item) => {
          const rawDate = item.date || '';
          const rawImage = item.image || '';
          const dateObj = new Date(rawDate);

          return {
            id: item.id,
            title: item.title || '',
            category: item.category || '',
            date: rawDate,
            excerpt: item.excerpt || '',
            content: item.content || '',
            image: rawImage,
            _dateObj: Number.isNaN(dateObj.getTime()) ? new Date(0) : dateObj,
            _safeTitle: escapeHTML(item.title || ''),
            _safeCategory: escapeHTML(item.category || ''),
            _safeExcerpt: escapeHTML(item.excerpt || ''),
            _safeContent: sanitizeNewsHTML(item.content || ''),
            _img: rawImage ? String(rawImage) : 'images/haberler.jpg'
          };
        })
        .sort((a, b) => b._dateObj - a._dateObj);
    } catch (error) {
      console.error('Haberler yüklenemedi:', error);
      return [];
    }
  };

  const renderHomeNews = (items) => {
    const featuredEl = qs('#homeNewsFeatured');
    const sideEl = qs('#homeNewsSide');
    if (!featuredEl || !sideEl) return;

    const topItems = items.slice(0, 3);
    if (!topItems.length) {
      featuredEl.innerHTML = '<div class="content-card text-center">Henüz haber bulunmuyor.</div>';
      sideEl.innerHTML = '';
      return;
    }

    const [featuredItem, sideItem1, sideItem2] = topItems;

    featuredEl.innerHTML = `
      <a href="haber-detay.html?id=${encodeURIComponent(featuredItem.id)}" class="news-overlay-card h-100">
        <div class="news-overlay-bg"></div>
        <div class="news-overlay-gradient"></div>
        <div class="news-overlay-content">
          <span class="news-overlay-date">${featuredItem._safeCategory}</span>
          <h3 class="news-overlay-title">${featuredItem._safeTitle}</h3>
          <p class="text-white opacity-75 mb-0 d-none d-md-block">${featuredItem._safeExcerpt}</p>
        </div>
      </a>
    `;
    setBg(qs('.news-overlay-bg', featuredEl), featuredItem._img);

    const createSmallCardHTML = (item) => `
      <div class="col-12">
        <a href="haber-detay.html?id=${encodeURIComponent(item.id)}" class="news-overlay-card news-overlay-card--sm">
          <div class="news-overlay-bg"></div>
          <div class="news-overlay-gradient"></div>
          <div class="news-overlay-content news-overlay-content--sm">
            <span class="news-overlay-date news-overlay-date--sm">${item._safeCategory}</span>
            <h3 class="news-overlay-title news-overlay-title--sm">${item._safeTitle}</h3>
          </div>
        </a>
      </div>
    `;

    sideEl.innerHTML = `${sideItem1 ? createSmallCardHTML(sideItem1) : ''}${sideItem2 ? createSmallCardHTML(sideItem2) : ''}`;

    qsa('.news-overlay-card--sm', sideEl).forEach((card) => {
      const cardId = new URL(card.href).searchParams.get('id');
      const item = items.find((newsItem) => String(newsItem.id) === String(cardId));
      if (item) {
        setBg(qs('.news-overlay-bg', card), item._img);
      }
    });
  };

  const renderNewsPage = (items) => {
    const listEl = qs('#newsList');
    if (!listEl) return;

    if (!items.length) {
      listEl.innerHTML = '<div class="col-12"><div class="content-card text-center">Henüz haber bulunmuyor.</div></div>';
      return;
    }

    listEl.innerHTML = items.map((item) => `
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="news-card">
          <div class="news-img"></div>
          <div class="news-body">
            <span class="news-date">${formatDateTR(item._dateObj)}</span>
            <h3 class="news-title">${item._safeTitle}</h3>
            <p class="news-desc">${item._safeExcerpt}</p>
            <a href="haber-detay.html?id=${encodeURIComponent(item.id)}" class="news-btn mt-auto">
              Haberi Oku <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `).join('');

    qsa('.news-card .news-img', listEl).forEach((imgEl, index) => {
      setBg(imgEl, items[index]?._img);
    });
  };

  const renderNewsDetail = (items) => {
    const detailEl = qs('#newsDetail');
    if (!detailEl) return;

    const id = getQueryParam('id');
    const item = items.find((newsItem) => String(newsItem.id) === String(id));
    const titleEl = qs('#detailTitle');
    const metaEl = qs('#detailMeta');

    if (!item) {
      if (titleEl) titleEl.textContent = 'Haber bulunamadı';
      if (metaEl) metaEl.textContent = 'Hata';
      detailEl.innerHTML = `
        <div class="content-card text-center">
          <p>Aradığınız haber bulunamadı.</p>
          <a href="haberler.html" class="btn-teklif mt-4">Geri Dön</a>
        </div>
      `;
      return;
    }

    if (titleEl) titleEl.textContent = item.title ?? '';
    if (metaEl) metaEl.textContent = `${formatDateTR(item._dateObj)} • ${item.category ?? ''}`;

    const bodyHtml = item._safeContent || `<p class="lead">${item._safeExcerpt}</p>`;
    detailEl.innerHTML = `
      <div class="content-card mt-0 border-0 shadow-none px-0">
        <div class="news-detail-cover"></div>
        <div class="mt-5 fs-5" style="color: var(--text);">${bodyHtml}</div>
      </div>
    `;

    setBg(qs('.news-detail-cover', detailEl), item._img);
  };

  window.ErgunlerNews = {
    loadNews,
    renderHomeNews,
    renderNewsPage,
    renderNewsDetail,
    formatDateTR
  };
})();