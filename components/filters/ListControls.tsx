import { useState, useEffect } from 'react'
import { ChevronDown, SlidersHorizontal, Grid3X3 } from 'lucide-react'
import { Product } from '@/types/product'
import { useSessionFilters } from '@/hooks/useSessionFilters'

interface ListControlsProps {
  resultsCount?: number
  currentPage?: number
  totalPages?: number
  onSortChange?: (sortBy: string) => void
  onFilterToggle?: (filters: string[]) => void
  className?: string
  products: Product[]
}

export default function ListControls({ 
  resultsCount = 1130,
  currentPage = 1,
  totalPages = 32,
  onSortChange,
  onFilterToggle,
  className = '',
  products
}: ListControlsProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  
  // Usar filtros baseados em sessão UTM
  const { 
    sessionFilters, 
    updateSort, 
    updateFilters, 
    updateCollections,
    clearFilters,
    isLoaded 
  } = useSessionFilters()
  
  const currentSort = sessionFilters.sort
  const activeFilters = sessionFilters.activeFilters

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-az', label: 'Name: A to Z' },
    { value: 'name-za', label: 'Name: Z to A' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' }
  ]

  // Função para extrair marcas únicas dos produtos
  const extractBrands = () => {
    const brandsSet = new Set<string>();
    
    if (!products) return [];
    
    products.forEach(product => {
      // Adiciona marcas do array brands
      if (product.brands) {
        product.brands.forEach(brand => {
          if (brand !== 'Multi-Brand') brandsSet.add(brand);
        });
      }
      
      // Adiciona primary_brand se existir e não estiver no set
      if (product.primary_brand && product.primary_brand !== 'Multi-Brand') {
        brandsSet.add(product.primary_brand);
      }
      
      // Procura por marcas no título usando regex
      const titleBrands = product.title.match(/(?:by\s+)?([A-Z][A-Za-z\s&]+?)(?:\s+(?:&|and|e)\s+|$|\s*,)/g);
      if (titleBrands) {
        titleBrands.forEach(brand => {
          const cleanBrand = brand.replace(/^by\s+|,\s*$/g, '').trim();
          if (cleanBrand && cleanBrand !== 'Multi-Brand') {
            brandsSet.add(cleanBrand);
          }
        });
      }
    });

    return Array.from(brandsSet).sort();
  };

  // Função para detectar o gênero do produto
  const detectGender = (product: Product): string | null => {
    const tags = product.tags;
    
    // Verifica tags específicas de gênero
    if (tags.includes('men') || tags.includes('masculine') || tags.includes('him')) {
      return 'men';
    }
    if (tags.includes('women') || tags.includes('feminine') || tags.includes('her')) {
      return 'women';
    }
    
    // Se não encontrar tags específicas, verifica o título
    const titleLower = product.title.toLowerCase();
    if (titleLower.includes('men') || titleLower.includes('masculino') || titleLower.includes('homme')) {
      return 'men';
    }
    if (titleLower.includes('women') || titleLower.includes('feminino') || titleLower.includes('femme')) {
      return 'women';
    }
    
    // Se não encontrar, retorna null para não mostrar no filtro
    return null;
  };

  const filterOptions = {
    'Gender': [
      { value: 'men', label: 'Men' },
      { value: 'women', label: 'Women' }
    ],
    'Collections': [
      { value: 'new-in', label: 'New In' },
      { value: 'bestseller', label: 'Bestsellers' },
      { value: 'gift-set', label: 'Gift Sets' },
      { value: 'premium', label: 'Premium' },
      { value: 'offers', label: 'Special Offers' }
    ],
    'Brand': extractBrands().map(brand => ({
      value: brand.toLowerCase().replace(/\s+/g, '-'),
      label: brand
    })),
    'Price': [
      { value: 'under-50', label: 'Under £50' },
      { value: '50-100', label: '£50 - £100' },
      { value: 'over-100', label: 'Over £100' }
    ],
    'Size': [
      { value: '30ml', label: '30ML' },
      { value: '50ml', label: '50ML' },
      { value: '100ml', label: '100ML' }
    ]
  }

  const handleSortChange = (value: string) => {
    updateSort(value)
    setShowSortDropdown(false)
    onSortChange?.(value)
  }

  const handleFilterChange = (value: string) => {
    let newFilters: string[]
    
    if (activeFilters.includes(value)) {
      newFilters = activeFilters.filter(f => f !== value)
    } else {
      // Handle gender exclusivity
      if (value === 'men' || value === 'women') {
        newFilters = activeFilters.filter(f => f !== 'men' && f !== 'women')
        newFilters.push(value)
      } else {
        newFilters = [...activeFilters, value]
      }
    }
    
    updateFilters(newFilters)
    onFilterToggle?.(newFilters)
  }

  return (
    <div className={`bg-gray-chip pt-2 ${className}`}>
      <div className="container mx-auto">
        
        {/* Controls Row */}
        <div className="flex items-center justify-center mb-4">
          
          {/* Sort By */}
          <div className="relative">
            <button
              className="flex items-center justify-between bg-gray-chip px-4 py-3 text-sm font-medium text-black min-w-[120px]
                       hover:bg-gray-200 transition-colors"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              <span>SORT BY</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>

            {/* Sort Dropdown */}
            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg z-50 min-w-[200px]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 
                             font-medium text-gray-900 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSortChange(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              className="flex items-center justify-between bg-gray-chip px-4 py-3 text-sm font-medium text-black min-w-[120px]
                       hover:bg-gray-200 transition-colors"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <span>FILTER {activeFilters.length > 0 && `(${activeFilters.length})`}</span>
              <SlidersHorizontal className="ml-2 h-4 w-4" />
            </button>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg z-50 min-w-[210px]">
                {Object.entries(filterOptions).map(([category, options]) => (
                  <div key={category} className="border-b border-gray-100 last:border-b-0">
                    <div className="px-4 py-2 bg-gray-50 font-medium text-sm text-gray-700">
                      {category}
                    </div>
                    <div className="p-2">
                      {options.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center px-2 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={activeFilters.includes(option.value)}
                            onChange={() => handleFilterChange(option.value)}
                            className="h-4 w-4 text-tps-green border-gray-300 rounded focus:ring-tps-green"
                          />
                          <span className="ml-3 text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Apply/Clear Buttons */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between">
                  <button
                    onClick={() => {
                      clearFilters()
                      onFilterToggle?.([])
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => setShowFilterDropdown(false)}
                    className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900"
                  >
                    Apply filters
                  </button>
                </div>
              </div>
            )}
                  </div>
        </div>

      
      </div>

      {/* Mobile: Sticky background overlay when dropdowns are open */}
      {(showSortDropdown || showFilterDropdown) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => {
            setShowSortDropdown(false)
            setShowFilterDropdown(false)
          }}
        />
      )}
    </div>
  )
}
