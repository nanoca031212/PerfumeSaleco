import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../lib/stripe';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const products = await stripe.products.list({
        active: true,
        expand: ['data.default_price'],
      });
      
      return res.status(200).json(products.data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, description, images, metadata, price, currency = 'gbp' } = req.body;
      
      // Primeiro cria o produto
      const product = await stripe.products.create({
        name,
        description,
        images,
        metadata,
      });
      
      // Depois cria o preço associado ao produto
      const priceObj = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(price * 100), // Stripe trabalha com centavos
        currency,
      });
      
      return res.status(201).json({ product, price: priceObj });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}