export type FeatCategory = 'origin' | 'general' | 'fighting-style' | 'epic-boon'

export interface Feat {
  key: string
  name: string
  category: FeatCategory
  prerequisite: string
  description: string
  repeatable: boolean
}
