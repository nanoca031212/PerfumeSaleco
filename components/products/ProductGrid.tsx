import React from 'react';
import { Product } from '../../types/product';
import ProductCardTPS from './ProductCardTPS';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCardTPS 
          key={product.id} 
          product={product}
          priority={index < 4} // Otimiza carregamento das primeiras 4 imagens
        />
      ))}
    </div>
  );
};

export default ProductGrid;