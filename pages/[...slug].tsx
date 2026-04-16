import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import ListControls from '@/components/filters/ListControls'
import { getAllProducts } from '@/lib/products'
import { Product } from '@/types/product'
import ProductCardTPS from '@/components/products/ProductCardTPS'

// Tipos de página e suas configurações
const pageConfigs = {
  'mens': {
    title: "Men's Fragrances",
    description: 'Discover our collection of premium men\'s fragrances',
    tag: 'men'
  },
  'womens': {
    title: "Women's Fragrances",
    description: 'Explore our luxury women\'s fragrances',
    tag: 'women'
  },
  'offers': {
    title: 'Special Offers',
    description: 'Exclusive deals on premium fragrances',
    tag: 'offers'
  },
  'gifting': {
    title: 'Gift Sets',
    description: 'Perfect fragrance gifts for every occasion',
    tag: 'gift-set'
  },
  'vegan': {
    title: 'Vegan Fragrances',
    description: '100% vegan and cruelty-free fragrances',
    tag: 'vegan'
  },
  'kids': {
    title: 'Kids Fragrances',
    description: 'Gentle fragrances for children',
    tag: 'kids'
  }
} as const

// Subpáginas e suas configurações
const subPageConfigs = {
  'new': {
    title: 'New In',
    description: 'Our latest arrivals',
    tag: 'new-in'
  },
  'bestsellers': {
    title: 'Bestsellers',
    description: 'Our most popular fragrances',
    tag: 'bestseller'
  },
  'premium': {
    title: 'Premium',
    description: 'Luxury fragrances',
    tag: 'premium'
  }
} as const

interface DynamicPageProps {
  products: Product[]
  pageConfig: typeof pageConfigs[keyof typeof pageConfigs]
  subPageConfig?: typeof subPageConfigs[keyof typeof subPageConfigs] | null
}

export default function DynamicPage({ products: initialProducts, pageConfig, subPageConfig }: DynamicPageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {subPageConfig ? subPageConfig.title : pageConfig.title}
          </h1>
          <p className="mt-2 text-gray-600">
            {subPageConfig ? subPageConfig.description : pageConfig.description}
          </p>
        </div>

        {/* Promotional Banner para Offers */}
        {pageConfig.tag === 'offers' && (
          <div className="bg-tps-red text-white text-center p-4 rounded-lg mb-8">
            <p className="text-lg font-medium">
              Extra 10% OFF for Members - Join Now!
            </p>
          </div>
        )}

        <ListControls 
          products={products}
          onFilterToggle={(filters) => {
            if (filters.length === 0) {
              setProducts(products)
              return
            }

            const filtered = products.filter(product => {
              return filters.some(filter => {
                // Filtro de marca
                if (filter.includes('-')) {
                  const brandRegex = new RegExp(filter.replace(/-/g, '\\s+'), 'i')
                  if (product.brands?.some(brand => brandRegex.test(brand))) return true
                  if (product.primary_brand && brandRegex.test(product.primary_brand)) return true
                  if (product.title && brandRegex.test(product.title)) return true
                }
                
                return false
              })
            })
            
            setProducts(filtered)
          }}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <ProductCardTPS 
              key={product.id}
              product={product}
              priority={index < 4}
            />
          ))}
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticPaths() {
  // Gerar paths para as páginas conhecidas
  const paths = [
    { params: { slug: ['mens'] } },
    { params: { slug: ['womens'] } },
    { params: { slug: ['gifting'] } },
    { params: { slug: ['vegan'] } },
    { params: { slug: ['kids'] } },
    { params: { slug: ['mens', 'new'] } },
    { params: { slug: ['mens', 'bestsellers'] } },
    { params: { slug: ['mens', 'premium'] } },
    { params: { slug: ['womens', 'new'] } },
    { params: { slug: ['womens', 'bestsellers'] } },
    { params: { slug: ['womens', 'premium'] } },
    { params: { slug: ['offers'] } }
  ]

  return {
    paths,
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params }: { params: { slug: string[] } }) {
  const [mainPage, subPage] = params.slug
  const mainConfig = pageConfigs[mainPage as keyof typeof pageConfigs]
  const subConfig = subPage ? subPageConfigs[subPage as keyof typeof subPageConfigs] : null

  if (!mainConfig) {
    return {
      notFound: true
    }
  }

  const allProducts = getAllProducts()
  let filtered = allProducts.filter((product: Product) => product.tags.includes(mainConfig.tag))

  // Aplica filtro adicional se houver subpágina
  if (subConfig) {
    filtered = filtered.filter((product: Product) => product.tags.includes(subConfig.tag))
  }

  return {
    props: {
      products: filtered,
      pageConfig: mainConfig,
      subPageConfig: subConfig
    },
    revalidate: 3600 // Revalidar a cada hora
  }
}
