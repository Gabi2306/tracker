// Service Worker para Carbon Tracker - Notificaciones Push

const ENVIRONMENTAL_TIPS = [
  {
    category: "food",
    title: "Reduce el consumo de carne roja",
    description: "La carne de res produce 27 kg de CO2 por kg. Intenta tener al menos 2 dias sin carne a la semana.",
  },
  {
    category: "food",
    title: "Compra productos locales",
    description: "Los alimentos importados generan emisiones por transporte. Prefiere productos de tu region.",
  },
  {
    category: "food",
    title: "Evita el desperdicio de alimentos",
    description: "Planifica tus comidas y usa las sobras. El 30% de la comida producida se desperdicia.",
  },
  {
    category: "food",
    title: "Opta por proteinas vegetales",
    description: "Las legumbres como lentejas y frijoles tienen 30 veces menos emisiones que la carne.",
  },
  {
    category: "transport",
    title: "Usa transporte publico",
    description: "El bus emite la mitad de CO2 por pasajero comparado con un auto particular.",
  },
  {
    category: "transport",
    title: "Camina o usa bicicleta",
    description: "Para distancias cortas (menos de 5 km), caminar o pedalear tiene cero emisiones.",
  },
  {
    category: "transport",
    title: "Comparte viajes",
    description: "El carpooling puede reducir tus emisiones de transporte hasta en un 75%.",
  },
  {
    category: "energy",
    title: "Usa bombillas LED",
    description: "Las LED consumen 75% menos energia que las incandescentes y duran 25 veces mas.",
  },
  {
    category: "energy",
    title: "Desconecta aparatos",
    description: "El consumo fantasma representa hasta el 10% de tu factura electrica.",
  },
  {
    category: "water",
    title: "Duchas cortas",
    description: "Reduce tu ducha a 5 minutos y ahorra hasta 45 litros de agua por dia.",
  },
  {
    category: "waste",
    title: "Recicla correctamente",
    description: "Separar residuos reduce la contaminacion y permite reutilizar materiales.",
  },
  {
    category: "waste",
    title: "Usa bolsas reutilizables",
    description: "Una bolsa de plastico tarda 500 anos en degradarse. Lleva tus propias bolsas.",
  },
  {
    category: "general",
    title: "Compra menos, elige mejor",
    description: "La produccion de bienes genera emisiones. Prioriza calidad sobre cantidad.",
  },
  {
    category: "general",
    title: "Planta arboles",
    description: "Un arbol absorbe aproximadamente 22 kg de CO2 al ano.",
  },
  {
    category: "general",
    title: "Mide tu impacto",
    description: "Llevar un registro de tus emisiones te ayuda a identificar donde mejorar.",
  },
]

function getRandomTip() {
  const randomIndex = Math.floor(Math.random() * ENVIRONMENTAL_TIPS.length)
  return ENVIRONMENTAL_TIPS[randomIndex]
}

// Instalar el service worker
self.addEventListener("install", (event) => {
  self.skipWaiting()
})

// Activar el service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim())
})

// Escuchar mensajes del cliente
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_NOTIFICATION") {
    const { hour, minute } = event.data
    scheduleNotification(hour, minute)
  }

  if (event.data && event.data.type === "CANCEL_NOTIFICATION") {
    // Las notificaciones se cancelan simplemente no programando nuevas
  }
})

// Programar notificacion
function scheduleNotification(hour, minute) {
  const now = new Date()
  const scheduledTime = new Date()
  scheduledTime.setHours(hour, minute, 0, 0)

  // Si ya paso la hora de hoy, programar para manana
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1)
  }

  const delay = scheduledTime.getTime() - now.getTime()

  setTimeout(() => {
    showNotification()
    // Programar la siguiente notificacion para manana
    scheduleNotification(hour, minute)
  }, delay)
}

// Mostrar notificacion
function showNotification() {
  const tip = getRandomTip()

  self.registration.showNotification("Tip Ambiental del Dia", {
    body: `${tip.title}: ${tip.description}`,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "eco-tip",
    vibrate: [200, 100, 200],
    data: {
      tip: tip,
      url: "/perfil",
    },
    actions: [
      {
        action: "view",
        title: "Ver mas",
      },
      {
        action: "dismiss",
        title: "Cerrar",
      },
    ],
  })
}

// Manejar click en la notificacion
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "view" || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes("/") && "focus" in client) {
            return client.focus()
          }
        }
        // Si no hay ventana, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow("/perfil")
        }
      })
    )
  }
})

// Manejar el evento push (para notificaciones del servidor)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}

  const options = {
    body: data.body || "Tienes un nuevo tip ambiental",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "eco-tip",
    data: data,
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "Carbon Tracker", options)
  )
})
