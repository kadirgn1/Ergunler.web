<?php
session_start();

if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    header("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin Panel | Ergünler İçerik Yönetimi</title>
  <meta name="description" content="Ergünler Yol Yapı içerik yönetim paneli. Haberler, kurumsal içerikler, tesisler ve ürün sayfalarını yönetin.">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">

  <link rel="stylesheet" href="css.css">
  <link rel="stylesheet" href="admin.css">
</head>
<body>

  <header class="admin-topbar">
    <div class="container d-flex justify-content-between align-items-center gap-3 flex-wrap">
      <div class="d-flex align-items-center gap-3">
        <div class="admin-topbar-brand-icon">
          <i class="bi bi-shield-lock-fill"></i>
        </div>
        <div>
          <div class="admin-topbar-title">Ergünler Admin Panel</div>
          <div class="admin-topbar-subtitle">İçerik, haber ve sayfa yönetim merkezi</div>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2 flex-wrap">
        <a href="index.html" class="admin-top-link">
          <i class="bi bi-house-door me-1"></i>Siteyi Gör
        </a>
        <a href="haberler.html" class="admin-top-link">
          <i class="bi bi-newspaper me-1"></i>Haberler
        </a>
        <a href="logout.php" class="admin-top-link admin-top-link-danger">
          <i class="bi bi-box-arrow-right me-1"></i>Çıkış Yap
        </a>
      </div>
    </div>
  </header>

  <main class="admin-wrap">
    <div class="container">

      <section class="admin-hero">
        <div class="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center gap-4">
          <div>
            <span class="admin-kicker">Yönetim Alanı</span>
            <h1 class="admin-hero-title">İçerik Yönetim Paneli</h1>
            <p class="admin-hero-subtitle">
              Haberler, kurumsal içerikler, tesis sayfaları ve ürün metinlerini tek panel üzerinden yönetebilirsin.
              Tüm veriler canlı site mantığına uygun olarak merkezi içerik akışında kullanılmak üzere düzenlenmiştir.
            </p>
          </div>

          <div class="admin-hero-side">
            <div class="admin-pill">
              <i class="bi bi-database-fill-gear"></i>
              Veritabanı bağlantılı yönetim
            </div>
            <div class="admin-pill admin-pill-dark">
              <i class="bi bi-window-sidebar"></i>
              Tek panel / çok içerik akışı
            </div>
          </div>
        </div>

        <div class="admin-stat-grid">
          <div class="admin-stat">
            <small>Haber Kayıtları</small>
            <strong id="newsCount">0 kayıt</strong>
          </div>

          <div class="admin-stat">
            <small>Altyapı</small>
            <strong>PHP + MySQL</strong>
          </div>

          <div class="admin-stat">
            <small>Panel Yapısı</small>
            <strong>Modüler içerik yönetimi</strong>
          </div>
        </div>
      </section>

      <section class="admin-quick-panel">
        <div class="admin-quick-card">
          <div class="admin-quick-icon">
            <i class="bi bi-lightning-charge-fill"></i>
          </div>
          <div>
            <h3>Hızlı Akış</h3>
            <p>Önce sekme seç, sonra içerik getir, düzenle ve kaydet. Tüm formlar tek düzen içinde çalışır.</p>
          </div>
        </div>

        <div class="admin-quick-card">
          <div class="admin-quick-icon">
            <i class="bi bi-check2-square"></i>
          </div>
          <div>
            <h3>Temiz Kullanım</h3>
            <p>Form id’leri korunmuştur; mevcut <strong>admin.js</strong> yapın ile uyumlu şekilde çalışır.</p>
          </div>
        </div>

        <div class="admin-quick-card">
          <div class="admin-quick-icon">
            <i class="bi bi-palette-fill"></i>
          </div>
          <div>
            <h3>Daha Profesyonel Görünüm</h3>
            <p>Gömülü stil yükü azaltıldı, görünüm merkezi olarak <strong>admin.css</strong> üzerinden yönetilir.</p>
          </div>
        </div>
      </section>

      <ul class="nav admin-tab-nav" id="adminTabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="tab-news" data-bs-toggle="tab" data-bs-target="#pane-news" type="button" role="tab">
            <i class="bi bi-newspaper me-2"></i>Haberler
          </button>
        </li>

        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-corporate" data-bs-toggle="tab" data-bs-target="#pane-corporate" type="button" role="tab">
            <i class="bi bi-buildings me-2"></i>Kurumsal
          </button>
        </li>

        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-facilities" data-bs-toggle="tab" data-bs-target="#pane-facilities" type="button" role="tab">
            <i class="bi bi-gear-wide-connected me-2"></i>Tesisler
          </button>
        </li>

        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-white" data-bs-toggle="tab" data-bs-target="#pane-white" type="button" role="tab">
            <i class="bi bi-box-seam me-2"></i>Beyaz Kalsit
          </button>
        </li>

        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-advanced" data-bs-toggle="tab" data-bs-target="#pane-advanced" type="button" role="tab">
            <i class="bi bi-grid-3x3-gap-fill me-2"></i>Gelişmiş Tesisler
          </button>
        </li>
      </ul>

      <div class="tab-content">

        <!-- HABERLER -->
        <div class="tab-pane fade show active" id="pane-news" role="tabpanel" aria-labelledby="tab-news">
          <div class="admin-grid-2">
            <div>
              <div class="admin-card admin-sticky">
                <div class="admin-card-header">
                  <div>
                    <h2 class="admin-title">Haber Formu</h2>
                    <p class="admin-subtitle">
                      Yeni haber ekleyebilir, mevcut bir haberi düzenleyebilir veya içerik yapısını yeniden güncelleyebilirsin.
                    </p>
                  </div>
                </div>

                <form id="newsForm">
                  <input type="hidden" id="newsIdHidden">

                  <div class="mb-3">
                    <label for="newsTitle" class="form-label">Başlık</label>
                    <input type="text" id="newsTitle" class="form-control" placeholder="Haber başlığını gir" required>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="newsCategory" class="form-label">Kategori</label>
                      <input type="text" id="newsCategory" class="form-control" placeholder="Örn: Duyuru" required>
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="newsDate" class="form-label">Tarih</label>
                      <input type="date" id="newsDate" class="form-control" required>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="newsImage" class="form-label">Görsel URL / Yol</label>
                    <input type="text" id="newsImage" class="form-control" placeholder="images/haber-1.jpg veya https://...">
                  </div>

                  <div class="mb-3">
                    <label for="newsExcerpt" class="form-label">Kısa Özet</label>
                    <textarea id="newsExcerpt" class="form-control" rows="3" placeholder="Haberin kısa açıklaması" required></textarea>
                  </div>

                  <div class="mb-3">
                    <label for="newsContent" class="form-label">Detay İçerik</label>
                    <textarea id="newsContent" class="form-control" rows="8" placeholder="Haber detay metni veya izin verilen temel HTML içerik"></textarea>
                  </div>

                  <div class="d-flex flex-wrap gap-2">
                    <button type="submit" class="btn btn-admin-primary">
                      <i class="bi bi-save me-2"></i>Kaydet
                    </button>

                    <button type="button" id="resetFormBtn" class="btn btn-outline-secondary btn-admin-secondary">
                      <i class="bi bi-eraser me-2"></i>Formu Temizle
                    </button>
                  </div>

                  <p class="admin-note">
                    Başlık, kategori, tarih ve özet alanları zorunludur. Görsel alanı boş bırakılırsa sistem placeholder görünüm kullanır.
                  </p>
                </form>
              </div>
            </div>

            <div>
              <div class="admin-card">
                <div class="admin-card-header">
                  <div>
                    <h2 class="admin-title">Kayıtlı Haberler</h2>
                    <p class="admin-subtitle">
                      Mevcut haber kayıtlarını görüntüle, düzenle veya kaldır.
                    </p>
                  </div>

                  <span class="admin-pill">
                    <i class="bi bi-collection-fill"></i>
                    <span id="newsCountBadge">0 kayıt</span>
                  </span>
                </div>

                <div class="admin-table-wrap">
                  <div class="table-responsive">
                    <table class="table admin-table align-middle">
                      <thead>
                        <tr>
                          <th>Görsel</th>
                          <th>Bilgi</th>
                          <th>Tarih</th>
                          <th>İşlem</th>
                        </tr>
                      </thead>
                      <tbody id="adminNewsTableBody">
                        <tr>
                          <td colspan="4" class="text-center py-5 text-muted">
                            Henüz kayıt yok.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div class="admin-card">
                <div class="soft-block">
                  <h6><i class="bi bi-lightbulb-fill text-warning me-2"></i>Haber Yönetimi İpucu</h6>
                  <p>
                    Görsel yolunu mümkün olduğunca proje içinden ver:
                    <strong>images/haber-1.jpg</strong>.
                    Önce kısa özet, sonra detay içerik yazman yönetimi daha temiz hale getirir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- KURUMSAL -->
        <div class="tab-pane fade" id="pane-corporate" role="tabpanel" aria-labelledby="tab-corporate">
          <div class="admin-card">
            <div class="admin-card-header">
              <div>
                <h2 class="admin-title">Kurumsal Sayfa Yönetimi</h2>
                <p class="admin-subtitle">
                  Hakkımızda sayfasının ana başlık, giriş ve açıklama alanlarını düzenle.
                </p>
              </div>
            </div>

            <form id="corporateForm">
              <div class="row">
                <div class="col-lg-6 mb-3">
                  <label for="corpPageTitle" class="form-label">Sayfa Başlığı</label>
                  <input type="text" id="corpPageTitle" class="form-control" placeholder="Hakkımızda">
                </div>

                <div class="col-lg-6 mb-3">
                  <label for="corpPageLead" class="form-label">Sayfa Alt Metni</label>
                  <input type="text" id="corpPageLead" class="form-control" placeholder="Üretimden Sahaya • Tek Elden Güçlü Altyapı Çözümleri">
                </div>
              </div>

              <div class="mb-3">
                <label for="corpMainTitle" class="form-label">Ana Başlık</label>
                <input type="text" id="corpMainTitle" class="form-control" placeholder="Güçlü Geçmiş, Sağlam Altyapı">
              </div>

              <div class="mb-3">
                <label for="corpMainText" class="form-label">Ana Metin</label>
                <textarea id="corpMainText" class="form-control" rows="6"></textarea>
              </div>

              <div class="row">
                <div class="col-lg-4 mb-3">
                  <label for="corpVision" class="form-label">Vizyon</label>
                  <textarea id="corpVision" class="form-control" rows="5"></textarea>
                </div>

                <div class="col-lg-4 mb-3">
                  <label for="corpMission" class="form-label">Misyon</label>
                  <textarea id="corpMission" class="form-control" rows="5"></textarea>
                </div>

                <div class="col-lg-4 mb-3">
                  <label for="corpOperation" class="form-label">Operasyon / Ek Metin</label>
                  <textarea id="corpOperation" class="form-control" rows="5"></textarea>
                </div>
              </div>

              <div class="d-flex flex-wrap gap-2">
                <button type="submit" class="btn btn-admin-primary">
                  <i class="bi bi-save me-2"></i>Kurumsal Veriyi Kaydet
                </button>

                <button type="button" id="loadCorporateBtn" class="btn btn-outline-secondary btn-admin-secondary">
                  <i class="bi bi-arrow-repeat me-2"></i>Kayıtlı Veriyi Getir
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- TESISLER -->
        <div class="tab-pane fade" id="pane-facilities" role="tabpanel" aria-labelledby="tab-facilities">
          <div class="admin-card">
            <div class="admin-card-header">
              <div>
                <h2 class="admin-title">Tesisler Sayfası Yönetimi</h2>
                <p class="admin-subtitle">
                  Tesisler sayfasındaki iki ana blok yapısını düzenle.
                </p>
              </div>
            </div>

            <form id="facilitiesForm">
              <div class="section-mini-title">1. Tesis Bloğu</div>

              <div class="row">
                <div class="col-lg-6 mb-3">
                  <label for="facility1Top" class="form-label">Üst Etiket</label>
                  <input type="text" id="facility1Top" class="form-control" placeholder="Natro Markası">
                </div>

                <div class="col-lg-6 mb-3">
                  <label for="facility1Title" class="form-label">Başlık</label>
                  <input type="text" id="facility1Title" class="form-control" placeholder="Mikronize Kalsit Üretim Tesisi">
                </div>
              </div>

              <div class="mb-3">
                <label for="facility1Text" class="form-label">Açıklama</label>
                <textarea id="facility1Text" class="form-control" rows="4"></textarea>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="facility1Badge1" class="form-label">Rozet 1</label>
                  <input type="text" id="facility1Badge1" class="form-control" placeholder="2–5 μ Mikron Hassasiyeti">
                </div>

                <div class="col-md-4 mb-3">
                  <label for="facility1Badge2" class="form-label">Rozet 2</label>
                  <input type="text" id="facility1Badge2" class="form-control" placeholder="Yüksek Safiyet">
                </div>

                <div class="col-md-4 mb-3">
                  <label for="facility1Badge3" class="form-label">Rozet 3</label>
                  <input type="text" id="facility1Badge3" class="form-control" placeholder="Gri Kalsit Cevheri">
                </div>
              </div>

              <hr class="admin-divider">

              <div class="section-mini-title">2. Tesis Bloğu</div>

              <div class="row">
                <div class="col-lg-6 mb-3">
                  <label for="facility2Top" class="form-label">Üst Etiket</label>
                  <input type="text" id="facility2Top" class="form-control" placeholder="Yol & Altyapı Gücü">
                </div>

                <div class="col-lg-6 mb-3">
                  <label for="facility2Title" class="form-label">Başlık</label>
                  <input type="text" id="facility2Title" class="form-control" placeholder="Asfalt Plenti & Kalsit Ocağı">
                </div>
              </div>

              <div class="mb-3">
                <label for="facility2Text" class="form-label">Açıklama</label>
                <textarea id="facility2Text" class="form-control" rows="4"></textarea>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="facility2Badge1" class="form-label">Rozet 1</label>
                  <input type="text" id="facility2Badge1" class="form-control" placeholder="Filo">
                </div>

                <div class="col-md-4 mb-3">
                  <label for="facility2Badge2" class="form-label">Rozet 2</label>
                  <input type="text" id="facility2Badge2" class="form-control" placeholder="Modern Plent Teknolojisi">
                </div>

                <div class="col-md-4 mb-3">
                  <label for="facility2Badge3" class="form-label">Rozet 3</label>
                  <input type="text" id="facility2Badge3" class="form-control" placeholder="Kesintisiz Sevkiyat">
                </div>
              </div>

              <div class="d-flex flex-wrap gap-2">
                <button type="submit" class="btn btn-admin-primary">
                  <i class="bi bi-save me-2"></i>Tesis Verisini Kaydet
                </button>

                <button type="button" id="loadFacilitiesBtn" class="btn btn-outline-secondary btn-admin-secondary">
                  <i class="bi bi-arrow-repeat me-2"></i>Kayıtlı Veriyi Getir
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- BEYAZ KALSIT -->
        <div class="tab-pane fade" id="pane-white" role="tabpanel" aria-labelledby="tab-white">
          <div class="admin-card">
            <div class="admin-card-header">
              <div>
                <h2 class="admin-title">Beyaz Kalsit Sayfası Yönetimi</h2>
                <p class="admin-subtitle">
                  Beyaz kalsit sayfasındaki başlık, özet, rozet ve teknik bilgi alanlarını düzenle.
                </p>
              </div>
            </div>

            <form id="whiteCalciteForm">
              <div class="row">
                <div class="col-lg-6 mb-3">
                  <label for="whiteHeaderTitle" class="form-label">Sayfa Başlığı</label>
                  <input type="text" id="whiteHeaderTitle" class="form-control" placeholder="Beyaz Kalsit">
                </div>

                <div class="col-lg-6 mb-3">
                  <label for="whiteHeaderLead" class="form-label">Alt Başlık</label>
                  <input type="text" id="whiteHeaderLead" class="form-control" placeholder="Natro üretim gücü ile mikronize çözümler">
                </div>
              </div>

              <div class="mb-3">
                <label for="whiteSummaryTitle" class="form-label">Özet Başlığı</label>
                <input type="text" id="whiteSummaryTitle" class="form-control" placeholder="Ürün Özeti">
              </div>

              <div class="mb-3">
                <label for="whiteSummaryText" class="form-label">Özet Metni</label>
                <textarea id="whiteSummaryText" class="form-control" rows="5"></textarea>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="whiteBadge1" class="form-label">Rozet 1</label>
                  <input type="text" id="whiteBadge1" class="form-control" placeholder="2–5 µ Hassasiyet">
                </div>

                <div class="col-md-4 mb-3">
                  <label for="whiteBadge2" class="form-label">Rozet 2</label>
                  <input type="text" id="whiteBadge2" class="form-control" placeholder="Stabil Kalite">
                </div>

                <div class="col-md-4 mb-3">
                  <label for="whiteBadge3" class="form-label">Rozet 3</label>
                  <input type="text" id="whiteBadge3" class="form-control" placeholder="Sevkiyata Uygun">
                </div>
              </div>

              <hr class="admin-divider">

              <div class="section-mini-title">Teknik Bilgi Alanı</div>

              <div class="mb-3">
                <label for="whiteTechnicalTitle" class="form-label">Teknik Bilgi Başlığı</label>
                <input type="text" id="whiteTechnicalTitle" class="form-control" placeholder="Teknik Bilgiler">
              </div>

              <div class="row">
                <div class="col-lg-4 mb-3">
                  <label for="whiteTech1Name" class="form-label">Özellik 1 Adı</label>
                  <input type="text" id="whiteTech1Name" class="form-control" placeholder="Renk">
                </div>
                <div class="col-lg-8 mb-3">
                  <label for="whiteTech1Value" class="form-label">Özellik 1 Değeri</label>
                  <input type="text" id="whiteTech1Value" class="form-control" placeholder="Beyaz / Açık ton">
                </div>

                <div class="col-lg-4 mb-3">
                  <label for="whiteTech2Name" class="form-label">Özellik 2 Adı</label>
                  <input type="text" id="whiteTech2Name" class="form-control" placeholder="Mikron Aralığı">
                </div>
                <div class="col-lg-8 mb-3">
                  <label for="whiteTech2Value" class="form-label">Özellik 2 Değeri</label>
                  <input type="text" id="whiteTech2Value" class="form-control" placeholder="Talebe göre">
                </div>

                <div class="col-lg-4 mb-3">
                  <label for="whiteTech3Name" class="form-label">Özellik 3 Adı</label>
                  <input type="text" id="whiteTech3Name" class="form-control" placeholder="Paketleme">
                </div>
                <div class="col-lg-8 mb-3">
                  <label for="whiteTech3Value" class="form-label">Özellik 3 Değeri</label>
                  <input type="text" id="whiteTech3Value" class="form-control" placeholder="Torbalı / Dökme">
                </div>
              </div>

              <div class="d-flex flex-wrap gap-2">
                <button type="submit" class="btn btn-admin-primary">
                  <i class="bi bi-save me-2"></i>Beyaz Kalsit Verisini Kaydet
                </button>

                <button type="button" id="loadWhiteCalciteBtn" class="btn btn-outline-secondary btn-admin-secondary">
                  <i class="bi bi-arrow-repeat me-2"></i>Kayıtlı Veriyi Getir
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- GELISMIS TESISLER -->
        <div class="tab-pane fade" id="pane-advanced" role="tabpanel" aria-labelledby="tab-advanced">
          <div class="admin-card">
            <div class="admin-card-header">
              <div>
                <h2 class="admin-title">Gelişmiş Tesis Kartları Yönetimi</h2>
                <p class="admin-subtitle">
                  Tesisler sayfasındaki asfalt, gri kalsit, beyaz kalsit ve agrega kartlarını ayrı ayrı yönet.
                </p>
              </div>
            </div>

            <form id="facilitiesAdvancedForm">

              <div class="section-mini-title">Asfalt Bloğu</div>
              <div class="row">
                <div class="col-lg-4 mb-3">
                  <label for="facilityAsphaltKicker" class="form-label">Üst Etiket</label>
                  <input type="text" id="facilityAsphaltKicker" class="form-control">
                </div>
                <div class="col-lg-8 mb-3">
                  <label for="facilityAsphaltTitle" class="form-label">Başlık</label>
                  <input type="text" id="facilityAsphaltTitle" class="form-control">
                </div>
              </div>
              <div class="mb-3">
                <label for="facilityAsphaltText" class="form-label">Açıklama</label>
                <textarea id="facilityAsphaltText" class="form-control" rows="4"></textarea>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="facilityAsphaltBadge1" class="form-label">Rozet 1</label>
                  <input type="text" id="facilityAsphaltBadge1" class="form-control">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="facilityAsphaltBadge2" class="form-label">Rozet 2</label>
                  <input type="text" id="facilityAsphaltBadge2" class="form-control">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="facilityAsphaltBadge3" class="form-label">Rozet 3</label>
                  <input type="text" id="facilityAsphaltBadge3" class="form-control">
                </div>
              </div>

              <hr class="admin-divider">

              <div class="section-mini-title">Gri Kalsit Bloğu</div>
              <div class="row">
                <div class="col-lg-4 mb-3">
                  <label for="facilityGrayKicker" class="form-label">Üst Etiket</label>
                  <input type="text" id="facilityGrayKicker" class="form-control">
                </div>
                <div class="col-lg-8 mb-3">
                  <label for="facilityGrayTitle" class="form-label">Başlık</label>
                  <input type="text" id="facilityGrayTitle" class="form-control">
                </div>
              </div>
              <div class="mb-3">
                <label for="facilityGrayText" class="form-label">Açıklama</label>
                <textarea id="facilityGrayText" class="form-control" rows="4"></textarea>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="facilityGrayBadge1" class="form-label">Rozet 1</label>
                  <input type="text" id="facilityGrayBadge1" class="form-control">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="facilityGrayBadge2" class="form-label">Rozet 2</label>
                  <input type="text" id="facilityGrayBadge2" class="form-control">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="facilityGrayBadge3" class="form-label">Rozet 3</label>
                  <input type="text" id="facilityGrayBadge3" class="form-control">
                </div>
              </div>

              <hr class="admin-divider">

              <div class="section-mini-title">Beyaz Kalsit Bloğu</div>
              <div class="row">
                <div class="col-lg-4 mb-3">
                  <label for="facilityWhiteKicker" class="form-label">Üst Etiket</label>
                  <input type="text" id="facilityWhiteKicker" class="form-control">
                </div>
                <div class="col-lg-8 mb-3">
                  <label for="facilityWhiteTitle" class="form-label">Başlık</label>
                  <input type="text" id="facilityWhiteTitle" class="form-control">
                </div>
              </div>
              <div class="mb-3">
                <label for="facilityWhiteText" class="form-label">Açıklama</label>
                <textarea id="facilityWhiteText" class="form-control" rows="4"></textarea>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="facilityWhiteBadge1" class="form-label">Rozet 1</label>
                  <input type="text" id="facilityWhiteBadge1" class="form-control">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="facilityWhiteBadge2" class="form-label">Rozet 2</label>
                  <input type="text" id="facilityWhiteBadge2" class="form-control">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="facilityWhiteBadge3" class="form-label">Rozet 3</label>
                  <input type="text" id="facilityWhiteBadge3" class="form-control">
                </div>
              </div>

              <hr class="admin-divider">

              <div class="section-mini-title">Agrega Bloğu</div>
              <div class="row">
                <div class="col-lg-4 mb-3">
                  <label for="facilityAgregaKicker" class="form-label">Üst Etiket</label>
                  <input type="text" id="facilityAgregaKicker" class="form-control">
                </div>
                <div class="col-lg-8 mb-3">
                  <label for="facilityAgregaTitle" class="form-label">Başlık</label>
                  <input type="text" id="facilityAgregaTitle" class="form-control">
                </div>
              </div>
              <div class="mb-3">
                <label for="facilityAgregaText" class="form-label">Açıklama</label>
                <textarea id="facilityAgregaText" class="form-control" rows="4"></textarea>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="facilityAgregaBadge1" class="form-label">Rozet 1</label>
                  <input type="text" id="facilityAgregaBadge1" class="form-control">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="facilityAgregaBadge2" class="form-label">Rozet 2</label>
                  <input type="text" id="facilityAgregaBadge2" class="form-control">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="facilityAgregaBadge3" class="form-label">Rozet 3</label>
                  <input type="text" id="facilityAgregaBadge3" class="form-control">
                </div>
              </div>

              <div class="d-flex flex-wrap gap-2">
                <button type="submit" class="btn btn-admin-primary">
                  <i class="bi bi-save me-2"></i>Gelişmiş Tesis Verisini Kaydet
                </button>

                <button type="button" id="loadFacilitiesAdvancedBtn" class="btn btn-outline-secondary btn-admin-secondary">
                  <i class="bi bi-arrow-repeat me-2"></i>Kayıtlı Veriyi Getir
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  </main>

    <script>
    document.addEventListener('DOMContentLoaded', function () {
      const observer = new MutationObserver(() => {
        const mainCount = document.getElementById('newsCount');
        const badge = document.getElementById('newsCountBadge');
        if (mainCount && badge) {
          badge.textContent = mainCount.textContent;
        }
      });

      const target = document.getElementById('newsCount');
      if (target) {
        observer.observe(target, {
          childList: true,
          subtree: true,
          characterData: true
        });

        const badge = document.getElementById('newsCountBadge');
        if (badge) {
          badge.textContent = target.textContent;
        }
      }
    });
  </script>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="admin.js"></script>
</body>
</html>