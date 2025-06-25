'use client'

import { useDitherStore } from '@/lib/store'
import { Separator } from '@/components/ui/separator'
import { AlgorithmSelector } from './options-panel/algorithm-selector'
import { SliderControl } from './options-panel/slider-control'
import { CheckboxControl } from './options-panel/checkbox-control'
import { ExportSection } from './options-panel/export-section'
import { ActionButtons } from './options-panel/action-buttons'

interface OptionsPanelProps {
  disabled?: boolean
  ditheredImage?: string | null
}

export function OptionsPanel({ disabled = false, ditheredImage }: OptionsPanelProps) {
  const { options, setOption, resetOptions, randomizeOptions } = useDitherStore()

  return (
    <div className="w-full h-full max-w-md relative">
      {disabled && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/20 backdrop-blur-sm rounded-lg">
          
        </div>
      )}

      <div className="space-y-6 h-full flex flex-col p-2">
        {/* Algorithm Selection */}
        <AlgorithmSelector
          value={options.algorithm}
          onChange={(value) => setOption('algorithm', value)}
          disabled={disabled}
        />
        
        <Separator />
        
        {/* Scrollable Sliders Section */}
        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-400px)] pr-2">
          {/* Exposure */}
          <SliderControl
            label="Exposure"
            value={options.exposure}
            onChange={(value) => setOption('exposure', value)}
            min={-100}
            max={100}
            disabled={disabled}
          />
          
          {/* Pixelation Scale */}
          <SliderControl
            label="Pixelation Scale"
            value={options.pixelationScale}
            onChange={(value) => setOption('pixelationScale', value)}
            min={1}
            max={50}
            disabled={disabled}
          />
          
          {/* Detail Enhancement */}
          <SliderControl
            label="Detail Enhancement"
            value={options.detailEnhancement}
            onChange={(value) => setOption('detailEnhancement', value)}
            min={0}
            max={10}
            disabled={disabled}
          />
          
          {/* Brightness */}
          <SliderControl
            label="Brightness"
            value={options.brightness}
            onChange={(value) => setOption('brightness', value)}
            min={-100}
            max={100}
            disabled={disabled}
          />
          
          {/* Midtones */}
          <SliderControl
            label="Midtones"
            value={options.midtones}
            onChange={(value) => setOption('midtones', value)}
            min={0}
            max={2}
            step={0.01}
            disabled={disabled}
            formatValue={(value) => value.toFixed(2)}
          />
          
          {/* Noise */}
          <SliderControl
            label="Noise"
            value={options.noise}
            onChange={(value) => setOption('noise', value)}
            min={0}
            max={100}
            disabled={disabled}
          />
          
          {/* Glow */}
          <SliderControl
            label="Glow"
            value={options.glow}
            onChange={(value) => setOption('glow', value)}
            min={0}
            max={100}
            disabled={disabled}
          />
        </div>
        
        <Separator />
        
        {/* Serpentine */}
        <CheckboxControl
          label="Serpentine Scanning"
          checked={options.serpentine}
          onChange={(checked) => setOption('serpentine', checked)}
          disabled={disabled}
        />
        
        <Separator />
        
        {/* Export Section */}
        <ExportSection disabled={disabled} ditheredImage={ditheredImage} />
        
        {/* Action Buttons */}
        <ActionButtons
          onReset={resetOptions}
          onRandomize={randomizeOptions}
          disabled={disabled}
        />
      </div>
    </div>
  )
} 