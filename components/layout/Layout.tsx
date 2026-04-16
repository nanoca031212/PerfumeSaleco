import { ReactNode } from 'react'
import HeaderTPS from './HeaderTPS'
import FooterTPS from './FooterTPS'

interface LayoutProps {
  children: ReactNode
  className?: string
  hidePromoBanner?: boolean
  hideMagentaBanner?: boolean
}

export default function Layout({ 
  children, 
  className = '',
  hidePromoBanner = false,
  hideMagentaBanner = false
}: LayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-white overflow-x-hidden ${className}`}>
      {/* Header */}
      <HeaderTPS hidePromoBanner={hidePromoBanner} hideMagentaBanner={hideMagentaBanner} />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <FooterTPS />
    </div>
  )
}
