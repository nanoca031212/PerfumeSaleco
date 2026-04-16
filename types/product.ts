export interface Price {
  regular: string | number;
  sale?: string | number;
  on_sale: boolean;
  discount_percent: number;
}

export interface Product {
  id: number;
  handle: string;
  title: string;
  description: string;
  description_html?: string;
  price: Price;
  category: string;
  categories: string[];  // Adicionado
  brand: string;
  brands: string[];  // Agora obrigatório, não opcional
  tags: string[];
  featured: boolean;
  onSale: boolean;
  created_at: string;
  popularity: number;
  images: string[] | ProductImages;
  slug?: string;
  variants?: ProductVariant[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  status?: 'active' | 'draft' | 'archived';
  new_arrival?: boolean;
  bestseller?: boolean;
  is_combo?: boolean;
  sku?: string;
  primary_brand?: string;
  gender?: string;
}

export interface ProductImages {
  main: string[];
  gallery: string[];
  individual_items: {
    url: string;
    item_number: number;
  }[];
}

export interface ProductVariant {
  id: string;
  title: string;
  size: string;
  price: number;
  available: boolean;
  sku: string;
  stock: number;
}

export interface ProductsData {
  products: Product[];
  metadata?: {
    total: number;
    updated_at?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug?: string;
  products_count?: number;
}

export interface Brand {
  name: string;
  count: number;
  slug?: string;
}

export interface SearchFilters {
  category?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
  tags?: string[];
  featured?: boolean;
  onSale?: boolean;
  gender?: string;  // Adicionado
}