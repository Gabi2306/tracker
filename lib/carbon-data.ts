// Carbon emission factors based on international standards (IPCC, EPA, DEFRA)
// All values in kg CO2e per unit

export interface FoodItem {
  id: string
  name: string
  emoji: string
  emissionFactor: number // kg CO2e per kg of food
  category: string
}

// Source: IPCC 2019, Our World in Data, DEFRA 2023
export const FOOD_DATABASE: FoodItem[] = [
  // High emissions (Red meats)
  { id: "beef-steak", name: "Beef Steak", emoji: "steak", emissionFactor: 27.0, category: "Meat" },
  { id: "lamb", name: "Lamb", emoji: "meat", emissionFactor: 24.0, category: "Meat" },
  { id: "beef-ground", name: "Ground Beef", emoji: "meat", emissionFactor: 27.0, category: "Meat" },
  
  // Medium-high emissions (Other meats)
  { id: "pork", name: "Pork", emoji: "meat", emissionFactor: 12.1, category: "Meat" },
  { id: "chicken", name: "Chicken", emoji: "poultry", emissionFactor: 6.9, category: "Meat" },
  { id: "turkey", name: "Turkey", emoji: "poultry", emissionFactor: 5.5, category: "Meat" },
  
  // Seafood
  { id: "shrimp", name: "Shrimp", emoji: "seafood", emissionFactor: 11.8, category: "Seafood" },
  { id: "fish", name: "Fish (generic)", emoji: "fish", emissionFactor: 5.4, category: "Seafood" },
  { id: "salmon", name: "Salmon", emoji: "fish", emissionFactor: 6.0, category: "Seafood" },
  { id: "tuna", name: "Tuna", emoji: "fish", emissionFactor: 6.1, category: "Seafood" },
  
  // Dairy
  { id: "cheese", name: "Cheese", emoji: "dairy", emissionFactor: 13.5, category: "Dairy" },
  { id: "milk", name: "Milk (1L)", emoji: "dairy", emissionFactor: 3.2, category: "Dairy" },
  { id: "butter", name: "Butter", emoji: "dairy", emissionFactor: 11.9, category: "Dairy" },
  { id: "yogurt", name: "Yogurt", emoji: "dairy", emissionFactor: 2.2, category: "Dairy" },
  { id: "eggs", name: "Eggs (dozen)", emoji: "eggs", emissionFactor: 4.8, category: "Dairy" },
  
  // Grains & Cereals
  { id: "rice", name: "Rice", emoji: "grain", emissionFactor: 4.0, category: "Grains" },
  { id: "pasta", name: "Pasta", emoji: "grain", emissionFactor: 1.5, category: "Grains" },
  { id: "bread", name: "Bread", emoji: "grain", emissionFactor: 1.4, category: "Grains" },
  { id: "oats", name: "Oats", emoji: "grain", emissionFactor: 1.6, category: "Grains" },
  
  // Legumes & Plant proteins
  { id: "lentils", name: "Lentil Soup", emoji: "legume", emissionFactor: 0.9, category: "Legumes" },
  { id: "beans", name: "Beans", emoji: "legume", emissionFactor: 0.8, category: "Legumes" },
  { id: "tofu", name: "Tofu", emoji: "plant", emissionFactor: 3.0, category: "Legumes" },
  { id: "chickpeas", name: "Chickpeas", emoji: "legume", emissionFactor: 0.8, category: "Legumes" },
  
  // Vegetables
  { id: "tomatoes", name: "Tomatoes", emoji: "vegetable", emissionFactor: 1.4, category: "Vegetables" },
  { id: "potatoes", name: "Potatoes", emoji: "vegetable", emissionFactor: 0.5, category: "Vegetables" },
  { id: "broccoli", name: "Broccoli", emoji: "vegetable", emissionFactor: 0.5, category: "Vegetables" },
  { id: "carrots", name: "Carrots", emoji: "vegetable", emissionFactor: 0.4, category: "Vegetables" },
  { id: "salad", name: "Salad Mix", emoji: "vegetable", emissionFactor: 0.7, category: "Vegetables" },
  
  // Fruits
  { id: "bananas", name: "Bananas", emoji: "fruit", emissionFactor: 0.7, category: "Fruits" },
  { id: "apples", name: "Apples", emoji: "fruit", emissionFactor: 0.4, category: "Fruits" },
  { id: "oranges", name: "Oranges", emoji: "fruit", emissionFactor: 0.5, category: "Fruits" },
  { id: "avocado", name: "Avocado", emoji: "fruit", emissionFactor: 1.3, category: "Fruits" },
  
  // Beverages
  { id: "coffee", name: "Coffee", emoji: "beverage", emissionFactor: 8.0, category: "Beverages" },
  { id: "tea", name: "Tea", emoji: "beverage", emissionFactor: 1.2, category: "Beverages" },
  { id: "orange-juice", name: "Orange Juice", emoji: "beverage", emissionFactor: 1.1, category: "Beverages" },
  
  // Processed
  { id: "chocolate", name: "Chocolate", emoji: "snack", emissionFactor: 19.0, category: "Processed" },
  { id: "pizza", name: "Pizza", emoji: "prepared", emissionFactor: 5.0, category: "Processed" },
  { id: "burger", name: "Burger", emoji: "prepared", emissionFactor: 14.0, category: "Processed" },
]

export interface TransportMode {
  id: string
  name: string
  icon: string
  emissionFactor: number // kg CO2e per km
  description: string
}

// Source: EPA, DEFRA 2023, IEA
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
