"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export type ActivityType = "food" | "transport"

export interface ActivityEntry {
  id: string
  type: ActivityType
  name: string
  emissions: number
  timestamp: string
  details?: string
}

export interface User {
  id: string
  name: string
  email: string
}

interface AppContextType {
  user: User | null
  isLoggedIn: boolean
  activities: ActivityEntry[]
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  addActivity: (entry: Omit<ActivityEntry, "id" | "timestamp">) => Promise<void>
  getTodayEmissions: () => number
  getYesterdayEmissions: () => number
  getWeeklyData: () => { day: string; emissions: number }[]
  getRecentActivities: () => ActivityEntry[]
  refreshActivities: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

function mapSupabaseUser(su: SupabaseUser, profileName?: string): User {
  return {
    id: su.id,
    name: profileName || su.user_metadata?.name || su.email?.split("@")[0] || "Usuario",
    email: su.email || "",
  }
}

// Crear el cliente una sola vez fuera del componente
const supabase = createClient()

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const initRef = useRef(false)

  const loadActivities = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setActivities(
          data.map((row) => ({
            id: row.id,
            type: row.type as ActivityType,
            name: row.name,
            emissions: Number(row.emissions),
            timestamp: row.created_at,
            details: row.details || undefined,
          }))
        )
      }
    } catch {
      // Error de red silencioso - las actividades se cargan vacias
    }
  }, [])

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    async function init() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          let profileName: string | undefined
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", authUser.id)
              .single()
            profileName = profile?.name
          } catch {
            // Perfil no encontrado, usar metadata
          }
          setUser(mapSupabaseUser(authUser, profileName))
          await loadActivities(authUser.id)
        }
      } catch {
        // Error de conexion - el usuario simplemente no esta autenticado
      } finally {
        setLoading(false)
      }
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          let profileName: string | undefined
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", session.user.id)
              .single()
            profileName = profile?.name
          } catch {
            // Usar metadata como fallback
          }
          setUser(mapSupabaseUser(session.user, profileName))
          await loadActivities(session.user.id)
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setActivities([])
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [loadActivities])

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return { success: false, error: "Email o contrasena incorrectos" }
        }
        if (error.message.includes("Email not confirmed")) {
          return { success: false, error: "Debes confirmar tu email antes de iniciar sesion. Revisa tu bandeja de entrada." }
        }
        return { success: false, error: "No se pudo iniciar sesion. Verifica tus datos e intenta de nuevo." }
      }
      if (data.user) {
        let profileName: string | undefined
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", data.user.id)
            .single()
          profileName = profile?.name
        } catch {
          // Usar metadata
        }
        setUser(mapSupabaseUser(data.user, profileName))
        await loadActivities(data.user.id)
      }
      return { success: true }
    } catch {
      return { success: false, error: "Error de conexion. Verifica tu internet e intenta de nuevo." }
    }
  }, [loadActivities])

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
        },
      })
      if (error) {
        if (error.message.includes("already registered") || error.message.includes("already been registered")) {
          return { success: false, error: "Ya existe una cuenta con este email. Intenta iniciar sesion." }
        }
        if (error.message.includes("password")) {
          return { success: false, error: "La contrasena debe tener al menos 6 caracteres." }
        }
        return { success: false, error: "No se pudo crear la cuenta. Intenta de nuevo." }
      }

      // Si el usuario necesita confirmar email
      if (data.user && !data.session) {
        return { success: true, error: "confirm_email" }
      }

      if (data.user && data.session) {
        try {
          await supabase
            .from("profiles")
            .update({ name })
            .eq("id", data.user.id)
        } catch {
          // El trigger ya creo el perfil con el nombre
        }
        setUser(mapSupabaseUser(data.user, name))
        setActivities([])
      }
      return { success: true }
    } catch {
      return { success: false, error: "Error de conexion. Verifica tu internet e intenta de nuevo." }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // Limpiar estado local aunque falle la llamada
    }
    setUser(null)
    setActivities([])
  }, [])

  const addActivity = useCallback(async (entry: Omit<ActivityEntry, "id" | "timestamp">) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("activities")
        .insert({
          user_id: user.id,
          type: entry.type,
          name: entry.name,
          emissions: entry.emissions,
          details: entry.details || null,
        })
        .select()
        .single()

      if (!error && data) {
        const newEntry: ActivityEntry = {
          id: data.id,
          type: data.type as ActivityType,
          name: data.name,
          emissions: Number(data.emissions),
          timestamp: data.created_at,
          details: data.details || undefined,
        }
        setActivities((prev) => [newEntry, ...prev])
      }
    } catch {
      // Error silencioso - la actividad no se guarda pero la app no se rompe
    }
  }, [user])

  const refreshActivities = useCallback(async () => {
    if (user) {
      await loadActivities(user.id)
    }
  }, [user, loadActivities])

  const getTodayEmissions = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return activities
      .filter((a) => new Date(a.timestamp) >= today)
      .reduce((sum, a) => sum + a.emissions, 0)
  }, [activities])

  const getYesterdayEmissions = useCallback(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return activities
      .filter((a) => {
        const d = new Date(a.timestamp)
        return d >= yesterday && d < today
      })
      .reduce((sum, a) => sum + a.emissions, 0)
  }, [activities])

  const getWeeklyData = useCallback(() => {
    const days = ["L", "M", "X", "J", "V", "S", "D"]
    const data = days.map((day, i) => {
      const date = new Date()
      const currentDay = date.getDay()
      const diff = currentDay === 0 ? 6 : currentDay - 1
      date.setDate(date.getDate() - diff + i)
      date.setHours(0, 0, 0, 0)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const dayEmissions = activities
        .filter((a) => {
          const d = new Date(a.timestamp)
          return d >= date && d < nextDay
        })
        .reduce((sum, a) => sum + a.emissions, 0)

      return { day, emissions: Number(dayEmissions.toFixed(1)) }
    })
    return data
  }, [activities])

  const getRecentActivities = useCallback(() => {
    return activities.slice(0, 5)
  }, [activities])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isLoggedIn: user !== null,
        activities,
        loading,
        login,
        register,
        logout,
        addActivity,
        getTodayEmissions,
        getYesterdayEmissions,
        getWeeklyData,
        getRecentActivities,
        refreshActivities,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
