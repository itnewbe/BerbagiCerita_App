import { getStoryDetail } from "../../data/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Konfigurasi ikon Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default class StoryDetailPresenter {
  async init() {
    const { id } = this._getStoryId();
    const container = document.getElementById("story-detail");

    if (!id) {
      container.innerHTML = "<p>ID cerita tidak ditemukan.</p>";
      return;
    }

    try {
      const { story } = await getStoryDetail(id);

      let locationName = "Lokasi tidak tersedia";
      if (story.lat && story.lon) {
        locationName = await this._getLocationName(story.lat, story.lon);
      }

      container.innerHTML = this._generateStoryHTML(story, locationName);

      if (story.lat && story.lon) {
        this._renderMap(story.lat, story.lon, locationName);
      }
    } catch (error) {
      container.innerHTML = `<p>Gagal memuat data cerita: ${error.message}</p>`;
    }
  }

  _getStoryId() {
    const parts = window.location.hash.split("/");
    return { id: parts[2] };
  }

  async _getLocationName(lat, lon) {
    const apiKey = "NjeKcNMoW7esmvGwvxpT";
    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${apiKey}`
      );
      const data = await response.json();
      return data.features[0]?.place_name || "Lokasi tidak ditemukan";
    } catch {
      return "Lokasi tidak tersedia";
    }
  }

  _generateStoryHTML(story, locationName) {
    return `
      <div style="text-align: center;">
        <h2 style="margin-bottom: 10px;">${story.name}</h2>
        <div style="width: 100%; max-height: 300px; overflow: hidden; display: flex; justify-content: center;">
          <img src="${story.photoUrl}" alt="Foto cerita oleh ${
      story.name
    }" style="height: 300px; object-fit: cover; border-radius: 10px;" />
        </div>
        <p style="font-size: 16px; line-height: 1.6; margin-top: 15px;">${
          story.description
        }</p>
        <p style="margin-top: 10px;"><strong>Lokasi:</strong> ${locationName}</p>
        <small style="color: #888;">Diposting pada ${new Date(
          story.createdAt
        ).toLocaleString()}</small>
      </div>
    `;
  }

  _renderMap(lat, lon, locationName) {
    const container = document.getElementById("map");
    if (container._leaflet_id) {
      container._leaflet_id = null;
      container.innerHTML = "";
    }

    // 🔹 Base Layers
    const maptiler = L.tileLayer(
      "https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=NjeKcNMoW7esmvGwvxpT",
      {
        attribution: "&copy; MapTiler & OpenStreetMap contributors",
      }
    );

    const satellite = L.tileLayer(
      "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=NjeKcNMoW7esmvGwvxpT",
      {
        attribution: "&copy; MapTiler Satellite & OpenStreetMap contributors",
      }
    );

    const dark = L.tileLayer(
      "https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=NjeKcNMoW7esmvGwvxpT",
      {
        attribution: "&copy; MapTiler & OpenStreetMap contributors",
      }
    );

    const baseMaps = {
      Streets: maptiler,
      "Dark Mode": dark,
      Hybrid: satellite,
    };

    const map = L.map("map", {
      center: [lat, lon],
      zoom: 14,
      layers: [maptiler],
    });

    // 🔹 Tambahkan layer control
    L.control.layers(baseMaps).addTo(map);

    // 🔹 Marker lokasi
    L.marker([lat, lon]).addTo(map).bindPopup(locationName).openPopup();
  }
}
