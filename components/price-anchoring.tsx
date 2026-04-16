"use client"

import { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"
import Image from "next/image"

interface Kit {
  id: string
  name: string
  wrestler: string
  price: number
  originalPrice: number
  savings: number
  description: string
  items: string[]
  images: string[]
}

const kits: Kit[] = [
  {
    id: "luxury-perfumes",
    name: "3 Luxury Perfumes – Exclusive Online Kit",
    wrestler: "Premium",
    price: 49.99,
    originalPrice: 170.00,
    savings: 120.01,
    description: "3 Premium Fragrance Collection",
    items: [
      "Elegant Rose & Bergamot (50ml)",
      "Mysterious Oud & Vanilla (50ml)", 
      "Fresh Citrus & Cedar (50ml)",
      "Premium Gift Box",
      "Exclusive Online Access",
      "Limited Time Offer"
    ],
    images: [
      "/perfume-kit.jpg",
      "/perfume-close-up.jpg",
      "/perfume-unboxing.jpg",
      "/perfume-lifestyle.jpg"
    ]
  }
]

interface PriceAnchoringProps {
  correctAnswers: number
  onBuyClick?: (selectedKit: string) => void
}

export default function PriceAnchoring({ correctAnswers, onBuyClick }: PriceAnchoringProps) {
  const [selectedKit, setSelectedKit] = useState<string>("luxury-perfumes")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [carouselOffset, setCarouselOffset] = useState(0)
  
  const selectedKitData = kits.find(kit => kit.id === selectedKit) || kits[0]
  const discount = correctAnswers * 20
  const finalPrice = selectedKitData.price // Use the kit's specific price

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        (prev + 1) % selectedKitData.images.length
      )
    }, 3000)
    
    return () => clearInterval(interval)
  }, [selectedKitData.images.length])

  // Reset image index when kit changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedKit])

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselOffset(prev => {
        // Each item is 232px (200px + 32px margin)
        const itemWidth = 232
        // Move by 1px for smooth animation
        const newOffset = prev - 1
        // Reset when we've moved one full cycle
        const totalWidth = itemWidth * 11 // 11 unique images (per1 to per11)
        if (Math.abs(newOffset) >= totalWidth) {
          return 0
        }
        return newOffset
      })
    }, 20) // Update every 20ms for smooth animation
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white pt-4">
      <h1 className="text-center text-[#2c2c2c] text-2xl font-bold font-sans mb-4">Unlock Your Exclusive Perfume Deal</h1>
      <div className="flex justify-center mb-6"><span className="text-sm text-wrap text-center text-gray-500">Answer six quick questions and save up to £120 — available only online, for a limited time.</span></div>



      
      {/* New Temu-style Layout */}
      <div className="flex items-center bg-white justify-between mb-4">
        <div className="w-20 h-20 overflow-hidden border border-red-600">
          <Image
            src="/3-caixas.png"
            alt="temu box"
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-right mr-4">
          <p className="text-sm text-black">Original Price</p>
          <p className="text-lg line-through font-bold text-[#f73e3e]">£{selectedKitData.originalPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center py-2">
        <span className="text-sm text-gray-900 uppercase tracking-wide font-medium">FINAL PRICE</span>
        <div className="text-right">
          <span className="block text-3xl font-semibold text-gray-900">£{finalPrice.toFixed(2)}</span>
          <span className="text-sm text-[#ca0d0d]">You save £{discount}</span>
        </div>
      </div>

              <div className="border-t-2 border-[#f00] pt-6">
          <h3 className="text-center text-[#2c2c2c] text-2xl font-bold font-sans mb-2">Perfumes we still have in stock:</h3>
        
        <div className="w-full overflow-hidden bg-white">
          <div className="relative">
            <div 
              className="flex transition-none" 
              style={{
                transform: `translateX(${carouselOffset}px)`,
                width: '7656px' // Adjusted for 11 images: 11 * 232px * 3 cycles = 7656px
              }}
            >
              {/* Create infinite loop by repeating the pattern multiple times */}
              {Array.from({ length: 3 }, (_, cycleIndex) => 
                [1,2,3,4,5,6,7,8,9,10,11].map((item, index) => (
                  <div key={`${cycleIndex}-${index}`} className="flex-shrink-0 mr-8">
                    <div className="w-[200px] h-[200px] md:w-[200px] md:h-[200px] sm:w-[150px] sm:h-[150px]">
                      <Image
                        src={`/per${item}.png`}
                        alt={`Perfume ${item}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>
                ))
              ).flat()}
            </div>
          </div>
        </div>
      </div>



      {/* Price Breakdown */}
      <div className="space-y-4 mb-8">
        
        {/* Buy Now Button */}
        {onBuyClick && (
          <div className="mt-6">
            <button
              onClick={() => onBuyClick(selectedKit)}
              className="w-full bg-[#18d431] hover:bg-[#33ff00] shadow-xl shadow-gray-500/35 hover:shadow-green-200 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Buy Now – Get This Perfume Kit
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
