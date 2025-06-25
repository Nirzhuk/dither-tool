'use client'

import { Button } from '@/components/ui/button'

interface ActionButtonsProps {
  onReset: () => void
  onRandomize: () => void
  disabled?: boolean
}

export function ActionButtons({ onReset, onRandomize, disabled = false }: ActionButtonsProps) {
  return (
    <div className="flex gap-2 mt-4">
      <Button
        variant="secondary"
        onClick={onReset}
        className="flex-1"
        disabled={disabled}
      >
        Reset
      </Button>
      <Button
        variant="outline"
        onClick={onRandomize}
        className="flex-1"
        disabled={disabled}
      >
        Randomize
      </Button>
    </div>
  )
} 