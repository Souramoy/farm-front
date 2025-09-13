"use client";
import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js" , { scope: "/" })
          .then((registration) => {
            console.log("✅ Service Worker registered with scope:", registration.scope);
          })
          .catch((err) => {
            console.error("❌ Service Worker registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}