import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Product } from '@/types/product'
import { usePixel } from '@/hooks/usePixel'

interface ProductCardTPSProps {
  product: Product
  className?: string
  priority?: boolean
}

export default function ProductCardTPS({ product, className = '', priority = false }: ProductCardTPSProps) {
  const [imageError, setImageError] = useState(false)
  const pixel = usePixel()

  // Extrair URL da imagem principal
  const getMainImageUrl = () => {
    if (Array.isArray(product.images)) {
      return product.images[0] || '/images/placeholder-product.jpg'
    } else if (product.images && typeof product.images === 'object' && 'main' in product.images) {
      return product.images.main[0] || '/images/placeholder-product.jpg'
    }
    return '/images/placeholder-product.jpg'
  }

  const imageUrl = getMainImageUrl()
  const brands = product.brands || [product.brand] || ['Unknown']
  const primaryBrand = brands[0]

  // Preços
  const formatPrice = (price: string | number) => {
    if (typeof price === 'string') {
      return parseFloat(price).toFixed(2)
    }
    return price.toFixed(2)
  }
  
  const hasDiscount = product.price.discount_percent > 0

  // Rating (placeholder - 4 de 5 estrelas)
  const rating = 4
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? 'fill-black text-black' : 'text-gray-300'}`}
      />
    ))
  }

  // Função para rastrear visualização do produto
  const handleViewContent = () => {
    pixel.viewContent({
      content_type: 'product',
      content_ids: [product.id.toString()],
      content_name: product.title,
      content_category: product.tags.join(','),
      value: parseFloat(product.price.regular.toString()),
      currency: 'GBP'
    })
  }

  return (
    <div className={`bg-white flex flex-col h-full ${className}`}>
      {/* Product Link - flex container para espaçamento uniforme */}
      <Link 
        href={`/products/${product.handle}`} 
        className="flex flex-col flex-grow"
        onClick={handleViewContent}
        suppressHydrationWarning
      >
        {/* Image Container */}
        <div className="relative bg-white mb-3">
          {/* Viewers Counter */}
          {product.popularity > 0 && (
            <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-xs py-1 px-2 rounded-full z-10">
              {product.popularity} others viewed<br/>in last 8 hrs
            </div>
          )}
          
          {/* Product Image */}
          {!imageError ? (
            <div className="aspect-square relative">
              <Image
                src={imageUrl}
                alt={product.title}
                fill
                className="object-contain"
                priority={priority}
                onError={() => setImageError(true)}
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="aspect-square flex items-center justify-center bg-gray-50">
              <span className="text-4xl text-gray-300">?</span>
            </div>
          )}

           {/* Promotional Banner */}
          <div className="bg-white border border-black text-center text-xs py-1 mb-2">
            UP TO 75% OFF APPLIED AT CHECKOUT
          </div>

          {/* Badge - Canto superior direito */}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-white border border-black rounded-full w-16 h-16 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs font-bold leading-tight">UP TO</div>
                <div className="text-sm font-bold leading-tight">{product.price.discount_percent}% OFF</div>
                <div className="text-xs leading-tight">APPLIED AT</div>
                <div className="text-xs leading-tight">CHECKOUT</div>
              </div>
            </div>
          )}

          {/* New/Tester Badge */}
          {product.new_arrival && !hasDiscount && (
            <div className="absolute top-2 right-2 bg-white border border-black rounded-full w-12 h-12 flex items-center justify-center">
              <span className="text-xs font-bold">NEW</span>
            </div>
          )}
          
          {/* Free Tester Badge */}
          {product.tags?.includes('tester') && (
            <div className="absolute top-2 right-2 bg-white border border-black rounded-full w-16 h-16 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs font-bold">FREE</div>
                <div className="text-xs font-bold">TESTER</div>
              </div>
            </div>
          )}
        </div>

        {/* Linha decorativa */}
        <div className="w-full h-px bg-black mb-3"></div>

        {/* Product Info - flex grow para empurrar botão para baixo */}
        <div className="text-center space-y-2 flex flex-col flex-grow">
          
          {/* Brand */}
          <div className="text-sm font-bold uppercase tracking-wide text-[#333333] mb-1">
            {primaryBrand}
          </div>

          {/* Product Name - altura fixa para uniformidade */}
          <h3 className="text-sm text-black leading-tight h-12 flex items-center justify-center text-center px-1">
            <span className="line-clamp-2">
              {product.title.replace(primaryBrand + ' ', '')}
            </span>
          </h3>

          {/* Product Type */}
          <div className="text-xs font-thin text-black">
            {product.is_combo ? 'Eau de Parfum Spray' : 'Eau de Parfum Spray'} - 100ML
          </div>

          {/* Spacer para empurrar conteúdo para baixo */}
          <div className="flex-grow"></div>

          {/* Pricing */}
          <div className="space-y-1 mx-auto">
            {/* Price Range */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-sm mt-1">
                <span className="text-gray-500">£{formatPrice(product.price.regular)}</span>
                <span className="text-vetps-red font-bold">Save £{(170 - parseFloat(product.price.regular.toString())).toFixed(2)}</span>
              </div>
            </div>
            
            {/* Sponsored Tag if applicable */}
            {product.featured && (
              <div className="text-xs text-gray-500">
                Sponsored
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* CTA Button - sempre na parte inferior */}
      <div className="mt-4">
        <Link 
          href={`/products/${product.handle}`}
          className="block w-full bg-black rounded-[4px] text-white py-3 text-x1 font-thin uppercase tracking-wide
                   hover:bg-gray-900 transition-colors duration-200 text-center"
          onClick={handleViewContent}
          suppressHydrationWarning
        >
          VIEW DETAILS
        </Link>
      </div>
    </div>
  )
}