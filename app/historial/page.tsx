"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { BottomNav } from "@/components/bottom-nav"
import { ArrowLeft, Calendar, Search, Utensils, Bus, ChevronDown, X } from "lucide-react"

type FilterType = "all" | "food" | "transport"
type DateFilter = "all" | "today" | "week" | "month" | "year" | "custom"

export default function HistorialPage() {
  const router = useRouter()
  const { isLoggedIn, activities } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<FilterType>("all")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/")
    }
  }, [isLoggedIn, router])

  const filteredActivities = useMemo(() => {
    let filtered = [...activities]

    // Filtro por tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter((a) => a.type === typeFilter)
    }

    // Filtro por busqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((a) => a.name.toLowerCase().includes(query))
    }

    // Filtro por fecha
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (dateFilter) {
      case "today":
        filtered = filtered.filter((a) => new Date(a.timestamp) >= today)
        break
      case "week":
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        filtered = filtered.filter((a) => new Date(a.timestamp) >= weekAgo)
        break
      case "month":
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        filtered = filtered.filter((a) => new Date(a.timestamp) >= monthAgo)
        break
      case "year":
        const yearAgo = new Date(today)
        yearAgo.setFullYear(yearAgo.getFullYear() - 1)
        filtered = filtered.filter((a) => new Date(a.timestamp) >= yearAgo)
        break
      case "custom":
        if (customStartDate) {
          const start = new Date(customStartDate)
          start.setHours(0, 0, 0, 0)
          filtered = filtered.filter((a) => new Date(a.timestamp) >= start)
        }
        if (customEndDate) {
          const end = new Date(customEndDate)
          end.setHours(23, 59, 59, 999)
          filtered = filtered.filter((a) => new Date(a.timestamp) <= end)
        }
        break
    }

    return filtered
  }, [activities, typeFilter, searchQuery, dateFilter, customStartDate, customEndDate])

  // Agrupar actividades por fecha
  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: typeof activities } = {}

    filteredActivities.forEach((activity) => {
      const date = new Date(activity.timestamp)
      const dateKey = date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(activity)
    })

    return Object.entries(groups).map(([date, acts]) => ({
      date,
      activities: acts,
      totalEmissions: acts.reduce((sum, a) => sum + a.emissions, 0),
    }))
  }, [filteredActivities])

  const totalEmissions = filteredActivities.reduce((sum, a) => sum + a.emissions, 0)

  if (!isLoggedIn) return null

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Historial</h1>
            <p className="text-xs text-muted-foreground">Todas tus actividades registradas</p>
          </div>
        </div>

        {/* Barra de busqueda */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar actividades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="mb-4 flex flex-wrap gap-2">
          {/* Filtro por tipo */}
          <div className="flex gap-1 rounded-xl bg-card p-1">
            {(["all", "food", "transport"] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  typeFilter === type
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type === "all" && "Todos"}
                {type === "food" && (
                  <>
                    <Utensils className="h-3 w-3" />
                    Comida
                  </>
                )}
                {type === "transport" && (
                  <>
                    <Bus className="h-3 w-3" />
                    Transporte
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Filtro por fecha */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-xs font-medium text-foreground"
            >
              <Calendar className="h-3.5 w-3.5" />
              {dateFilter === "all" && "Todas las fechas"}
              {dateFilter === "today" && "Hoy"}
              {dateFilter === "week" && "Esta semana"}
              {dateFilter === "month" && "Este mes"}
              {dateFilter === "year" && "Este ano"}
              {dateFilter === "custom" && "Personalizado"}
              <ChevronDown className="h-3 w-3" />
            </button>

            {showDatePicker && (
              <div className="absolute left-0 top-full z-10 mt-2 w-64 rounded-xl bg-card p-3 shadow-lg">
                <div className="flex flex-col gap-1">
                  {([
                    { value: "all", label: "Todas las fechas" },
                    { value: "today", label: "Hoy" },
                    { value: "week", label: "Ultimos 7 dias" },
                    { value: "month", label: "Ultimo mes" },
                    { value: "year", label: "Ultimo ano" },
                    { value: "custom", label: "Personalizado" },
                  ] as { value: DateFilter; label: string }[]).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDateFilter(option.value)
                        if (option.value !== "custom") {
                          setShowDatePicker(false)
                        }
                      }}
                      className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        dateFilter === option.value
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-secondary"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {dateFilter === "custom" && (
                  <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Desde</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Hasta</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full rounded-lg bg-secondary px-3 py-2 text-sm text-foreground"
                      />
                    </div>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="mt-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                    >
                      Aplicar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resumen */}
        <div className="mb-4 rounded-2xl bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total de emisiones</p>
              <p className="text-2xl font-bold text-foreground">{totalEmissions.toFixed(1)} kg</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Actividades</p>
              <p className="text-2xl font-bold text-foreground">{filteredActivities.length}</p>
            </div>
          </div>
        </div>

        {/* Lista agrupada por fecha */}
        {groupedActivities.length === 0 ? (
          <div className="rounded-2xl bg-card px-4 py-12 text-center">
            <p className="text-sm text-muted-foreground">No hay actividades que coincidan</p>
            <p className="mt-1 text-xs text-muted-foreground">Intenta cambiar los filtros</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {groupedActivities.map((group) => (
              <div key={group.date}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-xs font-semibold capitalize text-muted-foreground">{group.date}</h3>
                  <span className="text-xs font-medium text-primary">{group.totalEmissions.toFixed(1)} kg</span>
                </div>
                <div className="flex flex-col gap-2">
                  {group.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          activity.type === "food"
                            ? "bg-accent/20 text-accent"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {activity.type === "food" ? (
                          <Utensils className="h-4 w-4" />
                        ) : (
                          <Bus className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{activity.name}</p>
                        <p className="text-[11px] text-muted-foreground">
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
                          CO2e
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
