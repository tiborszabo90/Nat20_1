import { create } from 'zustand'
import type { Character, ContextMode } from '../types/dnd/character'

interface CharacterState {
  character: Character | null
  contextMode: ContextMode
  setCharacter: (c: Character) => void
  setContextMode: (mode: ContextMode) => void
  // Optimista frissítés – UI azonnal reagál, Firestore write aszinkron fut
  updateHpLocal: (currentHp: number, temporaryHp: number) => void
  useSpellSlotLocal: (slotLevel: number) => void
  restoreSpellSlotsLocal: () => void
  clearCharacter: () => void
}

export const useCharacterStore = create<CharacterState>((set) => ({
  character: null,
  contextMode: 'general',

  setCharacter: (character) => set({ character }),

  setContextMode: (contextMode) => set({ contextMode }),

  updateHpLocal: (currentHp, temporaryHp) =>
    set((state) =>
      state.character
        ? { character: { ...state.character, currentHp, temporaryHp } }
        : {}
    ),

  useSpellSlotLocal: (slotLevel) =>
    set((state) => {
      if (!state.character) return {}
      const updated = [...state.character.usedSpellSlots]
      updated[slotLevel] = (updated[slotLevel] ?? 0) + 1
      return { character: { ...state.character, usedSpellSlots: updated } }
    }),

  restoreSpellSlotsLocal: () =>
    set((state) =>
      state.character
        ? { character: { ...state.character, usedSpellSlots: [0,0,0,0,0,0,0,0,0] } }
        : {}
    ),

  clearCharacter: () => set({ character: null, contextMode: 'general' }),
}))
