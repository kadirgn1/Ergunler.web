(() => {
  'use strict';

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Preloader (oturumda 1 kere)
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const KEY = 'introGosterildi';
    try {
      if (sessionStorage.getItem(KEY) === 'true') {
        preloader.remove();
        return;
      }
      setTimeout(() => {
        preloader.style.transition = 'opacity 300ms ease, visibility 300ms ease';
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        setTimeout(() => preloader.remove(), 320);
        sessionStorage.setItem(KEY, 'true');
      }, 600);
    } catch {
      preloader.remove();
    }
  });

  // Haber data (fetch yok -> file:// altında da çalışır)
  function loadNewsDataSync() {
    const data = window.NEWS_DATA;
    if (!Array.isArray(data)) return [];
    return [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function formatDateTR(iso) {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
  }

  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function renderHomeNews(items) {
    const featuredEl = document.getElementById('homeNewsFeatured');
    const sideEl = document.getElementById('homeNewsSide');
    if (!featuredEl || !sideEl) return;

    const top = items.slice(0, 3);
    if (!top.length) {
      featuredEl.innerHTML = `<div class="p-4 bg-white rounded-4 shadow-sm">Henüz haber eklenmedi.</div>`;
      sideEl.innerHTML = '';
      return;
    }

    const [a, b, c] = top;

    featuredEl.innerHTML = `
      <a href="${a.url}" class="news-overlay-card">
        <div class="news-overlay-bg" style="background-image:url('${a.image}')"></div>
        <div class="news-overlay-gradient"></div>
        <div class="news-overlay-content">
          <span class="news-overlay-date">${a.category}</span>
          <h3 class="news-overlay-title">${a.title}</h3>
          <p class="text-white opacity-75 mb-0 d-none d-md-block">${a.excerpt}</p>
        </div>
      </a>
    `;

    const smallCard = (x) => `
      <div class="col-12">
        <a href="${x.url}" class="news-overlay-card" style="height:190px;">
          <div class="news-overlay-bg" style="background-image:url('${x.image}')"></div>
          <div class="news-overlay-gradient"></div>
          <div class="news-overlay-content" style="padding:20px;">
            <span class="news-overlay-date" style="padding:4px 10px;font-size:.65rem;">${x.category}</span>
            <h3 class="news-overlay-title" style="font-size:1.1rem;">${x.title}</h3>
          </div>
        </a>
      </div>
    `;

    sideEl.innerHTML = `${b ? smallCard(b) : ''}${c ? smallCard(c) : ''}`;
  }

  function renderNewsPage(items) {
    const listEl = document.getElementById('newsList');
    if (!listEl) return;

    if (!items.length) {
      listEl.innerHTML = `<div class="col-12"><div class="p-4 bg-white rounded-4 shadow-sm">Henüz haber eklenmedi.</div></div>`;
      return;
    }

    listEl.innerHTML = items.map(x => `
      <div class="col-lg-4 col-md-6">
        <div class="news-card">
          <div class="news-img" style="background-image:url('${x.image}')"></div>
          <div class="news-body">
            <span class="news-date">${formatDateTR(x.date)}</span>
            <h3 class="news-title">${x.title}</h3>
            <p class="news-desc">${x.excerpt}</p>
            <a href="${x.url}" class="news-btn">Haberi Oku <i class="bi bi-arrow-right"></i></a>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ✅ HABER DETAY SAYFASI (haber-detay.html?id=...)
  function renderNewsDetail(items) {
    const detailEl = document.getElementById('newsDetail');
    if (!detailEl) return; // detay sayfasında değilsek çık

    const id = getQueryParam('id');
    const item = items.find(x => x.id === id);

    const titleEl = document.getElementById('detailTitle');
    const metaEl = document.getElementById('detailMeta');

    if (!item) {
      if (titleEl) titleEl.textContent = "Haber bulunamadı";
      if (metaEl) metaEl.textContent = "Bu haber kaldırılmış olabilir.";
      detailEl.innerHTML = `
        <div class="p-4 bg-white rounded-4 shadow-sm">
          <p class="mb-0">Aradığınız haber bulunamadı. Lütfen haberler sayfasına dönün.</p>
        </div>
      `;
      return;
    }

    if (titleEl) titleEl.textContent = item.title;
    if (metaEl) metaEl.textContent = `${formatDateTR(item.date)} • ${item.category}`;

    // content varsa onu bas, yoksa excerpt göster
    const bodyHtml = item.content
      ? item.content
      : `<p class="text-muted">${item.excerpt}</p>`;

    detailEl.innerHTML = `
      <div class="content-card mt-0">
        <div class="news-detail-cover" style="background-image:url('${item.image}')"></div>
        <div class="mt-4">
          ${bodyHtml}
        </div>
      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll
    const navbar = qs('.navbar');
    if (navbar) {
      const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 20);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // Counter (index varsa)
    const counters = qsa('.stat-val[data-target]');
    if (counters.length) {
      const animateCounter = (el) => {
        const target = Number(el.getAttribute('data-target'));
        if (!Number.isFinite(target)) return;
        const suffix = el.dataset.suffix || '';
        const duration = Number(el.dataset.duration || 900);

        const startTime = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - startTime) / duration);
          el.textContent = `${Math.round(target * t)}${suffix}`;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };

      const obs = new IntersectionObserver((entries, o) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          animateCounter(e.target);
          o.unobserve(e.target);
        });
      }, { threshold: 0.5 });

      counters.forEach(c => obs.observe(c));
    }

    // Mobil menü kapat
    const menuToggle = document.getElementById('navbarNav');
    const navLinks = qsa('.navbar .nav-link');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    // ✅ Ürünler dropdown’a tıklayınca menüyü kapatma
    if (link.classList.contains('dropdown-toggle')) return;

    if (menuToggle.classList.contains('show') && window.bootstrap?.Collapse) {
      const inst = bootstrap.Collapse.getOrCreateInstance(menuToggle, { toggle: false });
      inst.hide();
    }
  });
});

    // Haberleri bas (index + haberler + detay)
    const news = loadNewsDataSync();
    renderHomeNews(news);
    renderNewsPage(news);
    renderNewsDetail(news);
  });
})();