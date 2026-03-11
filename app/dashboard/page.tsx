"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { EmissionsRing } from "@/components/emissions-ring"
import { WeeklyChart } from "@/components/weekly-chart"
import { BottomNav } from "@/components/bottom-nav"
import { Utensils, Bus, TrendingDown, ChevronRight, LogOut, Lightbulb, X } from "lucide-react"
import { ENVIRONMENTAL_TIPS, type EnvironmentalTip } from "@/lib/environmental-tips"

// Funcion para obtener tip basado en emisiones del dia
function getTipForEmissions(emissions: number): EnvironmentalTip {
  // Generar un seed basado en la fecha para que sea el mismo tip todo el dia
  const today = new Date()
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  
  let tips: EnvironmentalTip[]
  
  if (emissions === 0) {
    // Sin actividades - tip general motivacional
    tips = ENVIRONMENTAL_TIPS.filter(t => t.category === "general")
  } else if (emissions < 3) {
    // Bajo impacto - felicitar y tips de energia/agua
    tips = ENVIRONMENTAL_TIPS.filter(t => t.category === "energy" || t.category === "water" || t.category === "general")
  } else if (emissions < 8) {
    // Impacto moderado - tips de comida y transporte
    tips = ENVIRONMENTAL_TIPS.filter(t => t.category === "food" || t.category === "transport")
  } else {
    // Alto impacto - tips especificos de reduccion
    tips = ENVIRONMENTAL_TIPS.filter(t => t.category === "food" || t.category === "transport" || t.category === "waste")
  }
  
  // Usar el seed para seleccionar siempre el mismo tip del dia
  const index = dateSeed % tips.length
  return tips[index]
}

export default function DashboardPage() {
  const router = useRouter()
  const {
    user,
    isLoggedIn,
    logout,
    getTodayEmissions,
    getYesterdayEmissions,
    getWeeklyData,
    getRecentActivities,
  } = useApp()

  const [showTip, setShowTip] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/")
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn) return null

  const todayEmissions = getTodayEmissions()
  const yesterdayEmissions = getYesterdayEmissions()
  const weeklyData = getWeeklyData()
  const recentActivities = getRecentActivities()
  
  // Obtener tip del dia basado en emisiones
  const dailyTip = useMemo(() => getTipForEmissions(todayEmissions), [todayEmissions])

  const percentChange = yesterdayEmissions > 0
    ? Math.round(((yesterdayEmissions - todayEmissions) / yesterdayEmissions) * 100)
    : 0

  function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos dias"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {(user?.name?.[0] ?? "U").toUpperCase()}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{getGreeting()}</p>
              <p className="text-lg font-bold text-foreground">Hola, {user?.name ?? "Usuario"}</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await logout()
              router.push("/")
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground"
            aria-label="Cerrar sesion"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        {/* Anillo de emisiones */}
        <div className="relative mb-6 flex flex-col items-center rounded-2xl bg-card px-6 py-6">
          <EmissionsRing value={todayEmissions} />
          <p className="mt-3 text-sm text-muted-foreground">Emisiones totales de hoy</p>
          {percentChange > 0 && (
            <div className="mt-1 flex items-center gap-1 text-accent">
              <TrendingDown className="h-3 w-3" />
              <span className="text-xs font-medium">{percentChange}% menos que ayer</span>
            </div>
          )}
          {todayEmissions === 0 && (
            <p className="mt-1 text-xs text-muted-foreground">Registra tu primera actividad</p>
          )}
        </div>

        {/* Tip ambiental del dia */}
        {showTip && (
          <div className="mb-6 rounded-2xl bg-accent/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/20">
                  <Lightbulb className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">Tip del dia</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{dailyTip.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{dailyTip.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTip(false)}
                className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Cerrar tip"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Registrar actividad */}
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground">Registrar actividad</h2>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/log-food")}
              className="flex flex-1 items-center gap-3 rounded-2xl bg-card px-4 py-4 transition-colors active:bg-secondary"
            >
              <div className="pointer-events-none flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Utensils className="h-5 w-5" />
              </div>
              <div className="pointer-events-none text-left">
                <p className="text-sm font-semibold text-foreground">Alimentos</p>
                <p className="text-[11px] text-muted-foreground">Comidas y bebidas</p>
              </div>
            </button>
            <button
              onClick={() => router.push("/log-transport")}
              className="flex flex-1 items-center gap-3 rounded-2xl bg-card px-4 py-4 transition-colors active:bg-secondary"
            >
              <div className="pointer-events-none flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Bus className="h-5 w-5" />
              </div>
              <div className="pointer-events-none text-left">
                <p className="text-sm font-semibold text-foreground">Transporte</p>
                <p className="text-[11px] text-muted-foreground">Viajes y traslados</p>
              </div>
            </button>
          </div>
        </div>

        {/* Tendencia semanal */}
        <div className="mb-6 rounded-2xl bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Tendencia semanal</h2>
            <span className="text-[11px] text-muted-foreground">Ultimos 7 dias</span>
          </div>
          <WeeklyChart data={weeklyData} />
        </div>

        {/* Actividad reciente */}
        <div className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Actividad reciente</h2>
            <button 
              onClick={() => router.push("/historial")}
              className="px-1 py-1 text-xs font-medium text-primary"
            >
              Ver historial
            </button>
          </div>
          {recentActivities.length === 0 ? (
            <div className="rounded-2xl bg-card px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No hay actividades registradas aun</p>
              <p className="mt-1 text-xs text-muted-foreground">Comienza registrando un alimento o viaje</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    activity.type === "food"
                      ? "bg-accent/20 text-accent"
                      : "bg-primary/20 text-primary"
                  }`}>
                    {activity.type === "food" ? (
                      <Utensils className="h-4 w-4" />
                    ) : (
                      <Bus className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{activity.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      {new Date(activity.timestamp).toLocaleTimeString("es-ES", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{activity.emissions.toFixed(1)} kg</p>
                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                      {activity.type === "food" ? "COMIDA" : "TRANSPORTE"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
