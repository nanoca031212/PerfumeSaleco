import { NextApiRequest, NextApiResponse } from 'next';
import { getCategories, getBrands } from '@/lib/products';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const categories = getCategories();
    const brands = getBrands();

    res.status(200).json({
      categories,
      brands,
      metadata: {
        total_categories: categories.length,
        total_brands: brands.length,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
