(() => {
  'use strict';

  const boot = async () => {
    const ui = window.ErgunlerUI;
    if (!ui) return;

    // 1. ÖNEMLİ DÜZELTME: Sayfa kilitlenmesin diye preloader hemen kapatılır.
    ui.initPreloader();

    ui.initNavbarScroll();
    ui.initCounters();
    ui.initMobileMenuClose();
    ui.initJobTableFilter();
    ui.applyCorporateContent();
    ui.applyFacilitiesContent();
    ui.applyWhiteCalciteContent();
    ui.applyFacilitiesAdvancedContent();

    if (window.ErgunlerMachine) {
      window.ErgunlerMachine.initMachineParkuru();
    }

    if (window.ErgunlerNews) {
      // 2. ÖNEMLİ DÜZELTME: MySQL veritabanından haberlerin gelmesi beklenir (await eklendi)
      const news = await window.ErgunlerNews.loadNews();

      if (ui.qs('#homeNewsFeatured') || ui.qs('#homeNewsSide')) {
        window.ErgunlerNews.renderHomeNews(news);
      }

      if (ui.qs('#newsList')) {
        window.ErgunlerNews.renderNewsPage(news);
      }

      if (ui.qs('#newsDetail')) {
        window.ErgunlerNews.renderNewsDetail(news);
      }
    }
  };

  window.addEventListener('load', () => {
    if (window.ErgunlerUI) {
      window.ErgunlerUI.initPreloader();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();