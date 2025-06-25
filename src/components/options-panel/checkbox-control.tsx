'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface CheckboxControlProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function CheckboxControl({ label, checked, onChange, disabled = false }: CheckboxControlProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        checked={checked}
        onCheckedChange={(checked) => onChange(checked as boolean)}
        disabled={disabled}
      />
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>{label}</Label>
    </div>
  )
} 