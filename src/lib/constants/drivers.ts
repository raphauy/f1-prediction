export interface F1DriverType {
  name: string
  team: string
  number: number
  imageUrl?: string
}

export const F1_DRIVERS_2025: F1DriverType[] = [
  {
    name: "Max Verstappen",
    team: "Red Bull",
    number: 1,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/max-verstappen.png"
  },
  {
    name: "Liam Lawson",
    team: "Red Bull",
    number: 30,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/liam-lawson.png"
  },
  {
    name: "Lando Norris",
    team: "McLaren",
    number: 4,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/lando-norris.png"
  },
  {
    name: "Oscar Piastri",
    team: "McLaren",
    number: 81,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/oscar-piastri.png"
  },
  {
    name: "Charles Leclerc",
    team: "Ferrari",
    number: 16,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/charles-leclerc.png"
  },
  {
    name: "Lewis Hamilton",
    team: "Ferrari",
    number: 44,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/lewis-hamilton.png"
  },
  {
    name: "George Russell",
    team: "Mercedes",
    number: 63,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/george-russell.png"
  },
  {
    name: "Andrea Kimi Antonelli",
    team: "Mercedes",
    number: 12,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/andrea-kimi-antonelli.png"
  },
  {
    name: "Fernando Alonso",
    team: "Aston Martin",
    number: 14,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/fernando-alonso.png"
  },
  {
    name: "Lance Stroll",
    team: "Aston Martin",
    number: 18,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/lance-stroll.png"
  },
  {
    name: "Pierre Gasly",
    team: "Alpine",
    number: 10,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/pierre-gasly.png"
  },
  {
    name: "Jack Doohan",
    team: "Alpine",
    number: 61,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/jack-doohan.png"
  },
  {
    name: "Yuki Tsunoda",
    team: "RB",
    number: 22,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/yuki-tsunoda.png"
  },
  {
    name: "Isack Hadjar",
    team: "RB",
    number: 50,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/isack-hadjar.png"
  },
  {
    name: "Oliver Bearman",
    team: "Haas",
    number: 87,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/oliver-bearman.png"
  },
  {
    name: "Esteban Ocon",
    team: "Haas",
    number: 31,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/esteban-ocon.png"
  },
  {
    name: "Nico Hulkenberg",
    team: "Sauber",
    number: 27,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/nico-hulkenberg.png"
  },
  {
    name: "Gabriel Bortoleto",
    team: "Sauber",
    number: 5,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/gabriel-bortoleto.png"
  },
  {
    name: "Alexander Albon",
    team: "Williams",
    number: 23,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/alexander-albon.png"
  },
  {
    name: "Carlos Sainz",
    team: "Williams",
    number: 55,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/carlos-sainz.png"
  },
  {
    name: "Franco Colapinto",
    team: "Alpine",
    number: 43,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/franco-colapinto.png"
  },
]

export type F1Driver = typeof F1_DRIVERS_2025[number]

export const DRIVER_NAMES = F1_DRIVERS_2025.map(d => d.name)

export const getDriversByTeam = (team: string) => 
  F1_DRIVERS_2025.filter(d => d.team === team)

export const getDriverByName = (name: string) =>
  F1_DRIVERS_2025.find(d => d.name === name)

// Pilotos que compitieron en 2025 pero ya no están activos
export const F1_FORMER_DRIVERS_2025: F1DriverType[] = [
  {
    name: "Jack Doohan",
    team: "Alpine",
    number: 61,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/jack-doohan.png"
  },
  {
    name: "Zhou Guanyu",
    team: "Sauber",
    number: 24,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/zhou-guanyu.png"
  },
  {
    name: "Valtteri Bottas",
    team: "Sauber",
    number: 77,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/valtteri-bottas.png"
  },
  {
    name: "Kevin Magnussen",
    team: "Haas",
    number: 20,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/kevin-magnussen.png"
  },
  {
    name: "Sergio Pérez",
    team: "Red Bull",
    number: 11,
    imageUrl: "https://flsu53ntc8dvexn0.public.blob.vercel-storage.com/drivers/sergio-p%C3%A9rez.png"
  }
]

// Función para obtener el slug de la imagen del piloto
export const getDriverImageSlug = (driverName: string): string => {
  return driverName.toLowerCase().replace(/s+/g, '-')
}
