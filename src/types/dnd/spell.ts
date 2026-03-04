export interface Spell {
  key: string
  name: string
  description: string
  level: number
  school: string
  classes: string[]
  castingTime: string
  range: string
  components: string
  material: string
  duration: string
  concentration: boolean
  ritual: boolean
  savingThrow: string
  damageType: string
  higherLevel: string
}
