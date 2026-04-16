import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Award, Menu, User, ShoppingBag, CheckCircle } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import LoginModal from './LoginModal'
import AlertModal from './AlertModal'

interface User {
  email: string;
  name?: string;
}

interface BottomNavigationProps {
  className?: string
}

export default function BottomNavigation({ className = '' }: BottomNavigationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isStoresAlertOpen, setIsStoresAlertOpen] = useState(false)
  const [isRewardsAlertOpen, setIsRewardsAlertOpen] = useState(false)
  const [isMenuAlertOpen, setIsMenuAlertOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const { items, setIsOpen } = useCart()

  // Show/hide based on scroll position
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      // Clear existing timeout
      clearTimeout(timeoutId)
      
      // Show navigation
      setIsVisible(true)
      
      // Hide after 3 seconds of no scrolling
      timeoutId = setTimeout(() => {
        setIsVisible(false)
      }, 3000)
    }

    // Initial show
    setIsVisible(true)
    timeoutId = setTimeout(() => setIsVisible(false), 3000)

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [])

  interface NavigationItem {
    label: string
    icon: any // Idealmente deveria ser um tipo mais específico para ícones
    href: string
    count: number | null
    onClick?: () => void
  }

  const navigationItems: NavigationItem[] = [
    {
      label: 'Stores',
      icon: MapPin,
      href: '#',
      count: null,
      onClick: () => setIsStoresAlertOpen(true)
    },
    {
      label: 'Rewards',
      icon: Award,
      href: '#',
      count: null,
      onClick: () => setIsRewardsAlertOpen(true)
    },
    {
      label: 'Menu',
      icon: Menu,
      href: '#',
      count: null,
      onClick: () => setIsMenuAlertOpen(true)
    },
    {
      label: user ? user.email.split('@')[0] : 'My Account',
      icon: user ? CheckCircle : User,
      href: '#',
      count: null,
      onClick: () => setIsLoginOpen(true)
    },
    {
      label: 'Basket',
      icon: ShoppingBag,
      href: '#',
      onClick: () => {
        // Abrindo carrinho
        setIsOpen(true)
      },
      count: items.length
    }
  ]

  return (
    <>
    <nav 
      className={`fixed bottom-0 left-0 right-0 bg-gray-chip border-t border-gray-200 
                 transition-transform duration-300 z-50 ${
                   isVisible ? 'translate-y-0' : 'translate-y-full'
                 } ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            
            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Button clicked')
                    item.onClick?.()
                  }}
                  type="button"
                  className="flex flex-col items-center justify-center py-2 px-3 text-center min-w-[60px]
                           hover:bg-gray-200 transition-colors rounded-lg group cursor-pointer"
                >
                  <div className="relative mb-1">
                    <Icon className="h-5 w-5 text-black group-hover:text-gray-700" />
                    
                    {/* Badge for cart count */}
                    {item.count !== null && item.count > 0 && (
                      <span className="absolute -top-2 -right-2 bg-tps-red text-white text-xs 
                                     rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {item.count > 99 ? '99+' : item.count}
                      </span>
                    )}
                  </div>
                  
                  <span className="text-xs text-black font-medium leading-tight">
                    {item.label}
                  </span>
                </button>
              )
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center py-2 px-3 text-center min-w-[60px]
                         hover:bg-gray-200 transition-colors rounded-lg group"
              >
                <div className="relative mb-1">
                  <Icon className="h-5 w-5 text-black group-hover:text-gray-700" />
                  
                  {/* Badge for cart count */}
                  {item.count !== null && item.count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-tps-red text-white text-xs 
                                   rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {item.count > 99 ? '99+' : item.count}
                    </span>
                  )}
                </div>
                
                <span className="text-xs text-black font-medium leading-tight">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={(loggedUser) => {
          setUser(loggedUser)
          setIsLoginOpen(false)
        }}
      />

      {/* Stores Alert */}
      <AlertModal
        isOpen={isStoresAlertOpen}
        onClose={() => setIsStoresAlertOpen(false)}
        title="Online Exclusive Offer"
        message="This promotion is exclusively available on our website. Enjoy the best prices and discounts only available here. Remember, these special offers will expire if you navigate away!"
      />

      {/* Rewards Alert */}
      <AlertModal
        isOpen={isRewardsAlertOpen}
        onClose={() => setIsRewardsAlertOpen(false)}
        title="Don't Miss Out!"
        message="Please note: This exclusive promotion will be automatically cancelled if you leave this page. Take advantage of these special prices whilst they're available!"
      />

      {/* Menu Alert */}
      <AlertModal
        isOpen={isMenuAlertOpen}
        onClose={() => setIsMenuAlertOpen(false)}
        title="Don't Miss Out!"
        message="Please note: This exclusive promotion will be automatically cancelled if you leave this page. Take advantage of these special prices whilst they're available!"
      />
    </>
  )
}
