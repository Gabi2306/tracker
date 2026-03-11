"use client"

import { useState, useEffect, useCallback } from "react"
import { getRandomTip } from "@/lib/environmental-tips"

interface NotificationSettings {
  enabled: boolean
  hour: number
  minute: number
}

const STORAGE_KEY = "notification-settings"
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  hour: 9,
  minute: 0,
}

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Verificar soporte y cargar configuracion
  useEffect(() => {
    if (typeof window === "undefined") return

    // Verificar soporte de notificaciones
    const supported = "Notification" in window && "serviceWorker" in navigator
    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)

      // Cargar configuracion guardada
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          setSettings(JSON.parse(saved))
        } catch {
          // Usar configuracion por defecto
        }
      }

      // Registrar service worker
      registerServiceWorker()
    }
  }, [])

  // Registrar el service worker
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      setSwRegistration(registration)

      // Esperar a que el service worker este listo
      await navigator.serviceWorker.ready
    } catch (error) {
      console.error("Error registering service worker:", error)
    }
  }

  // Guardar configuracion cuando cambia
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))

      // Comunicar al service worker
      if (settings.enabled && swRegistration?.active) {
        swRegistration.active.postMessage({
          type: "SCHEDULE_NOTIFICATION",
          hour: settings.hour,
          minute: settings.minute,
        })
      }
    }
  }, [settings, swRegistration])

  // Solicitar permiso de notificaciones
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === "granted"
    } catch {
      return false
    }
  }, [isSupported])

  // Activar/desactivar notificaciones
  const toggleNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false

    if (!settings.enabled) {
      // Activar notificaciones
      const granted = await requestPermission()
      if (granted) {
        setSettings((prev) => ({ ...prev, enabled: true }))
        return true
      }
      return false
    } else {
      // Desactivar notificaciones
      setSettings((prev) => ({ ...prev, enabled: false }))
      if (swRegistration?.active) {
        swRegistration.active.postMessage({ type: "CANCEL_NOTIFICATION" })
      }
      return true
    }
  }, [isSupported, settings.enabled, requestPermission, swRegistration])

  // Actualizar hora de notificacion
  const updateTime = useCallback((hour: number, minute: number) => {
    setSettings((prev) => ({ ...prev, hour, minute }))
  }, [])

  // Enviar notificacion de prueba
  const sendTestNotification = useCallback(() => {
    if (permission !== "granted") return

    const tip = getRandomTip()
    new Notification("Tip Ambiental del Dia", {
      body: `${tip.title}: ${tip.description}`,
      icon: "/icon-192.png",
      tag: "eco-tip-test",
    })
  }, [permission])

  // Formatear hora
  const formatTime = useCallback((hour: number, minute: number): string => {
    const h = hour % 12 || 12
    const m = minute.toString().padStart(2, "0")
    const period = hour < 12 ? "AM" : "PM"
    return `${h}:${m} ${period}`
  }, [])

  return {
    settings,
    permission,
    isSupported,
    toggleNotifications,
    updateTime,
    sendTestNotification,
    formatTime,
    requestPermission,
  }
}
