'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DitherAlgorithm } from '@/lib/store'

interface AlgorithmSelectorProps {
  value: DitherAlgorithm
  onChange: (value: DitherAlgorithm) => void
  disabled?: boolean
}

const ALGORITHMS: { value: DitherAlgorithm; label: string }[] = [
  { value: 'floyd-steinberg', label: 'Floyd-Steinberg' },
  { value: 'atkinson', label: 'Atkinson' },
  { value: 'burkes', label: 'Burkes' },
  { value: 'sierra', label: 'Sierra' },
  { value: 'sierra-lite', label: 'Sierra Lite' },
  { value: 'stucki', label: 'Stucki' },
  { value: 'bayer', label: 'Bayer (Ordered)' },
]

export function AlgorithmSelector({ value, onChange, disabled = false }: AlgorithmSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="algorithm">Algorithm</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger disabled={disabled}>
          <SelectValue placeholder="Select algorithm" />
        </SelectTrigger>
        <SelectContent>
          {ALGORITHMS.map((algorithm) => (
            <SelectItem key={algorithm.value} value={algorithm.value}>
              {algorithm.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 