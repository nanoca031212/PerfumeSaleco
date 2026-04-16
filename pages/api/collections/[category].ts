import { NextApiRequest, NextApiResponse } from 'next';
import { getProductsByCategory, getAllProducts } from '@/lib/products';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { category } = req.query;
    const { limit = '20', offset = '0' } = req.query;

    if (!category || typeof category !== 'string') {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Categoria especial "all"
    let products = category === 'all' 
      ? getAllProducts() 
      : getProductsByCategory(category);

    // Paginação
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    const total = products.length;
    
    products = products.slice(offsetNum, offsetNum + limitNum);

    res.status(200).json({
      collection: {
        name: category === 'all' ? 'All Products' : category,
        slug: category,
        products_count: total
      },
      products,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        pages: Math.ceil(total / limitNum),
        current_page: Math.floor(offsetNum / limitNum) + 1
      }
    });

  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
