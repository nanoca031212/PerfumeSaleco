import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Product } from '@/types/product'
import Layout from '@/components/layout/Layout'
import ProductCardTPS from '@/components/products/ProductCardTPS'
import ListControls from '@/components/filters/ListControls'
import { useSessionFilters } from '@/hooks/useSessionFilters'

interface BaseCollectionProps {
  products: Product[]
  title: string
  description: string
  filterFunction?: (product: Product) => boolean
}

export default function BaseCollection({ 
  products: initialProducts, 
  title, 
  description,
  filterFunction 
}: BaseCollectionProps) {
  // Se houver uma função de filtro, aplica ela nos produtos iniciais
  const baseProducts = filterFunction ? initialProducts.filter(filterFunction) : initialProducts
  const [products, setProducts] = useState(baseProducts)
  
  // Usar filtros baseados em sessão UTM
  const { sessionFilters, isLoaded } = useSessionFilters()
  const sortBy = sessionFilters.sort

  // Aplicar filtros da sessão quando carregados
  useEffect(() => {
    if (!isLoaded) return

    let filteredProducts = baseProducts

    // Aplicar filtros primeiro
    if (sessionFilters.activeFilters.length > 0) {
      filteredProducts = baseProducts.filter(product => {
        return sessionFilters.activeFilters.some(filter => {
          // Filtro de marca
          if (filter.includes('-') && !['new-in', 'gift-set'].includes(filter)) {
            const brandRegex = new RegExp(filter.replace(/-/g, '\\s+'), 'i')
            if (product.brands?.some(brand => brandRegex.test(brand))) return true
            if (product.primary_brand && brandRegex.test(product.primary_brand)) return true
          }

          // Filtros de preço
          if (filter === 'under-50') {
            const price = typeof product.price.regular === 'string' ? parseFloat(product.price.regular) : product.price.regular
            return price < 50
          }
          if (filter === '50-100') {
            const price = typeof product.price.regular === 'string' ? parseFloat(product.price.regular) : product.price.regular
            return price >= 50 && price <= 100
          }
          if (filter === 'over-100') {
            const price = typeof product.price.regular === 'string' ? parseFloat(product.price.regular) : product.price.regular
            return price > 100
          }

          // Filtros de gênero
          if (filter === 'men' || filter === 'women') {
            return product.tags?.includes(filter)
          }

          // Filtros de coleção
          if (['new-in', 'bestseller', 'gift-set', 'luxury'].includes(filter)) {
            return product.tags?.includes(filter)
          }

          return false
        })
      })
    }

    // Aplicar ordenação
    if (sessionFilters.sort !== 'featured') {
      switch (sessionFilters.sort) {
        case 'price-low':
          filteredProducts.sort((a, b) => {
            const priceA = typeof a.price.regular === 'string' ? parseFloat(a.price.regular) : a.price.regular
            const priceB = typeof b.price.regular === 'string' ? parseFloat(b.price.regular) : b.price.regular
            return priceA - priceB
          })
          break
        case 'price-high':
          filteredProducts.sort((a, b) => {
            const priceA = typeof a.price.regular === 'string' ? parseFloat(a.price.regular) : a.price.regular
            const priceB = typeof b.price.regular === 'string' ? parseFloat(b.price.regular) : b.price.regular
            return priceB - priceA
          })
          break
        case 'name-az':
          filteredProducts.sort((a, b) => a.title.localeCompare(b.title))
          break
        case 'name-za':
          filteredProducts.sort((a, b) => b.title.localeCompare(a.title))
          break
        case 'newest':
          filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          break
        case 'popular':
          filteredProducts.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          break
      }
    }

    setProducts(filteredProducts)
  }, [isLoaded, sessionFilters.activeFilters, sessionFilters.sort, baseProducts])

  const handleSort = (sort: string) => {
    let sortedProducts = [...products]

    switch (sort) {
      case 'price-low':
        sortedProducts.sort((a, b) => {
          const priceA = typeof a.price.regular === 'string' ? parseFloat(a.price.regular) : a.price.regular
          const priceB = typeof b.price.regular === 'string' ? parseFloat(b.price.regular) : b.price.regular
          return priceA - priceB
        })
        break
      case 'price-high':
        sortedProducts.sort((a, b) => {
          const priceA = typeof a.price.regular === 'string' ? parseFloat(a.price.regular) : a.price.regular
          const priceB = typeof b.price.regular === 'string' ? parseFloat(b.price.regular) : b.price.regular
          return priceB - priceA
        })
        break
      case 'name-az':
        sortedProducts.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'name-za':
        sortedProducts.sort((a, b) => b.title.localeCompare(a.title))
        break
      case 'newest':
        sortedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'popular':
        sortedProducts.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        break
      default:
        sortedProducts = [...baseProducts] // Featured é a ordem original
    }

    setProducts(sortedProducts)
  }

  const handleFilter = (filters: string[]) => {
    if (filters.length === 0) {
      setProducts(baseProducts)
      return
    }

    const filtered = baseProducts.filter(product => {
      return filters.some(filter => {
        // Filtro de marca
        if (filter.includes('-') && !['new-in', 'gift-set'].includes(filter)) {
          const brandRegex = new RegExp(filter.replace(/-/g, '\\s+'), 'i')
          if (product.brands?.some(brand => brandRegex.test(brand))) return true
          if (product.primary_brand && brandRegex.test(product.primary_brand)) return true
          if (product.title && brandRegex.test(product.title)) return true
        }
        
        // Filtro de preço
        if (filter === 'under-50') {
          return parseFloat(product.price.regular.toString()) < 50
        }
        if (filter === '50-100') {
          const price = parseFloat(product.price.regular.toString())
          return price >= 50 && price <= 100
        }
        if (filter === 'over-100') {
          return parseFloat(product.price.regular.toString()) > 100
        }

        // Filtros de gênero
        if (['men', 'women'].includes(filter)) {
          return product.tags.includes(filter)
        }

        // Filtros de coleção
        if (['new-in', 'bestseller', 'gift-set', 'premium', 'offers'].includes(filter)) {
          return product.tags.includes(filter)
        }
        
        return false
      })
    })

    setProducts(filtered)
  }

  return (
    <Layout>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* List Controls */}
      <ListControls 
        resultsCount={products.length}
        onSortChange={handleSort}
        onFilterToggle={handleFilter}
        products={initialProducts}
      />

      {/* Products Grid */}
      <section className="pb-8">
        <div className="container mx-auto">
          {/* Grid de produtos - 2 colunas mobile com altura uniforme */}
          <div className="grid grid-cols-2 gap-2 md:gap-6 auto-rows-fr">
            {products.map((product, index) => (
              <ProductCardTPS 
                key={product.id}
                product={product}
                priority={index < 4} // Priorizar primeiras 4 imagens
              />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}

