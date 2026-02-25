"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import { FOOD_DATABASE, calculateFoodEmissions } from "@/lib/carbon-data"
import { LogBottomNav } from "@/components/log-bottom-nav"
import { ChevronLeft, Search, Info, Minus, Plus, Leaf, Check } from "lucide-react"

type PortionUnit = "grams" | "ounces" | "servings"

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Meat: <span className="text-sm text-red-400" aria-hidden="true">&#9679;</span>,
  Seafood: <span className="text-sm text-blue-400" aria-hidden="true">&#9679;</span>,
  Dairy: <span className="text-sm text-yellow-400" aria-hidden="true">&#9679;</span>,
  Grains: <span className="text-sm text-amber-400" aria-hidden="true">&#9679;</span>,
  Legumes: <span className="text-sm text-green-400" aria-hidden="true">&#9679;</span>,
  Vegetables: <span className="text-sm text-emerald-400" aria-hidden="true">&#9679;</span>,
  Fruits: <span className="text-sm text-orange-400" aria-hidden="true">&#9679;</span>,
  Beverages: <span className="text-sm text-cyan-400" aria-hidden="true">&#9679;</span>,
  Processed: <span className="text-sm text-pink-400" aria-hidden="true">&#9679;</span>,
}

export default function LogFoodPage() {
  const router = useRouter()
  const { addActivity, isLoggedIn } = useApp()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/")
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn) return null
  const [selectedFood, setSelectedFood] = useState<string | null>(null)
  const [portionUnit, setPortionUnit] = useState<PortionUnit>("grams")
  const [portionAmount, setPortionAmount] = useState(250)
  const [confirmed, setConfirmed] = useState(false)

  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) return FOOD_DATABASE.slice(0, 8)
    return FOOD_DATABASE.filter(
      (f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const selectedFoodItem = FOOD_DATABASE.find((f) => f.id === selectedFood)

  const gramsValue = useMemo(() => {
    switch (portionUnit) {
      case "grams":
        return portionAmount
      case "ounces":
        return portionAmount * 28.35
      case "servings":
        return portionAmount * 200
      default:
        return portionAmount
    }
  }, [portionAmount, portionUnit])

  const estimatedImpact = selectedFoodItem
    ? calculateFoodEmissions(selectedFoodItem.id, gramsValue)
    : 0

  async function handleConfirm() {
    if (!selectedFoodItem) return
    await addActivity({
      type: "food",
      name: selectedFoodItem.name,
      emissions: estimatedImpact,
      details: `${portionAmount}${portionUnit === "grams" ? "g" : portionUnit === "ounces" ? "oz" : " porciones"}`,
    })
    setConfirmed(true)
    setTimeout(() => router.push("/dashboard"), 800)
  }

  function adjustPortion(delta: number) {
    setPortionAmount((prev) => {
      const step = portionUnit === "grams" ? 25 : portionUnit === "ounces" ? 1 : 1
      return Math.max(step, prev + delta * step)
    })
  }

  const unitLabel = portionUnit === "grams" ? "g" : portionUnit === "ounces" ? "oz" : "srv"

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-4">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center p-1 text-primary"
            aria-label="Volver"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-base font-bold text-foreground">Registrar alimento</h1>
          <button className="flex items-center justify-center p-1 text-muted-foreground" aria-label="Informacion">
            <Info className="h-5 w-5" />
          </button>
        </div>

        {/* Buscar */}
        <div className="relative mb-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar alimento (ej: carne, lentejas, arroz)"
            className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Lista de alimentos */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">
              {searchQuery ? "Resultados" : "Agregados recientemente"}
            </h2>
            <button className="px-1 py-1 text-xs font-medium text-muted-foreground">Ver todo</button>
          </div>
          <div className="flex flex-col gap-2">
            {filteredFoods.map((food) => (
              <button
                key={food.id}
                onClick={() => setSelectedFood(food.id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                  selectedFood === food.id
                    ? "bg-primary/10 ring-1 ring-primary"
                    : "bg-card active:bg-secondary"
                }`}
              >
                <div className="pointer-events-none flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  {CATEGORY_ICONS[food.category] || <Leaf className="h-4 w-4 text-accent" />}
                </div>
                <div className="pointer-events-none flex-1 text-left">
                  <p className="text-sm font-semibold text-foreground">{food.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {food.emissionFactor} kg CO2e / kg
                  </p>
                </div>
                {selectedFood === food.id && (
                  <div className="pointer-events-none flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tamano de porcion */}
        {selectedFood && (
          <>
            <div className="mb-4 rounded-2xl bg-card p-4">
              <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-foreground">
                Ajustar porcion
              </p>

              {/* Selector de unidad */}
              <div className="mb-4 flex rounded-xl bg-secondary p-1">
                {(["grams", "ounces", "servings"] as PortionUnit[]).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => {
                      setPortionUnit(unit)
                      setPortionAmount(unit === "grams" ? 250 : unit === "ounces" ? 8 : 1)
                    }}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                      portionUnit === unit
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {unit === "grams" ? "Gramos" : unit === "ounces" ? "Onzas" : "Porciones"}
                  </button>
                ))}
              </div>

              {/* Control de cantidad */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => adjustPortion(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors active:bg-border"
                  aria-label="Disminuir porcion"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{portionAmount}</span>
                  <span className="text-sm text-muted-foreground">{unitLabel}</span>
                </div>
                <button
                  onClick={() => adjustPortion(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors active:opacity-80"
                  aria-label="Aumentar porcion"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Impacto estimado */}
            <div className="mb-4 rounded-2xl bg-card p-4 text-center">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
                Impacto estimado
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-accent">{estimatedImpact.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">
                  {"kg CO"}
                  <sub>2</sub>
                  {"e"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Basado en estandares ambientales internacionales
              </p>
            </div>

            {/* Boton confirmar */}
            <button
              onClick={handleConfirm}
              disabled={confirmed}
              className={`flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-semibold transition-all active:opacity-80 ${
                confirmed
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {confirmed ? "Agregado al registro" : "Confirmar y agregar al registro"}
            </button>
          </>
        )}
      </div>

      <LogBottomNav />
    </div>
  )
}
