import { create } from 'zustand'

export type DitherAlgorithm = 'floyd-steinberg' | 'atkinson' | 'burkes' | 'sierra' | 'sierra-lite' | 'stucki' | 'bayer'

export interface DitherOptions {
  algorithm: DitherAlgorithm
  threshold: number
  intensity: number
  paletteSize: number
  serpentine: boolean
  pixelationScale: number
  detailEnhancement: number
  brightness: number
  midtones: number
  noise: number
  glow: number
  exposure: number
}

interface DitherStore {
  options: DitherOptions
  setOption: <K extends keyof DitherOptions>(key: K, value: DitherOptions[K]) => void
  resetOptions: () => void
  randomizeOptions: () => void
}

const defaultOptions: DitherOptions = {
  algorithm: 'floyd-steinberg' as DitherAlgorithm,
  threshold: 128,
  intensity: 1.0,
  paletteSize: 4,
  serpentine: false,
  pixelationScale: 1,
  detailEnhancement: 0,
  brightness: 0,
  midtones: 1.0,
  noise: 0,
  glow: 0,
  exposure: 0,
}

export const useDitherStore = create<DitherStore>((set) => ({
  options: defaultOptions,
  setOption: (key, value) =>
    set((state) => ({
      options: { ...state.options, [key]: value },
    })),
  resetOptions: () => set({ options: defaultOptions }),
  randomizeOptions: () => set((state) =>{
    return {
      options: {
      algorithm: state.options.algorithm,
      threshold: Math.floor(Math.random() * 256),
      intensity: +(Math.random() * 2).toFixed(2),
      paletteSize: Math.floor(Math.random() * 7) + 2, // 2-8
      serpentine: Math.random() < 0.5,
      pixelationScale: Math.floor(Math.random() * 10) + 1, // 1-10
      detailEnhancement: Math.floor(Math.random() * 11), // 0-10
      brightness: Math.floor(Math.random() * 201) - 100, // -100 to 100
      midtones: +(Math.random() * 2).toFixed(2), // 0-2
      noise: Math.floor(Math.random() * 101), // 0-100
      glow: Math.floor(Math.random() * 101), // 0-100
      exposure: Math.floor(Math.random() * 101), // 0-100
    }
  }
  }),
})) 