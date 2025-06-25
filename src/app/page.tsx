'use client'
import { useState } from 'react'
import { OptionsPanel } from '@/components/options-panel'
import { Playground } from '@/components/playground'

export default function Home() {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [ditheredImage, setDitheredImage] = useState<string | null>(null)

  return (
    <div className="overflow-hidden bg-background p-2">
      {/* Main Content */}
      <div className="h-[calc(100vh-16px)]  grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Playground Section */}
        <div className="order-2 lg:order-1">
          <Playground onImageLoaded={setImageLoaded} onDitheredImage={setDitheredImage} />
        </div>
        {/* Options Section */}
        <div className="order-1 lg:order-2">
          <OptionsPanel disabled={!imageLoaded} ditheredImage={ditheredImage} />
        </div>
      </div>
    </div>
  )
}
