import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PromotionalCarouselProps {
  className?: string
}

export default function PromotionalCarousel({ className = '' }: PromotionalCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const promotions = [
    {
      text: '75% OFF',
      subtext: 'WITH QUIZ DISCOUNT',
        href: '/quiz-discount'
    },
    {
      text: 'DONT EXIT',
      subtext: 'FOR COLLECTION',
      href: '/delivery-information'
    },
    {
    text: 'PROMO CODE APPLIES',
      subtext: 'IN 100+ UK STORES',
      href: '/deliveroo'
    },
    {
      text: '90 DAY RETURNS',
      subtext: 'AVAILABLE',
      href: '/returns-and-refunds'
    },
    {
      text: 'LAST WEEK TO SAVE',
      subtext: 'ON PERFUME PROMISE',
      href: '/offers'
    }
  ]

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length)
    }, 4000) // Change every 4 seconds (different from e-gift carousel)

    return () => clearInterval(interval)
  }, [promotions.length])

  return (
    <div className={`bg-gray-100 border-b border-gray-200 overflow-hidden ${className}`}>
      <div className="relative h-12">
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="flex transition-transform duration-700 ease-in-out w-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Duplicate last item at start for smooth transition */}
            <div
              key="last-clone"
              className="w-full flex-shrink-0 flex items-center justify-center px-4 min-w-full"
            >
              <Link
                href={promotions[promotions.length - 1].href}
                className="text-center hover:underline transition-all duration-200 group whitespace-nowrap"
              >
                <span className="text-sm font-bold text-black group-hover:text-gray-700">
                  {promotions[promotions.length - 1].text}
                </span>
                {promotions[promotions.length - 1].subtext && (
                  <span className="text-sm text-black ml-1 group-hover:text-gray-700">
                    {promotions[promotions.length - 1].subtext}
                  </span>
                )}
              </Link>
            </div>

            {/* Main items */}
            {promotions.map((promo, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 flex items-center justify-center px-4 min-w-full"
              >
                <Link
                  href={promo.href}
                  className="text-center hover:underline transition-all duration-200 group whitespace-nowrap"
                  suppressHydrationWarning
                >
                  <span className="text-sm font-bold text-black group-hover:text-gray-700">
                    {promo.text}
                  </span>
                  {promo.subtext && (
                    <span className="text-sm text-black ml-1 group-hover:text-gray-700">
                      {promo.subtext}
                    </span>
                  )}
                </Link>
              </div>
            ))}

            {/* Duplicate first item at end for smooth transition */}
            <div
              key="first-clone"
              className="w-full flex-shrink-0 flex items-center justify-center px-4 min-w-full"
            >
              <Link
                href={promotions[0].href}
                className="text-center hover:underline transition-all duration-200 group whitespace-nowrap"
                suppressHydrationWarning
              >
                <span className="text-sm font-bold text-black group-hover:text-gray-700">
                  {promotions[0].text}
                </span>
                {promotions[0].subtext && (
                  <span className="text-sm text-black ml-1 group-hover:text-gray-700">
                    {promotions[0].subtext}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation dots - hidden, just for touch/click navigation */}
        <div className="absolute inset-0 flex">
          {promotions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="flex-1 opacity-0 hover:opacity-10 hover:bg-black transition-opacity duration-200"
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
