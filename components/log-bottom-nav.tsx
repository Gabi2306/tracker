"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, Utensils, BarChart3, User } from "lucide-react"

const NAV_ITEMS = [
  { label: "Inicio", icon: Home, path: "/dashboard" },
  { label: "Registro", icon: Utensils, path: "/log-food" },
  { label: "Estadisticas", icon: BarChart3, path: "/dashboard" },
  { label: "Perfil", icon: User, path: "/dashboard" },
]

export function LogBottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="sticky bottom-0 flex items-center justify-around border-t border-border bg-card px-2 pb-6 pt-3" role="navigation" aria-label="Navegacion de registro">
      {NAV_ITEMS.map((item) => {
        const isActive =
          (item.label === "Registro" && (pathname === "/log-food" || pathname === "/log-transport")) ||
          (item.label === "Inicio" && pathname === "/dashboard")

        return (
          <button
            key={item.label}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 transition-colors ${
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
