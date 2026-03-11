export interface EnvironmentalTip {
  id: string
  category: "food" | "transport" | "energy" | "water" | "waste" | "general"
  title: string
  description: string
}

export const ENVIRONMENTAL_TIPS: EnvironmentalTip[] = [
  // Comida
  {
    id: "food-1",
    category: "food",
    title: "Reduce el consumo de carne roja",
    description: "La carne de res produce 27 kg de CO2 por kg. Intenta tener al menos 2 dias sin carne a la semana.",
  },
  {
    id: "food-2",
    category: "food",
    title: "Compra productos locales",
    description: "Los alimentos importados generan emisiones por transporte. Prefiere productos de tu region.",
  },
  {
    id: "food-3",
    category: "food",
    title: "Evita el desperdicio de alimentos",
    description: "Planifica tus comidas y usa las sobras. El 30% de la comida producida se desperdicia.",
  },
  {
    id: "food-4",
    category: "food",
    title: "Opta por proteinas vegetales",
    description: "Las legumbres como lentejas y frijoles tienen 30 veces menos emisiones que la carne.",
  },
  {
    id: "food-5",
    category: "food",
    title: "Reduce los productos lacteos",
    description: "El queso produce 13.5 kg de CO2 por kg. Prueba alternativas vegetales ocasionalmente.",
  },

  // Transporte
  {
    id: "transport-1",
    category: "transport",
    title: "Usa transporte publico",
    description: "El bus emite la mitad de CO2 por pasajero comparado con un auto particular.",
  },
  {
    id: "transport-2",
    category: "transport",
    title: "Camina o usa bicicleta",
    description: "Para distancias cortas (menos de 5 km), caminar o pedalear tiene cero emisiones.",
  },
  {
    id: "transport-3",
    category: "transport",
    title: "Comparte viajes",
    description: "El carpooling puede reducir tus emisiones de transporte hasta en un 75%.",
  },
  {
    id: "transport-4",
    category: "transport",
    title: "Planifica tus recorridos",
    description: "Agrupa tus mandados en un solo viaje para reducir kilometros innecesarios.",
  },
  {
    id: "transport-5",
    category: "transport",
    title: "Mantén tu vehiculo",
    description: "Un auto con buen mantenimiento consume hasta 15% menos combustible.",
  },

  // Energia
  {
    id: "energy-1",
    category: "energy",
    title: "Usa bombillas LED",
    description: "Las LED consumen 75% menos energia que las incandescentes y duran 25 veces mas.",
  },
  {
    id: "energy-2",
    category: "energy",
    title: "Desconecta aparatos",
    description: "El consumo fantasma representa hasta el 10% de tu factura electrica.",
  },
  {
    id: "energy-3",
    category: "energy",
    title: "Aprovecha la luz natural",
    description: "Abre cortinas durante el dia y reduce el uso de iluminacion artificial.",
  },
  {
    id: "energy-4",
    category: "energy",
    title: "Ajusta el termostato",
    description: "Cada grado menos en calefaccion ahorra hasta 7% de energia.",
  },

  // Agua
  {
    id: "water-1",
    category: "water",
    title: "Duchas cortas",
    description: "Reduce tu ducha a 5 minutos y ahorra hasta 45 litros de agua por dia.",
  },
  {
    id: "water-2",
    category: "water",
    title: "Repara fugas",
    description: "Un grifo que gotea puede desperdiciar mas de 30 litros de agua al dia.",
  },
  {
    id: "water-3",
    category: "water",
    title: "Lava con carga completa",
    description: "Usa la lavadora solo cuando este llena para maximizar la eficiencia.",
  },

  // Residuos
  {
    id: "waste-1",
    category: "waste",
    title: "Recicla correctamente",
    description: "Separar residuos reduce la contaminacion y permite reutilizar materiales.",
  },
  {
    id: "waste-2",
    category: "waste",
    title: "Usa bolsas reutilizables",
    description: "Una bolsa de plastico tarda 500 anos en degradarse. Lleva tus propias bolsas.",
  },
  {
    id: "waste-3",
    category: "waste",
    title: "Evita el plastico de un solo uso",
    description: "Usa botellas y contenedores reutilizables en lugar de desechables.",
  },
  {
    id: "waste-4",
    category: "waste",
    title: "Composta residuos organicos",
    description: "El compostaje reduce emisiones de metano y crea fertilizante natural.",
  },

  // General
  {
    id: "general-1",
    category: "general",
    title: "Compra menos, elige mejor",
    description: "La produccion de bienes genera emisiones. Prioriza calidad sobre cantidad.",
  },
  {
    id: "general-2",
    category: "general",
    title: "Planta arboles",
    description: "Un arbol absorbe aproximadamente 22 kg de CO2 al ano.",
  },
  {
    id: "general-3",
    category: "general",
    title: "Educa a otros",
    description: "Comparte estos consejos con familia y amigos para multiplicar el impacto.",
  },
  {
    id: "general-4",
    category: "general",
    title: "Mide tu impacto",
    description: "Llevar un registro de tus emisiones te ayuda a identificar donde mejorar.",
  },
]

export function getRandomTip(): EnvironmentalTip {
  const randomIndex = Math.floor(Math.random() * ENVIRONMENTAL_TIPS.length)
  return ENVIRONMENTAL_TIPS[randomIndex]
}

export function getTipsByCategory(category: EnvironmentalTip["category"]): EnvironmentalTip[] {
  return ENVIRONMENTAL_TIPS.filter((tip) => tip.category === category)
}
