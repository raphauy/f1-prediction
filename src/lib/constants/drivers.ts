export const F1_DRIVERS_2025 = [
  // Mercedes
  { name: "Lewis Hamilton", team: "Mercedes", number: 44 },
  { name: "George Russell", team: "Mercedes", number: 63 },
  
  // Red Bull Racing
  { name: "Max Verstappen", team: "Red Bull", number: 1 },
  { name: "Sergio Pérez", team: "Red Bull", number: 11 },
  
  // Ferrari
  { name: "Charles Leclerc", team: "Ferrari", number: 16 },
  { name: "Carlos Sainz", team: "Ferrari", number: 55 },
  
  // McLaren
  { name: "Lando Norris", team: "McLaren", number: 4 },
  { name: "Oscar Piastri", team: "McLaren", number: 81 },
  
  // Aston Martin
  { name: "Fernando Alonso", team: "Aston Martin", number: 14 },
  { name: "Lance Stroll", team: "Aston Martin", number: 18 },
  
  // Alpine
  { name: "Pierre Gasly", team: "Alpine", number: 10 },
  { name: "Esteban Ocon", team: "Alpine", number: 31 },
  
  // Williams
  { name: "Alexander Albon", team: "Williams", number: 23 },
  { name: "Logan Sargeant", team: "Williams", number: 2 },
  
  // AlphaTauri
  { name: "Yuki Tsunoda", team: "AlphaTauri", number: 22 },
  { name: "Daniel Ricciardo", team: "AlphaTauri", number: 3 },
  
  // Alfa Romeo
  { name: "Valtteri Bottas", team: "Alfa Romeo", number: 77 },
  { name: "Zhou Guanyu", team: "Alfa Romeo", number: 24 },
  
  // Haas
  { name: "Kevin Magnussen", team: "Haas", number: 20 },
  { name: "Nico Hulkenberg", team: "Haas", number: 27 }
] as const

export type F1Driver = typeof F1_DRIVERS_2025[number]

export const DRIVER_NAMES = F1_DRIVERS_2025.map(d => d.name)

export const getDriversByTeam = (team: string) => 
  F1_DRIVERS_2025.filter(d => d.team === team)

export const getDriverByName = (name: string) =>
  F1_DRIVERS_2025.find(d => d.name === name)