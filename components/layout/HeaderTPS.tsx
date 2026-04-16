import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, User, ShoppingBag, Heart, Menu, X, MapPin, Gift } from 'lucide-react'
import SearchBar from '@/components/search/SearchBar'
import { getAllProducts } from '@/lib/products'
import { Product } from '@/types/product'

interface HeaderTPSProps {
  className?: string
  hidePromoBanner?: boolean
  hideMagentaBanner?: boolean
  sticky?: boolean
}

export default function HeaderTPS({ 
  className = '', 
  hidePromoBanner = false, 
  hideMagentaBanner = false,
  sticky = false
}: HeaderTPSProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    setProducts(getAllProducts())
  }, [])

  // Navegação principal (tabs rosa)
  const mainNavItems = [
    { name: 'TRENDING', href: '/trending' },
    { name: 'BRANDS', href: '/brands' },
    { name: 'DISCOVERY', href: '/discovery' },
    { name: 'BOUTIQUE', href: '/boutique' }
  ]

  return (
    <header className={`${sticky ? 'sticky top-0 z-50' : 'relative'} ${className}`}>
      {/* Promotional Banner */}
      {!hidePromoBanner && (
        <div className="bg-tps-red text-white text-center p-5 text-[15px] font-normal">
          Take the perfume quiz and get up to £120 off*
        </div>
      )}

      {/* Top Bar - Preta */}
      <div className="bg-black text-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center" suppressHydrationWarning>
              <img src="/images/logo.avif" alt="Logo" width={210} height={210} />
            </Link>

            {/* Icons direita */}
            <div className="flex items-center space-x-3">
              {/* Currency Icon - sempre visível */}
              <img src="/images/IconLibra.jpg" alt="GBP" width={30} height={30} />
              
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar - Esticada horizontalmente */}
      <div className="bg-black">
        <div className="w-full p-1">
          <div className="relative w-full max-w-none">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full pl-6 pr-16 py-4 text-base border-0 rounded-lg
                       bg-gray-50 text-left text-gray-500"
            >
              Looking for something specific?
            </button>
            <div className="absolute right-2 top-2 bottom-2 w-12 bg-tps-green text-white
                         rounded-md flex items-center justify-center">
              <Search className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
      />



      {/* Navigation Tabs - Rosa/Magenta */}
      {!hideMagentaBanner && <div className="bg-tps-magenta">
        <div className="container mx-auto">
          <nav className="flex overflow-x-auto scrollbar-none">
            {/* Home/All Products */}
            <Link
              href="/"
              className="flex-shrink-0 px-6 py-4 text-white text-sm font-bold uppercase tracking-wider
                       transition-colors whitespace-nowrap"
              suppressHydrationWarning
            >
              OFFERS
            </Link>
            
            {/* Men's Collection */}
            <Link
              href="/collections/mens"
              className="flex-shrink-0 px-6 py-4 text-white text-sm font-medium uppercase tracking-wider
                       hover:bg-white hover:bg-opacity-10 transition-colors whitespace-nowrap"
              suppressHydrationWarning
            >
              MEN'S
            </Link>
            
            {/* Women's Collection */}
            <Link
              href="/collections/womens"
              className="flex-shrink-0 px-6 py-4 text-white text-sm font-medium uppercase tracking-wider
                       hover:bg-white hover:bg-opacity-10 transition-colors whitespace-nowrap"
              suppressHydrationWarning
            >        
              WOMEN'S
            </Link>

            {/* Gift Sets */}
            <Link
              href="/collections/gift-sets"
              className="flex-shrink-0 px-6 py-4 text-white text-sm font-medium uppercase tracking-wider
                       hover:bg-white hover:bg-opacity-10 transition-colors whitespace-nowrap"
              suppressHydrationWarning
            >
              GIFT SETS
            </Link>
            
            {/* Special Offers */}
            <Link
              href="/"
              className="flex-shrink-0 px-6 py-4 text-white text-sm font-medium uppercase tracking-wider
                       hover:bg-white hover:bg-opacity-10 transition-colors whitespace-nowrap"
              suppressHydrationWarning
            >
              SPECIAL OFFERS
            </Link>
          </nav>
        </div>
      </div>}     
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[120px] bg-white z-50 overflow-y-auto">
          <nav className="container mx-auto px-4 py-6">
            
            {/* Main Navigation */}
            <div className="space-y-1 mb-8">
              {mainNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-4 text-lg font-semibold text-gray-900 
                           hover:bg-gray-50 rounded-lg border-b border-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                  suppressHydrationWarning
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Secondary Links */}
            <div className="space-y-1 mb-8 pt-6 border-t border-gray-200">
              <Link
                href="/stores"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
                suppressHydrationWarning
              >
                <MapPin className="mr-3 h-5 w-5" />
                Stores
              </Link>
              <Link
                href="/account"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
                suppressHydrationWarning
              >
                <User className="mr-3 h-5 w-5" />
                My Account
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
                suppressHydrationWarning
              >
                <Heart className="mr-3 h-5 w-5" />
                Wishlist
              </Link>
            </div>

            {/* Contact Info */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Need help?</p>
              <p className="text-sm font-medium text-gray-900">0800 123 4567</p>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
