"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { BottomNav } from "@/components/bottom-nav"
import { createClient } from "@/lib/supabase/client"
import { 
  Trophy, 
  Users, 
  UserPlus, 
  Copy, 
  Check, 
  X, 
  Medal,
  Leaf,
  Crown,
  RefreshCw,
  User
} from "lucide-react"

interface Friend {
  id: string
  full_name: string
  friend_code: string
  weekly_emissions: number
  rank?: number
}

interface UserProfile {
  id: string
  full_name: string
  friend_code: string
}

export default function RankingPage() {
  const router = useRouter()
  const { isLoggedIn, user } = useApp()
  const [friends, setFriends] = useState<Friend[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [friendCode, setFriendCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addingFriend, setAddingFriend] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const supabase = createClient()

  const loadData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      // Cargar perfil del usuario
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, friend_code")
        .eq("id", user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
      }

      // Cargar amigos
      const { data: friendships } = await supabase
        .from("friendships")
        .select("friend_id")
        .eq("user_id", user.id)

      // IDs a consultar (usuario + amigos)
      const idsToQuery = [user.id]
      if (friendships && friendships.length > 0) {
        friendships.forEach(f => idsToQuery.push(f.friend_id))
      }

      // Obtener datos de ranking
      const { data: rankingData } = await supabase
        .from("weekly_rankings")
        .select("*")
        .in("id", idsToQuery)

      if (rankingData) {
        // Ordenar por emisiones (menor a mayor)
        const sorted = rankingData.sort((a, b) => 
          Number(a.weekly_emissions) - Number(b.weekly_emissions)
        )
        // Asignar ranking
        const ranked = sorted.map((f, index) => ({
          id: f.id,
          full_name: f.full_name || "Usuario",
          friend_code: f.friend_code || "",
          weekly_emissions: Number(f.weekly_emissions) || 0,
          rank: index + 1
        }))
        setFriends(ranked)
      }
    } catch (err) {
      console.error("Error loading data:", err)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/")
      return
    }
    loadData()
  }, [isLoggedIn, router, loadData])

  const copyFriendCode = async () => {
    if (!userProfile?.friend_code) return
    
    try {
      await navigator.clipboard.writeText(userProfile.friend_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("No se pudo copiar el codigo")
    }
  }

  const addFriend = async () => {
    if (!friendCode.trim() || !user) return

    setAddingFriend(true)
    setError("")
    setSuccess("")

    try {
      // Buscar usuario por codigo
      const { data: friendProfile, error: searchError } = await supabase
        .from("profiles")
        .select("id, full_name, friend_code")
        .eq("friend_code", friendCode.toUpperCase().trim())
        .single()

      if (searchError || !friendProfile) {
        setError("No se encontro ningun usuario con ese codigo")
        setAddingFriend(false)
        return
      }

      if (friendProfile.id === user.id) {
        setError("No puedes agregarte a ti mismo")
        setAddingFriend(false)
        return
      }

      // Verificar si ya son amigos
      const { data: existing } = await supabase
        .from("friendships")
        .select("id")
        .eq("user_id", user.id)
        .eq("friend_id", friendProfile.id)
        .single()

      if (existing) {
        setError("Ya tienes a este usuario como amigo")
        setAddingFriend(false)
        return
      }

      // Agregar amistad (bidireccional)
      const { error: insertError } = await supabase
        .from("friendships")
        .insert([
          { user_id: user.id, friend_id: friendProfile.id },
          { user_id: friendProfile.id, friend_id: user.id }
        ])

      if (insertError) {
        setError("Error al agregar amigo. Intenta de nuevo.")
        setAddingFriend(false)
        return
      }

      setSuccess(`Agregaste a ${friendProfile.full_name} como amigo`)
      setFriendCode("")
      setShowAddFriend(false)
      loadData()
    } catch {
      setError("Error de conexion. Intenta de nuevo.")
    } finally {
      setAddingFriend(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">{rank}</span>
    }
  }

  const getWeekRange = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMonday)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const formatDate = (date: Date) => 
      date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })

    return `${formatDate(monday)} - ${formatDate(sunday)}`
  }

  if (!isLoggedIn) return null

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Ranking Semanal</h1>
              <p className="text-xs text-muted-foreground">{getWeekRange()}</p>
            </div>
            <button
              onClick={loadData}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
              aria-label="Actualizar ranking"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Tu codigo de amigo */}
        <div className="mb-6 rounded-2xl bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Tu codigo de amigo</h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 px-4 py-2">
                <span className="font-mono text-lg font-bold tracking-wider text-primary">
                  {userProfile?.friend_code || "--------"}
                </span>
              </div>
            </div>
            <button
              onClick={copyFriendCode}
              className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-accent" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar
                </>
              )}
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Comparte este codigo con tus amigos para competir juntos
          </p>
        </div>

        {/* Agregar amigo */}
        <div className="mb-6">
          {!showAddFriend ? (
            <button
              onClick={() => setShowAddFriend(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <UserPlus className="h-5 w-5" />
              Agregar amigo
            </button>
          ) : (
            <div className="rounded-2xl bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Agregar amigo</h3>
                <button
                  onClick={() => {
                    setShowAddFriend(false)
                    setFriendCode("")
                    setError("")
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  placeholder="Codigo de amigo"
                  maxLength={8}
                  className="flex-1 rounded-xl bg-secondary px-4 py-3 font-mono text-sm uppercase tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={addFriend}
                  disabled={addingFriend || !friendCode.trim()}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {addingFriend ? "..." : "Agregar"}
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
              {success && <p className="mt-2 text-xs text-accent">{success}</p>}
            </div>
          )}
        </div>

        {/* Ranking */}
        <div className="mb-4">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">Ranking de amigos</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : friends.length === 0 ? (
            <div className="rounded-2xl bg-card p-8 text-center">
              <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Agrega amigos para ver el ranking semanal
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {friends.map((friend) => {
                const isCurrentUser = friend.id === user?.id
                return (
                  <div
                    key={friend.id}
                    className={`flex items-center gap-4 rounded-2xl p-4 ${
                      isCurrentUser ? "bg-primary/10 ring-2 ring-primary/30" : "bg-card"
                    }`}
                  >
                    {/* Ranking */}
                    <div className="flex h-10 w-10 items-center justify-center">
                      {getRankIcon(friend.rank || 0)}
                    </div>

                    {/* Avatar */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {friend.full_name || "Usuario"}
                        </p>
                        {isCurrentUser && (
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                            Tu
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {friend.friend_code}
                      </p>
                    </div>

                    {/* Emisiones */}
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Leaf className="h-3 w-3 text-accent" />
                        <p className="text-lg font-bold text-foreground">
                          {friend.weekly_emissions.toFixed(1)}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">kg CO2e</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="rounded-2xl bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-accent/20 p-2">
              <Leaf className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Menos es mejor</p>
              <p className="text-xs text-muted-foreground">
                El ranking se basa en quien emite menos CO2 durante la semana. 
                El ranking se reinicia cada lunes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
