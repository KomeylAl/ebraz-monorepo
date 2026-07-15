import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<"reverb"> | null;
  }
}

if (typeof window !== "undefined") {
  (window as any).Pusher = Pusher;
}

let echoInstance: Echo<"reverb"> | null = null;

export const initializeEcho = (token: string): Echo<"reverb"> => {
  if (echoInstance) {
    return echoInstance;
  }

  echoInstance = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
    wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
    forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],
    disableStats: true,

    // ارسال JWT token برای احراز هویت
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },

    // آدرس endpoint برای authorization
    authEndpoint: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/v1/broadcasting/auth`,
  });

  window.Echo = echoInstance;
  console.log(echoInstance);

  return echoInstance;
};

export const disconnectEcho = (): void => {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    window.Echo = null;
  }
};

export const getEcho = (): Echo<"reverb"> | null => {
  return echoInstance;
};
