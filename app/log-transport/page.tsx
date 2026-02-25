"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/app-context"
import {
  TRANSPORT_MODES,
  calculateTransportEmissions,
  getTransportEfficiency,
  getTransportComparison,
} from "@/lib/carbon-data"
import { LogBottomNav } from "@/components/log-bottom-nav"
import {
  Car,
  Bike,
  Bus,
  MapPin,
  Minus,
  Plus,
  Check,
} from "lucide-react"

function PersonWalking(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="5" r="1.5" />
      <path d="M13.5 8.5L16 11l-2 5-3-1-2 4" />
      <path d="M10 8.5l-3 3 2 4" />
    </svg>
  )
}

function TaxiIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A2 2 0 0018.63 6H9.37a2 2 0 00-1.95 1.27L6.36 11.5c-.24.96-.24 1.96 0 2.92L7 17h2" />
      <path d="M14 17h-4" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M10 4h4l1 2H9l1-2z" />
    </svg>
  )
}

function CycleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 100-2 1 1 0 000 2z" />
      <path d="M12 17.5V14l-3-3 4-3 2 3h3" />
    </svg>
  )
}

const MODE_ICONS: Record<string, React.ReactNode> = {
  car: <Car className="h-6 w-6" />,
  motor: <Bike className="h-6 w-6" />,
  taxi: <TaxiIcon className="h-6 w-6" />,
  bus: <Bus className="h-6 w-6" />,
  walk: <PersonWalking className="h-6 w-6" />,
  cycle: <CycleIcon className="h-6 w-6" />,
}

const MODE_LABELS: Record<string, string> = {
  car: "Carro",
  motor: "Moto",
  taxi: "Taxi",
  bus: "Bus",
  walk: "A pie",
  cycle: "Bicicleta",
}

type DistanceUnit = "km" | "mi"

export default function LogTransportPage() {
  const router = useRouter()
  const { addActivity } = useApp()
  const [selectedMode, setSelectedMode] = useState<string | null>("car")
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("km")
  const [distance, setDistance] = useState(12.5)
  const [gpsEnabled, setGpsEnabled] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const distanceKm = distanceUnit === "mi" ? distance * 1.60934 : distance

  const estimatedImpact = selectedMode
    ? calculateTransportEmissions(selectedMode, distanceKm)
    : 0

  const efficiency = selectedMode ? getTransportEfficiency(selectedMode) : ""
  const comparison = selectedMode ? getTransportComparison(selectedMode) : ""

  function adjustDistance(delta: number) {
    setDistance((prev) => Math.max(0.5, Number((prev + delta * 0.5).toFixed(1))))
  }

  async function handleConfirm() {
    if (!selectedMode) return
    const mode = TRANSPORT_MODES.find((m) => m.id === selectedMode)
    if (!mode) return
    await addActivity({
      type: "transport",
      name: `Viaje en ${MODE_LABELS[mode.id] || mode.name}`,
      emissions: estimatedImpact,
      details: `${distance} ${distanceUnit}`,
    })
    setConfirmed(true)
    setTimeout(() => router.push("/dashboard"), 800)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto px-5 pb-4 pt-4">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="px-2 py-1 text-sm font-medium text-muted-foreground"
          >
            Cancelar
          </button>
          <h1 className="text-base font-bold text-foreground">Registrar viaje</h1>
          <div className="w-16" />
        </div>

        {/* Modo de transporte */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Modo de transporte</h2>
            <span className="text-xs text-primary">Selecciona uno</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TRANSPORT_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl py-4 transition-colors ${
                  selectedMode === mode.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground active:bg-secondary"
                }`}
              >
                <span className="pointer-events-none">{MODE_ICONS[mode.id]}</span>
                <span className="pointer-events-none text-xs font-medium">{MODE_LABELS[mode.id]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Distancia */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Distancia recorrida
            </h2>
            <div className="flex rounded-lg bg-secondary p-0.5">
              {(["km", "mi"] as DistanceUnit[]).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setDistanceUnit(unit)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold uppercase transition-colors ${
                    distanceUnit === unit
                      ? "bg-card text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 rounded-2xl bg-card py-5">
            <button
              onClick={() => adjustDistance(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors active:bg-border"
              aria-label="Disminuir distancia"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[80px] text-center text-4xl font-bold text-foreground">
              {distance.toFixed(1)}
            </span>
            <button
              onClick={() => adjustDistance(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors active:opacity-80"
              aria-label="Aumentar distancia"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Impacto estimado */}
        {selectedMode && (
          <div className="mb-5 rounded-2xl bg-primary/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
                Impacto estimado
              </h3>
            </div>
            <div className="mb-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-primary">{estimatedImpact.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">
                {"kg CO"}
                <sub>2</sub>
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Eficiencia</span>
                <span className="text-xs font-semibold text-foreground">{efficiency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Comparacion</span>
                <span className="text-xs font-semibold text-foreground">{comparison}</span>
              </div>
            </div>
          </div>
        )}

        {/* Toggle GPS */}
        <div className="mb-5 flex items-center justify-between rounded-2xl bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">GPS Activo</p>
              <p className="text-[11px] text-muted-foreground">Calcular distancia automaticamente</p>
            </div>
          </div>
          <button
            role="switch"
            aria-checked={gpsEnabled}
            onClick={() => setGpsEnabled(!gpsEnabled)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              gpsEnabled ? "bg-primary" : "bg-secondary"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-foreground transition-transform ${
                gpsEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Confirmar */}
        <button
          onClick={handleConfirm}
          disabled={!selectedMode || confirmed}
          className={`flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-semibold transition-all active:opacity-80 disabled:opacity-50 ${
            confirmed
              ? "bg-accent text-accent-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {confirmed ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4" /> Agregado al registro
            </span>
          ) : (
            "Confirmar y agregar al registro"
          )}
        </button>
      </div>

      <LogBottomNav />
    </div>
  )
}
