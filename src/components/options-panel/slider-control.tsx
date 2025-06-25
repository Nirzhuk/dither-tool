'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface SliderControlProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  disabled?: boolean
  formatValue?: (value: number) => string
}

export function SliderControl({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  disabled = false,
  formatValue = (v) => v.toString()
}: SliderControlProps) {
  return (
    <div className="space-y-2">
      <Label>{label} {formatValue(value)}</Label>
      <Slider
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        max={max}
        min={min}
        step={step}
        className="w-full"
        disabled={disabled}
      />
    </div>
  )
} 