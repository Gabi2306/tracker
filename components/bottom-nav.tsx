"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, Clock, Trophy, User } from "lucide-react"

const NAV_ITEMS = [
  { label: "Inicio", icon: Home, path: "/dashboard" },
  { label: "Historial", icon: Clock, path: "/historial" },
  { label: "Ranking", icon: Trophy, path: "/ranking" },
  { label: "Perfil", icon: User, path: "/perfil" },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="sticky bottom-0 flex items-center justify-around border-t border-border bg-card px-2 pb-6 pt-2" role="navigation" aria-label="Navegacion principal">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path

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
