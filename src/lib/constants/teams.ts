export const F1_TEAMS_2025 = [
  { name: "Red Bull", fullName: "Oracle Red Bull Racing", color: "#0600EF" },
  { name: "McLaren", fullName: "McLaren F1 Team", color: "#FF8700" },
  { name: "Ferrari", fullName: "Scuderia Ferrari", color: "#DC0000" },
  { name: "Mercedes", fullName: "Mercedes-AMG Petronas F1 Team", color: "#00D2BE" },
  { name: "Aston Martin", fullName: "Aston Martin Aramco F1 Team", color: "#006F62" },
  { name: "Alpine", fullName: "BWT Alpine F1 Team", color: "#0090FF" },
  { name: "RB", fullName: "Visa Cash App RB F1 Team", color: "#2B4562" },
  { name: "Haas", fullName: "MoneyGram Haas F1 Team", color: "#B6BABD" },
  { name: "Williams", fullName: "Williams Racing", color: "#005AFF" },
  { name: "Sauber", fullName: "Stake F1 Team Kick Sauber", color: "#52E252" }
] as const

export type F1Team = typeof F1_TEAMS_2025[number]

export const TEAM_NAMES = F1_TEAMS_2025.map(t => t.name)

export const getTeamByName = (name: string) =>
  F1_TEAMS_2025.find(t => t.name === name || t.fullName === name)