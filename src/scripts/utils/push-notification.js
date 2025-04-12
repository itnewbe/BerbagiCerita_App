import CONFIG from "../config";

export const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

export function isServiceWorkerAvailable() {
  return "serviceWorker" in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log("Service Worker API unsupported");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/sw.bundle.js"
    );
    console.log("Service worker telah terpasang", registration);
  } catch (error) {
    console.log("Failed to install service worker:", error);
  }
}
export const subscribePush = async () => {
  console.log("Mencoba subscribe push notification...");

  if ("PushManager" in window && "serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      let subscription = await reg.pushManager.getSubscription();

      // Jika belum ada subscription, buat yang baru
      if (!subscription) {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      console.log("Langganan aktif:", subscription);

      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("Token tidak ditemukan. User belum login?");
        return;
      }

      // Ambil data subscription dalam format yang diharapkan API
      const subscriptionPayload = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.getKey("p256dh")
            ? btoa(
                String.fromCharCode.apply(
                  null,
                  new Uint8Array(subscription.getKey("p256dh"))
                )
              )
            : "",
          auth: subscription.getKey("auth")
            ? btoa(
                String.fromCharCode.apply(
                  null,
                  new Uint8Array(subscription.getKey("auth"))
                )
              )
            : "",
        },
      };

      // Kirim subscription ke server
      const response = await fetch(
        `${CONFIG.BASE_URL}/notifications/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(subscriptionPayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gagal subscribe push notification:", errorData);
        return;
      }

      console.log("Berhasil dikirim ke endpoint /notifications/subscribe");
    } catch (error) {
      console.error("Terjadi kesalahan saat proses subscribe:", error);
    }
  } else {
    console.log("Browser tidak mendukung Push API");
  }
};

export const unsubscribePush = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    // Kirim DELETE ke server
    const response = await fetch(
      "https://story-api.dicoding.dev/v1/notifications/subscribe",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      }
    );

    if (!response.ok) {
      const result = await response.json();
      console.error("Gagal unsubscribe dari server:", result.message);
      throw new Error(result.message || "Gagal unsubscribe");
    }

    // Unsubscribe dari browser
    await subscription.unsubscribe();
    console.log("Berhasil unsubscribe dari PushManager & server.");
  } else {
    console.log("Tidak ada subscription aktif.");
  }
};

// Helper konversi base64 ke Uint8Array
export const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};
