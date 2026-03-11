"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { ChevronLeft, Info, User } from "lucide-react"
import { Home, Utensils, BarChart3, Trophy } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const TOP_THREE = [
  { name: "Leo King", kg: "38.2", pos: 2 },
  { name: "Alex Rivers", kg: "42.5", pos: 1 },
  { name: "Maya Wu", kg: "35.9", pos: 3 },
]

const CONTRIBUTORS = [
  { pos: 4, name: "Jordan Smith", label: "TRANSPORTE ACTIVO", kg: "31.4" },
  { pos: 5, name: "Sarah Chen", label: "ECO VIAJERO", kg: "28.7" },
  { pos: 6, name: "Markus J.", label: "DIETA VEGETAL", kg: "25.1" },
]

function RankingBottomNav() {
  const pathname = usePathname()
  const items = [
    { label: "Inicio", icon: Home, path: "/dashboard" },
    { label: "Registro", icon: Utensils, path: "/log-food" },
    { label: "Ranking", icon: Trophy, path: "/ranking" },
    { label: "Estadisticas", icon: BarChart3, path: "/dashboard" },
    { label: "Perfil", icon: User, path: "/dashboard" },
  ]

  return (
    <nav className="sticky bottom-0 flex items-center justify-around border-t border-border bg-card px-2 pb-6 pt-3">
      {items.map((item) => {
        const isActive = item.path === pathname
        return (
          <Link key={item.label} href={item.path}>
            <div className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}>
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}

export default function RankingPage() {
  const router = useRouter()
  const { user, isLoggedIn } = useApp()
  const [tab, setTab] = useState("Esta semana")

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/")
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn) return null

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-4">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-foreground">Ranking Semanal</h1>
          <Info className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Tab Selector */}
        <div className="mb-6 flex rounded-xl bg-secondary p-1">
          {["Esta semana", "Semana pasada"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Podium */}
        <div className="mb-8 flex items-end justify-center gap-4 pt-4">
          {TOP_THREE.map((person) => {
            const isFirst = person.pos === 1
            const size = isFirst ? "h-20 w-20" : "h-16 w-16"
            const order = person.pos === 2 ? "order-1" : person.pos === 1 ? "order-2" : "order-3"

            return (
              <div key={person.pos} className={`flex flex-col items-center ${order}`}>
                <div className="relative">
                  <div className={`${size} flex items-center justify-center rounded-full ${
                    isFirst
                      ? "border-2 border-accent bg-primary shadow-lg shadow-primary/30"
                      : "border border-border bg-secondary"
                  }`}>
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  {isFirst && (
                    <div className="absolute -right-1 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                      1ro
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs font-semibold text-foreground">{person.name}</p>
                <p className="text-[11px] text-accent">{person.kg} kg ahorrado</p>
              </div>
            )
          })}
        </div>

        {/* Top Contributors */}
        <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground">
          Mejores contribuidores
        </h2>
        <div className="flex flex-col gap-2">
          {CONTRIBUTORS.map((c) => (
            <div key={c.pos} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
              <span className="w-5 text-sm font-bold text-muted-foreground">{c.pos}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{c.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.label}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{c.kg} kg</p>
                <span className="text-[9px] font-bold uppercase text-accent">AHORRADO</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tu banner */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3.5">
          <span className="text-base font-bold text-white/70">12</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Tu ({user?.name ?? "Usuario"})</p>
            <p className="text-[10px] uppercase text-white/70">SUBIO 3 PUESTOS ESTA SEMANA</p>
          </div>
          <div className="text-right">
            <p className="text-base font-bold text-white">18.4 kg</p>
            <p className="text-[9px] uppercase text-white/70">CARBONO AHORRADO</p>
          </div>
        </div>
      </div>

      <RankingBottomNav />
    </div>
  )
}
