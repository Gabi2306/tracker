export interface FoodItem {
  id: string
  name: string
  emoji: string
  emissionFactor: number // kg CO2e por kg de comida
  category: string
}

export const FOOD_DATABASE: FoodItem[] = [
  // Emisiones altas (Carnes rojas)
  { id: "carne", name: "Carne", emoji: "steak", emissionFactor: 27.0, category: "Meat" },
  { id: "cordero", name: "Cordero", emoji: "meat", emissionFactor: 24.0, category: "Meat" },
  { id: "carne-molida", name: "Carne molida", emoji: "meat", emissionFactor: 27.0, category: "Meat" },
  
  // Emisiones moderadas (Aves y cerdo)
  { id: "cerdo", name: "Cerdo", emoji: "meat", emissionFactor: 12.1, category: "Meat" },
  { id: "pollo", name: "Pollo", emoji: "poultry", emissionFactor: 6.9, category: "Meat" },
  { id: "pavo", name: "Pavo", emoji: "poultry", emissionFactor: 5.5, category: "Meat" },
  
  // mariscos
  { id: "camaron", name: "Camaron", emoji: "seafood", emissionFactor: 11.8, category: "Seafood" },
  { id: "pescado", name: "Pescado (general)", emoji: "fish", emissionFactor: 5.4, category: "Seafood" },
  { id: "salmon", name: "Salmon", emoji: "fish", emissionFactor: 6.0, category: "Seafood" },
  { id: "atun", name: "Atun", emoji: "fish", emissionFactor: 6.1, category: "Seafood" },
  
  // Lacteos
  { id: "queso", name: "Queso", emoji: "dairy", emissionFactor: 13.5, category: "Dairy" },
  { id: "leche", name: "Leche (1L)", emoji: "dairy", emissionFactor: 3.2, category: "Dairy" },
  { id: "mantequilla", name: "Mantequilla", emoji: "dairy", emissionFactor: 11.9, category: "Dairy" },
  { id: "yogurt", name: "Yogurt", emoji: "dairy", emissionFactor: 2.2, category: "Dairy" },
  { id: "huevos", name: "Huevos (docena)", emoji: "eggs", emissionFactor: 4.8, category: "Dairy" },
  
  // Granos y cereales
  { id: "arroz", name: "Arroz", emoji: "grain", emissionFactor: 4.0, category: "Grains" },
  { id: "pasta", name: "Pasta", emoji: "grain", emissionFactor: 1.5, category: "Grains" },
  { id: "pan", name: "Pan", emoji: "grain", emissionFactor: 1.4, category: "Grains" },
  { id: "avena", name: "Avena", emoji: "grain", emissionFactor: 1.6, category: "Grains" },
  
  // Legumbres y proteínas vegetales
  { id: "lentejas", name: "Lentejas", emoji: "legume", emissionFactor: 0.9, category: "Legumes" },
  { id: "frijoles", name: "Frijoles", emoji: "legume", emissionFactor: 0.8, category: "Legumes" },
  { id: "tofu", name: "Tofu", emoji: "plant", emissionFactor: 3.0, category: "Legumes" },
  { id: "garbanzos", name: "Garbanzos", emoji: "legume", emissionFactor: 0.8, category: "Legumes" },
  
  // vegetales
  { id: "tomates", name: "Tomates", emoji: "vegetable", emissionFactor: 1.4, category: "Vegetables" },
  { id: "papa", name: "Papa", emoji: "vegetable", emissionFactor: 0.5, category: "Vegetables" },
  { id: "brocoli", name: "Brocoli", emoji: "vegetable", emissionFactor: 0.5, category: "Vegetables" },
  { id: "zanahorias", name: "Zanahorias", emoji: "vegetable", emissionFactor: 0.4, category: "Vegetables" },
  { id: "ensalada", name: "Ensalada Mixta", emoji: "vegetable", emissionFactor: 0.7, category: "Vegetables" },
  
  // frutas
  { id: "bananas", name: "Bananas", emoji: "fruit", emissionFactor: 0.7, category: "Fruits" },
  { id: "manzana", name: "Manzana", emoji: "fruit", emissionFactor: 0.4, category: "Fruits" },
  { id: "naranjas", name: "Naranjas", emoji: "fruit", emissionFactor: 0.5, category: "Fruits" },
  { id: "aguacate", name: "Aguacate", emoji: "fruit", emissionFactor: 1.3, category: "Fruits" },
  
  // Bebidas
  { id: "cafe", name: "Cafe", emoji: "beverage", emissionFactor: 8.0, category: "Beverages" },
  { id: "te", name: "Te", emoji: "beverage", emissionFactor: 1.2, category: "Beverages" },
  { id: "jugo-naranja", name: "Jugo de Naranja", emoji: "beverage", emissionFactor: 1.1, category: "Beverages" },
  
  // procesados
  { id: "chocolate", name: "Chocolate", emoji: "snack", emissionFactor: 19.0, category: "Processed" },
  { id: "pizza", name: "Pizza", emoji: "prepared", emissionFactor: 5.0, category: "Processed" },
  { id: "hamburguesa", name: "Hamburguesa", emoji: "prepared", emissionFactor: 14.0, category: "Processed" },
]

export interface TransportMode {
  id: string
  name: string
  icon: string
  emissionFactor: number // kg CO2e por km
  description: string
}


export const TRANSPORT_MODES: TransportMode[] = [
  { id: "car", name: "Car", icon: "car", emissionFactor: 0.192, description: "Average passenger car" },
  { id: "motor", name: "Motor", icon: "bike", emissionFactor: 0.113, description: "Motorcycle" },
  { id: "taxi", name: "Taxi", icon: "taxi", emissionFactor: 0.210, description: "Taxi/Rideshare" },
  { id: "bus", name: "Bus", icon: "bus", emissionFactor: 0.089, description: "City bus" },
  { id: "walk", name: "Walk", icon: "walking", emissionFactor: 0, description: "Walking" },
  { id: "cycle", name: "Cycle", icon: "bicycle", emissionFactor: 0, description: "Bicycle" },
]

export function calculateFoodEmissions(foodId: string, gramsConsumed: number): number {
  const food = FOOD_DATABASE.find((f) => f.id === foodId)
  if (!food) return 0
  return Number(((food.emissionFactor * gramsConsumed) / 1000).toFixed(2))
}

export function calculateTransportEmissions(modeId: string, distanceKm: number): number {
  const mode = TRANSPORT_MODES.find((m) => m.id === modeId)
  if (!mode) return 0
  return Number((mode.emissionFactor * distanceKm).toFixed(2))
}

export function getTransportEfficiency(modeId: string): string {
  const mode = TRANSPORT_MODES.find((m) => m.id === modeId)
  if (!mode) return "Unknown"
  if (mode.emissionFactor === 0) return "Zero emissions"
  if (mode.emissionFactor < 0.1) return "Low (" + mode.emissionFactor * 1000 + "g/km)"
  return "Average (" + mode.emissionFactor * 1000 + "g/km)"
}

export function getTransportComparison(modeId: string): string {
  const mode = TRANSPORT_MODES.find((m) => m.id === modeId)
  if (!mode) return ""
  const busMode = TRANSPORT_MODES.find((m) => m.id === "bus")!
  if (mode.emissionFactor === 0) return "100% lower than bus avg"
  const diff = ((mode.emissionFactor - busMode.emissionFactor) / busMode.emissionFactor) * 100
  if (diff > 0) return Math.round(diff) + "% higher than bus avg"
  return Math.abs(Math.round(diff)) + "% lower than bus avg"
}
