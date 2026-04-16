import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose, products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'W30011', label: "Shop All Women's" },
    { value: 'SA2001', label: 'Shop All' },
    { value: 'LUX2001', label: 'Luxury Fragrances' },
    { value: 'W30004', label: "Women's Luxury Perfumes" }
  ];

  const generateSuggestions = (term: string) => {
    if (term.length < 2) return [];
    
    const commonPerfumes = [
      'chanel coco mademoiselle',
      'chanel chance',
      'chanel bleu',
      'chanel n°5',
      'dior sauvage',
      'ysl black opium',
      'paco rabanne 1 million'
    ];

    return commonPerfumes
      .filter(name => name.toLowerCase().includes(term.toLowerCase()))
      .slice(0, 4);
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Prevent body scroll when search is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when search is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.length === 0) {
      const featuredProducts = products
        .filter(product => product.featured || product.onSale)
        .slice(0, 6);
      setFilteredProducts(featuredProducts);
      setSuggestions([]);
    } else {
      const results = products.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        const terms = searchLower.split(' ').filter(term => term.length > 0);
        
        return terms.every(term => (
          product.title.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term) ||
          product.brands?.some(brand => brand.toLowerCase().includes(term)) ||
          (product.gender && product.gender.toLowerCase().includes(term))
        ));
      });
      setFilteredProducts(results);
      setSuggestions(generateSuggestions(searchTerm));
    }
  }, [searchTerm, products]);

  if (!isOpen) {
    return null;
  }

  const renderCategories = () => {
    if (!searchTerm.length) return null;
    
    return (
      <div className="py-4 border-b border-gray-200">
        <div className="space-y-2">
          {categories.map(category => (
            <Link
              key={category.value}
              href={`/search/${searchTerm}?category=${category.value}`}
              className="flex items-center text-sm py-1 hover:bg-gray-50"
              onClick={onClose}
              suppressHydrationWarning
            >
              <span className="font-medium text-tps-red">{searchTerm}</span>
              <span className="mx-2">in</span>
              <span className="text-gray-600">{category.label}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const renderSuggestions = () => {
    if (!suggestions.length) return null;

    return (
      <div className="py-4 border-b border-gray-200">
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setSearchTerm(suggestion)}
              className="block w-full text-left text-sm py-1 hover:bg-gray-50"
            >
              {suggestion.split(new RegExp(`(${searchTerm})`, 'i')).map((part, i) => (
                part.toLowerCase() === searchTerm.toLowerCase() ? (
                  <span key={i} className="font-medium text-tps-red">{part}</span>
                ) : (
                  <span key={i}>{part}</span>
                )
              ))}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderProducts = () => {
    if (!filteredProducts.length && !searchTerm.length) return null;

    return (
      <div className="py-4">
        {filteredProducts.length > 0 ? (
          <>
            <h3 className="text-lg font-medium mb-4">
              {searchTerm.length === 0 ? 'Featured Products' : `Results for "${searchTerm}"`}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map(product => (
                <Link 
                  key={product.id} 
                  href={`/products/${product.handle}`}
                  className="block"
                  onClick={onClose}
                  suppressHydrationWarning
                >
                  <div className="relative aspect-square mb-2">
                    <Image
                      src={Array.isArray(product.images) ? product.images[0] : product.images.main[0]}
                      alt={product.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900 uppercase">
                      {product.primary_brand || 'Multi-Brand'}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.title}</p>
                    <p className="text-sm font-medium text-black">
                      £{typeof product.price.regular === 'string' ? parseFloat(product.price.regular).toFixed(2) : product.price.regular.toFixed(2)}
                      <span className="text-gray-500 ml-1">each</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No products found for "{searchTerm}"
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      <div className="border-b border-gray-200 flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <div className="flex-1 flex items-center">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Looking for something specific?"
                className="flex-1 ml-3 text-base outline-none placeholder-gray-400"
              />
            </div>
            <button onClick={onClose} className="p-2">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="container mx-auto px-4 pb-6">
          {renderCategories()}
          {renderSuggestions()}
          {renderProducts()}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;