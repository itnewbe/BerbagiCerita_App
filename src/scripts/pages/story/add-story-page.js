import AddStoryPresenter from "./add-story-presenter";

export default class AddStoryPage {
  constructor() {
    this.activeCameraStream = null;
  }

  async render() {
    return `
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div id="toast"></div>

      <section class="story-form-container">
        <h1>Tambah Cerita</h1>
        <form id="story-form" class="story-form-grid">
          <label for="story-description">Deskripsi:</label>
          <textarea id="story-description" placeholder="Deskripsi cerita" required></textarea>

          <label for="story-photo">Foto (dari file atau kamera):</label>
          <input type="file" id="story-photo" accept="image/*" capture="environment" />
          <img id="photo-preview" alt="Preview foto" />
          <div style="margin-top: 10px;">
            <button type="button" id="open-camera">📷 Buka Kamera</button>
            <video id="camera-preview" autoplay playsinline></video>
            <canvas id="snapshot" style="display:none;"></canvas>
            <button type="button" id="take-photo" style="display:none;">📸 Ambil Foto</button>
          </div>

          <label for="story-location">Lokasi:</label>
          <input type="text" id="story-location" placeholder="Lokasi (otomatis / klik peta)" readonly />

          <div id="map-container" style="height: 300px; border-radius: 10px;">
            <div id="story-map" style="height: 100%; width: 100%;"></div>
          </div>

          <div id="progress-bar"></div>
          <button type="submit">Kirim</button>
        </form>
        <p id="form-message"></p>
      </section>

      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    `;
  }

  async afterRender() {
    this.presenter = new AddStoryPresenter({
      form: document.getElementById("story-form"),
      toast: document.getElementById("toast"),
      messageContainer: document.getElementById("form-message"),
      photoInput: document.getElementById("story-photo"),
      previewImg: document.getElementById("photo-preview"),
      openCameraBtn: document.getElementById("open-camera"),
      cameraPreview: document.getElementById("camera-preview"),
      takePhotoBtn: document.getElementById("take-photo"),
      canvas: document.getElementById("snapshot"),
      locationInput: document.getElementById("story-location"),
      descriptionInput: document.getElementById("story-description"),
      progressBar: document.getElementById("progress-bar"),
      submitButton: document.querySelector('#story-form button[type="submit"]'),
      mapContainer: "story-map",
      onCameraStreamReady: (stream) => {
        this.activeCameraStream = stream;
      },
    });

    await this.presenter.init();
  }

  destroy() {
    // Matikan kamera saat berpindah halaman
    if (this.activeCameraStream) {
      this.activeCameraStream.getTracks().forEach((track) => track.stop());
      this.activeCameraStream = null;
    }

    const mapContainer = document.getElementById("story-map");
    if (mapContainer && mapContainer._leaflet_id) {
      const existingMap = window.L && window.L.DomUtil.get(mapContainer.id);
      if (existingMap) {
        mapContainer._leaflet_id = null;
        mapContainer.innerHTML = "";
      }
    }
  }
}
