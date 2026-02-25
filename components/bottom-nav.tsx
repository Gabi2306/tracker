"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, Clock, BarChart3, User, Plus } from "lucide-react"

const NAV_ITEMS = [
  { label: "Inicio", icon: Home, path: "/dashboard" },
  { label: "Historial", icon: Clock, path: "/dashboard" },
  { label: "add", icon: Plus, path: "" },
  { label: "Estadisticas", icon: BarChart3, path: "/dashboard" },
  { label: "Perfil", icon: User, path: "/dashboard" },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="sticky bottom-0 flex items-center justify-around border-t border-border bg-card px-2 pb-6 pt-2" role="navigation" aria-label="Navegacion principal">
      {NAV_ITEMS.map((item) => {
        if (item.label === "add") {
          return (
            <button
              key="add"
              onClick={() => router.push("/log-food")}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
              aria-label="Agregar nueva entrada"
            >
              <Plus className="h-6 w-6" />
            </button>
          )
        }

        const isActive = pathname === item.path && item.label === "Inicio"

        return (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
