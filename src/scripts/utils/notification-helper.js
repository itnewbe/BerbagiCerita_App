import {
  VAPID_PUBLIC_KEY,
  registerServiceWorker,
} from "./push-notification.js";
import { subscribePushNotification } from "../data/api.js";

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API unsupported.");
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === "denied") {
    alert("Izin notifikasi ditolak.");
    return false;
  }

  if (status === "default") {
    alert("Izin notifikasi ditutup atau diabaikan.");
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert("Anda sudah berlangganan push notification.");
    return;
  }

  console.log("Mulai berlangganan push notification...");

  const failureSubscribeMessage =
    "Langganan push notification gagal diaktifkan.";
  const successSubscribeMessage =
    "Langganan push notification berhasil diaktifkan.";
  let pushSubscription;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    pushSubscription = await registration.pushManager.subscribe(
      generateSubscribeOptions()
    );

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotification({ endpoint, keys });

    if (!response.ok) {
      console.error("subscribe: response:", response);
      alert(failureSubscribeMessage);
      await pushSubscription.unsubscribe();
      return;
    }

    alert(successSubscribeMessage);
  } catch (error) {
    console.error("subscribe: error:", error);
    alert(failureSubscribeMessage);
    await pushSubscription.unsubscribe();
  }
}

// Konversi VAPID key dari Base64 ke Uint8Array
function convertBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
