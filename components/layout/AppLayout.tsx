import { ReactNode } from 'react'
import { useCart } from '@/contexts/CartContext'
import ShoppingBag from '@/components/cart/ShoppingBag'
import BottomNavigation from './BottomNavigation'

interface AppLayoutProps {
  children: ReactNode
  hideBottomNavigation?: boolean
}

export default function AppLayout({ children, hideBottomNavigation = false }: AppLayoutProps) {
  const { isOpen, setIsOpen } = useCart()

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {children}
      </main>
      {!hideBottomNavigation && <BottomNavigation />}
      <ShoppingBag isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}
