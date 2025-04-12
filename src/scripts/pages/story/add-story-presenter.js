import { addStory, addStoryGuest } from "../../data/api";

export default class AddStoryPresenter {
  constructor({
    form,
    toast,
    messageContainer,
    photoInput,
    previewImg,
    openCameraBtn,
    cameraPreview,
    takePhotoBtn,
    canvas,
    locationInput,
    descriptionInput,
    progressBar,
    submitButton,
    mapContainer,
    onCameraStreamReady = () => {},
  }) {
    this.form = form;
    this.toast = toast;
    this.messageContainer = messageContainer;
    this.photoInput = photoInput;
    this.previewImg = previewImg;
    this.openCameraBtn = openCameraBtn;
    this.cameraPreview = cameraPreview;
    this.takePhotoBtn = takePhotoBtn;
    this.canvas = canvas;
    this.locationInput = locationInput;
    this.descriptionInput = descriptionInput;
    this.progressBar = progressBar;
    this.submitButton = submitButton;
    this.mapContainer = mapContainer;
    this.onCameraStreamReady = onCameraStreamReady;

    this.stream = null;
    this.cameraBlob = null;
    this.lat = null;
    this.lon = null;
    this.marker = null;
    this.map = null;
  }

  async init() {
    this.bindCamera();
    this.bindFileInput();
    this.bindValidation();
    this.initMap();
    this.bindFormSubmit();
  }

  showToast(message) {
    clearTimeout(this.toast._timeoutId);
    this.toast.textContent = message;
    this.toast.classList.add("show");
    this.toast._timeoutId = setTimeout(() => {
      this.toast.classList.remove("show");
    }, 3000);
  }

  bindCamera() {
    this.openCameraBtn.addEventListener("click", async () => {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        this.cameraPreview.srcObject = this.stream;
        this.cameraPreview.style.display = "block";
        this.takePhotoBtn.style.display = "inline-block";
        this.photoInput.disabled = true;
        this.previewImg.style.display = "none";
        this.cameraBlob = null;
        this.showToast("✅ Kamera aktif");

        this.onCameraStreamReady(this.stream);
      } catch (err) {
        this.showToast("❌ Tidak bisa mengakses kamera: " + err.message);
      }
    });

    this.takePhotoBtn.addEventListener("click", () => {
      const context = this.canvas.getContext("2d");
      this.canvas.width = this.cameraPreview.videoWidth;
      this.canvas.height = this.cameraPreview.videoHeight;
      context.drawImage(this.cameraPreview, 0, 0);
      this.canvas.toBlob((blob) => {
        this.cameraBlob = blob;
        this.previewImg.src = URL.createObjectURL(blob);
        this.previewImg.style.display = "block";
      }, "image/jpeg");

      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }

      this.cameraPreview.style.display = "none";
      this.takePhotoBtn.style.display = "none";
      this.photoInput.disabled = false;
    });
  }

  bindFileInput() {
    this.photoInput.addEventListener("change", () => {
      const file = this.photoInput.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          this.showToast("Ukuran foto maksimal 2MB!");
          this.photoInput.value = "";
          this.previewImg.style.display = "none";
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImg.src = e.target.result;
          this.previewImg.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else {
        this.previewImg.style.display = "none";
      }
    });
  }

  bindValidation() {
    this.descriptionInput.addEventListener("input", () => {
      this.descriptionInput.style.borderColor = this.descriptionInput.validity
        .valid
        ? "green"
        : "red";
    });
  }

  initMap() {
    const L = window.L;
    const container = document.getElementById(this.mapContainer);

    if (container._leaflet_id) {
      container._leaflet_id = null;
      container.innerHTML = ""; // bersihkan isi container
    }

    const maptiler = L.tileLayer(
      "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=NjeKcNMoW7esmvGwvxpT",
      {
        attribution: "&copy; MapTiler & OpenStreetMap contributors",
      }
    );

    const osm = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
      }
    );

    const dark = L.tileLayer(
      "https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=NjeKcNMoW7esmvGwvxpT",
      {
        attribution: "&copy; MapTiler & OpenStreetMap contributors",
      }
    );

    const baseMaps = {
      "MapTiler Streets": maptiler,
      OpenStreetMap: osm,
      "Dark Mode": dark,
    };

    this.map = L.map(container, {
      center: [-6.2, 106.816666],
      zoom: 13,
      layers: [maptiler],
    });

    L.control.layers(baseMaps).addTo(this.map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          this.lat = position.coords.latitude;
          this.lon = position.coords.longitude;
          this.map.setView([this.lat, this.lon], 14);
          this.marker = L.marker([this.lat, this.lon]).addTo(this.map);
          this.locationInput.value = await this.getLocationName(
            this.lat,
            this.lon
          );
        },
        () => this.showToast("Izin lokasi ditolak. Pilih lokasi di peta.")
      );
    }

    this.map.on("click", async (e) => {
      this.lat = e.latlng.lat;
      this.lon = e.latlng.lng;
      if (this.marker) {
        this.marker.setLatLng([this.lat, this.lon]);
      } else {
        this.marker = L.marker([this.lat, this.lon]).addTo(this.map);
      }
      this.locationInput.value = await this.getLocationName(this.lat, this.lon);
    });
  }

  bindFormSubmit() {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const description = this.descriptionInput.value.trim();
      const photo = this.cameraBlob || this.photoInput.files[0];

      if (!description || !photo || this.lat === null || this.lon === null) {
        this.showToast("Semua data wajib diisi dan lokasi dipilih!");
        return;
      }

      this.submitButton.disabled = true;
      [...this.form.elements].forEach((el) => (el.disabled = true));
      this.messageContainer.textContent = "Mengunggah cerita...";
      this.progressBar.style.width = "10%";

      try {
        const token = localStorage.getItem("token");
        const upload = token ? addStory : addStoryGuest;

        let progress = 10;
        const interval = setInterval(() => {
          progress = Math.min(progress + 10, 90);
          this.progressBar.style.width = `${progress}%`;
        }, 200);

        await upload(description, photo, this.lat, this.lon);

        clearInterval(interval);
        this.progressBar.style.width = "100%";

        this.messageContainer.textContent = "Cerita berhasil ditambahkan!";
        this.form.reset();
        this.previewImg.style.display = "none";
        this.locationInput.value = "";
        this.progressBar.style.width = "0%";
        if (this.marker) this.marker.remove();
        this.showToast("✅ Cerita berhasil diunggah!");
      } catch (error) {
        this.progressBar.style.width = "0%";
        this.messageContainer.textContent = error.message;
        this.showToast("❌ Gagal mengunggah cerita");
      } finally {
        this.submitButton.disabled = false;
        [...this.form.elements].forEach((el) => (el.disabled = false));
      }
    });

    this.descriptionInput.focus();
  }

  async getLocationName(lat, lon) {
    const apiKey = "NjeKcNMoW7esmvGwvxpT";
    try {
      const res = await fetch(
        `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${apiKey}`
      );
      const data = await res.json();
      return data.features && data.features.length
        ? data.features[0].place_name
        : "Lokasi tidak ditemukan";
    } catch {
      return "Lokasi tidak tersedia";
    }
  }

  setLocation({ lat, lng }) {
    this.lat = lat;
    this.lon = lng;
  }
}
