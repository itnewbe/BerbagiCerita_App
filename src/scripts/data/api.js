import CONFIG from "../config";

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/unsubscribe`,
};

// Ganti token berikut dengan token dari akun tamu/guest login
const GUEST_TOKEN = "login_guest";

// Fungsi untuk mendapatkan token dari localStorage atau fallback guest token
function getToken() {
  return localStorage.getItem("token") || GUEST_TOKEN;
}

// Fungsi untuk mendapatkan daftar cerita
export async function getStories() {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await fetch(`${ENDPOINTS.STORIES}?location=1`, {
      method: "GET",
      headers,
    });

    const result = await response.json();
    console.log("Data dari API:", result);

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengambil data cerita");
    }

    return result;
  } catch (error) {
    console.error("Error mengambil cerita:", error);
    throw new Error(error.message);
  }
}

// Fungsi untuk mendapatkan detail cerita berdasarkan ID
export async function getStoryDetail(id) {
  if (!id || id === "null" || id === "undefined") {
    throw new Error("ID cerita tidak valid.");
  }

  const token = getToken();
  try {
    const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal mengambil detail cerita");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
}

// Fungsi untuk menambah cerita
export async function addStory(description, photo, lat = null, lon = null) {
  if (!description.trim()) {
    throw new Error("Deskripsi tidak boleh kosong.");
  }

  if (!photo) {
    throw new Error("Foto harus diunggah.");
  }

  if (photo.size > 1024 * 1024) {
    throw new Error("Ukuran foto tidak boleh lebih dari 1MB.");
  }

  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);

  if (lat !== null && lon !== null) {
    if (isNaN(lat) || isNaN(lon)) {
      throw new Error("Koordinat tidak valid.");
    }
    formData.append("lat", lat);
    formData.append("lon", lon);
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token tidak ditemukan, silakan login.");
    }

    const response = await fetch(ENDPOINTS.ADD_STORY, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Gagal menambahkan cerita.");
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Fungsi untuk menambah cerita sebagai tamu (tanpa login)
export async function addStoryGuest(
  description,
  photo,
  lat = null,
  lon = null
) {
  if (!description.trim()) {
    throw new Error("Deskripsi tidak boleh kosong.");
  }

  if (!photo) {
    throw new Error("Foto harus diunggah.");
  }

  if (photo.size > 1024 * 1024) {
    throw new Error("Ukuran foto tidak boleh lebih dari 1MB.");
  }

  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);

  if (lat !== null && lon !== null) {
    if (isNaN(lat) || isNaN(lon)) {
      throw new Error("Koordinat tidak valid.");
    }
    formData.append("lat", lat);
    formData.append("lon", lon);
  }

  try {
    const response = await fetch(`${CONFIG.BASE_URL}/stories/guest`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(
        result.message || "Gagal menambahkan cerita sebagai tamu."
      );
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Fungsi untuk login dan menyimpan token ke localStorage
export async function login(email, password) {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Login gagal.");
    }

    if (!result.error) {
      localStorage.setItem("token", result.loginResult.token);
      localStorage.setItem("name", result.loginResult.name);
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Fungsi untuk logout user
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
}

export async function subscribePushNotification({
  endpoint,
  keys: { p256dh, auth },
}) {
  const accessToken = getToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getToken();
  const data = JSON.stringify({ endpoint });

  const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

// Fungsi untuk register user baru
export async function register(name, email, password) {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Registrasi gagal.");
    }

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}
