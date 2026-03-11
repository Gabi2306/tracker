"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { BottomNav } from "@/components/bottom-nav"
import { WeeklyChart } from "@/components/weekly-chart"
import { TrendingDown, TrendingUp, Utensils, Bus, Leaf } from "lucide-react"

export default function EstadisticasPage() {
  const router = useRouter()
  const { isLoggedIn, activities, getWeeklyData } = useApp()

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/")
    }
  }, [isLoggedIn, router])

  const weeklyData = getWeeklyData()

  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const todayActivities = activities.filter((a) => new Date(a.timestamp) >= today)
    const weekActivities = activities.filter((a) => new Date(a.timestamp) >= weekAgo)
    const monthActivities = activities.filter((a) => new Date(a.timestamp) >= monthAgo)

    const todayEmissions = todayActivities.reduce((sum, a) => sum + a.emissions, 0)
    const weekEmissions = weekActivities.reduce((sum, a) => sum + a.emissions, 0)
    const monthEmissions = monthActivities.reduce((sum, a) => sum + a.emissions, 0)

    const foodEmissions = activities
      .filter((a) => a.type === "food")
      .reduce((sum, a) => sum + a.emissions, 0)
    const transportEmissions = activities
      .filter((a) => a.type === "transport")
      .reduce((sum, a) => sum + a.emissions, 0)

    const totalEmissions = activities.reduce((sum, a) => sum + a.emissions, 0)
    const foodPercentage = totalEmissions > 0 ? (foodEmissions / totalEmissions) * 100 : 0
    const transportPercentage = totalEmissions > 0 ? (transportEmissions / totalEmissions) * 100 : 0

    // Calcular tendencia semanal
    const thisWeekTotal = weeklyData.slice(-3).reduce((sum, d) => sum + d.emissions, 0)
    const lastWeekTotal = weeklyData.slice(0, 3).reduce((sum, d) => sum + d.emissions, 0)
    const weeklyTrend = lastWeekTotal > 0 
      ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 
      : 0

    return {
      today: todayEmissions,
      week: weekEmissions,
      month: monthEmissions,
      total: totalEmissions,
      foodEmissions,
      transportEmissions,
      foodPercentage,
      transportPercentage,
      weeklyTrend,
      totalActivities: activities.length,
    }
  }, [activities, weeklyData])

  if (!isLoggedIn) return null

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Estadisticas</h1>
          <p className="text-xs text-muted-foreground">Analisis de tus emisiones</p>
        </div>

        {/* Resumen de emisiones */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4">
            <p className="text-xs text-muted-foreground">Hoy</p>
            <p className="text-2xl font-bold text-foreground">{stats.today.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg CO2e</p>
          </div>
          <div className="rounded-2xl bg-card p-4">
            <p className="text-xs text-muted-foreground">Esta semana</p>
            <p className="text-2xl font-bold text-foreground">{stats.week.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg CO2e</p>
          </div>
          <div className="rounded-2xl bg-card p-4">
            <p className="text-xs text-muted-foreground">Este mes</p>
            <p className="text-2xl font-bold text-foreground">{stats.month.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg CO2e</p>
          </div>
          <div className="rounded-2xl bg-card p-4">
            <p className="text-xs text-muted-foreground">Total historico</p>
            <p className="text-2xl font-bold text-foreground">{stats.total.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg CO2e</p>
          </div>
        </div>

        {/* Tendencia semanal */}
        <div className="mb-6 rounded-2xl bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Tendencia semanal</h2>
            <div className={`flex items-center gap-1 ${stats.weeklyTrend <= 0 ? "text-accent" : "text-destructive"}`}>
              {stats.weeklyTrend <= 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              <span className="text-xs font-medium">
                {Math.abs(stats.weeklyTrend).toFixed(0)}% {stats.weeklyTrend <= 0 ? "menos" : "mas"}
              </span>
            </div>
          </div>
          <WeeklyChart data={weeklyData} />
        </div>

        {/* Distribucion por tipo */}
        <div className="mb-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground">Distribucion por tipo</h2>
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Alimentos</p>
                    <p className="text-xs text-muted-foreground">{stats.foodEmissions.toFixed(1)} kg CO2e</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-foreground">{stats.foodPercentage.toFixed(0)}%</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${stats.foodPercentage}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                    <Bus className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Transporte</p>
                    <p className="text-xs text-muted-foreground">{stats.transportEmissions.toFixed(1)} kg CO2e</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-foreground">{stats.transportPercentage.toFixed(0)}%</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${stats.transportPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Impacto ambiental */}
        <div className="mb-4 rounded-2xl bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Leaf className="h-4 w-4 text-accent" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Tu impacto</h2>
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>
              Has emitido <span className="font-semibold text-foreground">{stats.total.toFixed(1)} kg</span> de CO2e en total.
            </p>
            <p>
              Esto equivale a <span className="font-semibold text-foreground">{(stats.total / 22).toFixed(1)} arboles</span> necesarios para absorberlo en un ano.
            </p>
            <p>
              O <span className="font-semibold text-foreground">{(stats.total / 0.192).toFixed(0)} km</span> recorridos en auto.
            </p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
