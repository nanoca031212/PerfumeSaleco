import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { Product } from '@/types/product'
import { getAllProducts, getProductByHandle } from '@/lib/products'
// Import removido - função não existe mais
import { useUTM } from '@/hooks/useUTM'
import Layout from '@/components/layout/Layout'
import PromotionalCarousel from '@/components/ui/PromotionalCarousel'
import ProductCardTPS from '@/components/products/ProductCardTPS'
import { ArrowLeft, Heart, ShoppingBag, Star, Minus, Plus, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import ReviewSection from '@/components/products/ReviewSection'
import Link from 'next/link'
import Image from 'next/image'
interface ProductPageProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductPage({ product, relatedProducts }: ProductPageProps) {
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { utmParams } = useUTM()

  // Combinar todas as imagens disponíveis
  const allImages = (() => {
    if (Array.isArray(product.images)) {
      return product.images
    } else {
      return [
        ...(product.images.main || []),
        ...(product.images.gallery || []),
        ...(product.images.individual_items?.map((item: any) => item.url) || [])
      ]
    }
  })().filter(Boolean)

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }

  const handleAddToCart = async () => {
    try {
      // Importar os mapeamentos do Stripe
      const stripeVariantMapping = await import('@/data/stripe_variant_mapping.json');
      const stripeProductMapping = await import('@/data/stripe_product_mapping.json');
      
      // Buscar o ID do Stripe para este produto com type assertion
      const variantMapping = stripeVariantMapping.default as Record<string, string>;
      const productMapping = stripeProductMapping.default as Record<string, { price_id: string }>;
      
      let stripeId = variantMapping[product.handle];
      
      // Se não encontrar no mapeamento de variantes, tentar no mapeamento de produtos
      if (!stripeId && productMapping[product.handle]) {
        stripeId = productMapping[product.handle].price_id;
      }
      
      if (!stripeId) {
        throw new Error(`Stripe ID not found for product: ${product.handle}`);
      }
      
      const cartItem = {
        id: product.id,
        handle: product.handle, // Usar o handle como identificador
        stripeId: stripeId, // ID do preço no Stripe
        title: product.title,
        subtitle: `Eau de Parfum Spray - 100ML`,
        price: typeof product.price.regular === 'string' ? parseFloat(product.price.regular) : product.price.regular,
        image: Array.isArray(product.images) ? product.images[0] : product.images.main[0]
      };
      
      addItem(cartItem, quantity);
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  }

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    // TODO: Implementar lógica de wishlist
  }

  return (
    <Layout hidePromoBanner={false} hideMagentaBanner={true}>
      <Head>
        <title>{`${product.seo?.title || product.title} | Perfumes UK`}</title>
        <meta 
          name="description" 
          content={product.seo?.description || product.description} 
        />
        <meta 
          name="keywords" 
          content={product.seo?.keywords?.join(', ') || product.tags.join(', ')} 
        />
        <meta property="og:title" content={product.title} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={allImages[0]} />
        <meta property="og:type" content="product" />
      </Head>

      {/* Promotional Carousel */}
      <PromotionalCarousel />

      <div className="max-w-[1440px] mx-auto bg-white!important">
        {/* Breadcrumb */}
        <div className="flex justify-center w-full">
          <nav className="flex items-center text-sm text-gray-600 overflow-x-auto py-4 max-w-[1440px] w-full px-4">
            <Link href="/" className="hover:text-gray-900 underline flex-shrink-0">Fragrances</Link>
            <span className="mx-2 flex-shrink-0">|</span>
            <Link href="/womens" className="hover:text-gray-900 underline flex-shrink-0">All Fragrances</Link>
            <span className="mx-2 flex-shrink-0">|</span>
            <span className="font-bold text-black text-sm flex-shrink-0">Eau De Parfum Spray</span>
          </nav>
        </div>

        {/* Brand Header */}
        <div className="bg-black text-white w-full">
          <h2 className="text-xl p-2 font-light font-montserrat tracking-wider text-center">
            MULTI-BRAND
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 px-4 pb-8 bg-white!important">
          {/* Product Images */}
          <div className="flex flex-col items-center">
                          {/* Main Image */}
              <div className="aspect-square bg-white rounded-lg overflow-hidden max-w-[500px] w-full">
                {allImages.length > 0 ? (
                  <Image
                    src={allImages[selectedImage]}
                    alt={product.title}
                    width={500}
                    height={500}
                    className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex justify-center space-x-2 overflow-x-auto pb-2 mt-4 max-w-[500px] w-full">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border transition-all duration-300`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} - Image ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain transition-transform duration-300 hover:scale-110 ${selectedImage === index ? 'border-black border-2' : 'border-gray-200 hover:border-black'}"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col items-start max-w-[500px] mx-auto w-full">
            {/* Brand and Title */}
            <div className="w-full">
              <h1 className="text-[16px] font-medium uppercase text-black mb-1 tracking-wide">
                Multi-Brand Promotion
              </h1>
              <h2 className="text-[22px] leading-none font-bold text-black mb-2">
                {product.title.replace(product.primary_brand || product.brands?.[0] || '', '').trim()}
              </h2>
              <p className="text-black font-medium">Eau de Parfum Spray</p>
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#666666] mb-4">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span>Product code: {product.sku}</span>
                  <span>|</span>
                  <span>RRP £170.00</span>
                  <span>|</span>
                </div>
                <span className="text-[#666666]">£ {product.price.regular} PER 100ml</span>
              </div>
            </div>

            {/* Discount Banner */}
            <div className="border border-black w-full text-center py-2 mb-6">
              <span className="font-light text-black">UP TO 75% OFF APPLIED AT CHECKOUT</span>
            </div>

            {/* Price and Size Selection */}
            <div className="w-full mb-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[20px] text-gray-500">50ML - </span>
                <span className="text-[25px] font-medium text-[#e0001b]">£{product.price.regular}</span>
                <span className="text-[15px] text-black">Save £{(170 - parseFloat(product.price.regular.toString())).toFixed(2)}</span>
                <div className="flex ml-2">
                  {[1, 2, 3, 4, 4.5].map((star, idx) => (
                    <Star 
                      key={idx}
                      className={`h-4 w-4 ${star === 4.5 ? 'fill-[50%]' : 'fill-current'} text-black`}
                    />
                  ))}
                </div>
              </div>           

              <div className="flex items-center gap-4 mb-6">
                <div className="flex border border-gray-300">
                  <button onClick={() => handleQuantityChange(-1)} className="px-4 py-2 text-xl">-</button>
                  <div className="px-4 py-2 border-x border-gray-300">{quantity}</div>
                  <button onClick={() => handleQuantityChange(1)} className="px-4 py-2 text-xl">+</button>
                </div>
                <button className="flex items-center gap-2">
                  <Heart size={20} />
                  <span>Add to wishlist</span>
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                className="w-full bg-black text-white py-3 mb-4 uppercase tracking-wide font-medium"
              >
                Add to bag
              </button>
            </div>


            {/* Delivery Options */}
            <div className="w-full mt-8 space-y-[18px]">
              <div className="flex items-center gap-1 border-b border-gray-300 pb-2">
                <span className="font-bold text-[16px] text-black">10% off your favourite brand</span>
                <span className="text-[16px] text-black">for members</span>
                <img src="/images/rewards.png" alt="Click & Collect" className="ml-2 w-6 h-6" />
              </div>

              <div className="flex items-center gap-1 border-b border-gray-300 pb-2">
                <span className="font-bold text-[16px] text-black">Click & Collect</span>
                <span className="text-[16px] text-black">available in selected stores</span>
                <img src="/images/bag.avif" alt="Click & Collect" className="ml-2 w-6 h-6" />
              </div>

              <div className="flex items-center gap-1">
                <span className="font-bold text-[16px] text-black">FREE Standard Delivery</span>
                <span className="text-[16px] text-black">for members</span>
                <img src="/images/truck.png" alt="Click & Collect" className="ml-10 w-8 h-6" />
              </div>
            </div>

            {/* Description */}
            <div className="my-8">
                <div className="font-bold mb-4 text-lg">Product Description</div>
                <div className="space-y-4 text-sm text-gray-700">
                  <p>
                    Experience luxury at an exceptional value with our exclusive Multi-Brand Promotion. These carefully curated fragrance sets, originally priced at <span className="font-bold text-black line-through">£170.00</span>, are now available for just <span className="font-bold text-black">£{product.price.regular}</span>, offering you a remarkable savings.
                  </p>
                  
                  <p>
                    Each set has been thoughtfully assembled to showcase the finest fragrances from world-renowned luxury brands. Our selection process ensures that every combination delivers a harmonious blend of scents, perfect for any occasion or preference.
                  </p>

                  <div className="mt-6">
                    <p className="font-medium mb-2">Set Contents:</p>
                    <div dangerouslySetInnerHTML={{ __html: product.description_html || '' }} />
                  </div>

                  <p className="mt-4">
                    This limited-time offer represents an unprecedented opportunity to acquire premium fragrances at a fraction of their regular retail price. Each fragrance in the set maintains its full-size integrity and authentic luxury quality.
                  </p>
                </div>
              </div>
          </div>

          {/* Related Products Section */}
          <div className="w-full bg-white pb-12 mt-12">
            <div className="max-w-[1440px] mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">You May Also Like</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts?.slice(0, 8).map((relatedProduct, index) => (
                  <ProductCardTPS 
                    key={relatedProduct.id}
                    product={relatedProduct}
                    priority={index < 4}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection
        reviews={[
          {
            id: 1,
            rating: 5,
            title: "Bought for my fiancée",
            content: "Bought for my fiancée for our wedding day I love it so does she long lasting. Very sexy smell.",
            author: "The Wolf",
            location: "Essex",
            age: "55 - 70 years",
            date: "16 days ago",
            isVerified: true,
            helpfulVotes: 12,
            unhelpfulVotes: 0
          },
          {
            id: 2,
            rating: 5,
            title: "Excellent",
            content: "Oh my god it smells divine and lasts all day, beautiful",
            author: "Moll",
            location: "Wexford",
            date: "1 month ago",
            isVerified: true,
            helpfulVotes: 8,
            unhelpfulVotes: 1,
            reviewedAt: "theperfumeshop.com/ie"
          },
          {
            id: 3,
            rating: 5,
            title: "Would buy this over and over again.",
            content: "Absolute gorgeous scent! One of my favourites, Convenient to buy the refill after you've got the bottle as you can just top it up. Definitely recommend this scent.",
            author: "Nina",
            location: "Birmingham",
            age: "25 - 30 years",
            date: "2 months ago",
            isVerified: true,
            helpfulVotes: 15,
            unhelpfulVotes: 2
          },
          {
            id: 4,
            rating: 4,
            title: "Great value for money",
            content: "Really impressed with this set. All three fragrances are authentic and long-lasting. The presentation is beautiful too - makes for a perfect gift. Only giving 4 stars because one of the bottles had a slightly wonky spray nozzle, but still works fine.",
            author: "James",
            location: "Manchester",
            age: "30 - 35 years",
            date: "3 months ago",
            isVerified: true,
            helpfulVotes: 24,
            unhelpfulVotes: 3
          },
          {
            id: 5,
            rating: 5,
            title: "Perfect Christmas Present",
            content: "Bought this as a Christmas gift for my husband and he absolutely loves it! All three fragrances are his style and the value for money is incredible. The scents last all day and he gets lots of compliments. Will definitely be buying again!",
            author: "Sarah",
            location: "Leeds",
            age: "35 - 40 years",
            date: "3 months ago",
            isVerified: true,
            helpfulVotes: 31,
            unhelpfulVotes: 1
          },
          {
            id: 6,
            rating: 3,
            title: "Nice but could be better",
            content: "The fragrances themselves are lovely and authentic, but I was a bit disappointed with the packaging. One of the boxes was slightly damaged on arrival. The scents are great though, especially for the price.",
            author: "Michael",
            location: "Glasgow",
            age: "40 - 45 years",
            date: "4 months ago",
            isVerified: true,
            helpfulVotes: 18,
            unhelpfulVotes: 4
          },
          {
            id: 7,
            rating: 5,
            title: "Amazing Deal!",
            content: "Can't believe the value for money! Three full-size authentic fragrances for this price is incredible. They all smell exactly like the ones I've tested in department stores. Delivery was quick too.",
            author: "Emma",
            location: "Bristol",
            age: "25 - 30 years",
            date: "4 months ago",
            isVerified: true,
            helpfulVotes: 45,
            unhelpfulVotes: 2
          },
          {
            id: 8,
            rating: 5,
            title: "Best Purchase Ever",
            content: "These perfumes are absolutely stunning! The scents are long-lasting and I get compliments every time I wear any of them. The variety in the set means I have a fragrance for every occasion. Definitely worth every penny!",
            author: "Rachel",
            location: "Dublin",
            age: "30 - 35 years",
            date: "5 months ago",
            isVerified: true,
            helpfulVotes: 37,
            unhelpfulVotes: 1,
            reviewedAt: "theperfumeshop.com/ie"
          }
        ]}
        averageRating={4.7}
        totalReviews={1816}
        recommendationPercentage={96}
        ratingDistribution={{
          5: 1419,
          4: 290,
          3: 81,
          2: 13,
          1: 13
        }}
        qualityRating={5}
        valueRating={4.5}
      />


    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const products = getAllProducts()
  
  const paths = products.map((product: Product) => ({
    params: { handle: product.handle }
  }))

  return {
    paths,
    fallback: 'blocking' // Alterado de false para blocking para suportar novos produtos sem rebuild completo
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const handle = params?.handle as string
  
  if (!handle) {
    return {
      notFound: true
    }
  }

  const product = getProductByHandle(handle)

  if (!product) {
    return {
      notFound: true
    }
  }

  // Obter produtos relacionados (mesma categoria ou marca)
  const allProducts = getAllProducts()
  const relatedProducts = allProducts
    .filter((p: Product) => p.id !== product.id) // Excluir o produto atual
    .filter((p: Product) => 
      p.category === product.category || 
      p.brands?.some((b: string) => product.brands?.includes(b))
    )
    .slice(0, 8) // Limitar a 8 produtos relacionados

  return {
    props: {
      product,
      relatedProducts
    },
    revalidate: 3600 // Revalidar a cada hora
  }
}