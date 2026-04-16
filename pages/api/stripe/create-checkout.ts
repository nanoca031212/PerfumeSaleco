import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '@/lib/stripe';

interface CartItem {
  stripeId?: string;
  quantity: number;
  title: string;
  image: string;
  price: number;
  handle: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, utmParams, customerEmail }: { items: CartItem[], utmParams?: any, customerEmail?: string } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items são obrigatórios' });
    }

    const origin = req.headers.origin || 'https://theperfumeuk.shop';

    // Extrair dados do cliente para rastreamento (Facebook CAPI)
    const fbp = req.cookies._fbp || '';
    const fbc = req.cookies._fbc || '';
    const userAgent = req.headers['user-agent'] || '';
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '';

    // Criar linha de itens para o Stripe usando price_data
    const lineItems = items.map(item => {
      // Validar preço - Forçar 49.99 para todos os itens conforme regra de negócio (rollback)
      const price = 49.99;
      // const price = Number(item.price);
      // if (isNaN(price) || price <= 0) {
      //   console.warn(`Preço inválido para o item ${item.title}: ${item.price}. Usando fallback 49.99`);
      // }
      const finalPrice = 49.99;

      // Extrair número do set do handle
      let setName = 'Set';
      const match = item.handle.match(/set-(\d+)/i);
      if (match && match[1]) {
        setName = `Set-${match[1]}`;
      } else {
        // Fallback para tentar extrair qualquer número do final
        const numMatch = item.handle.match(/(\d+)$/);
        if (numMatch) {
          setName = `Set-${numMatch[1]}`;
        }
      }

      return {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: setName,
            metadata: {
              handle: item.handle,
              originalStripeId: item.stripeId || ''
            }
          },
          unit_amount: Math.round(finalPrice * 100), // Converter para centavos
        },
        quantity: item.quantity
      };
    });

    // Criar sessão de checkout
    // @ts-ignore - automatic_payment_methods existe na API mas o TS pode estar desatualizado
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      ui_mode: 'embedded',
      customer_email: customerEmail && customerEmail.trim() !== '' ? customerEmail : undefined, // Pre-fill email se fornecido
      return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      shipping_address_collection: {
        allowed_countries: ['GB'],
      },
      payment_method_types: ['card'],
      metadata: {
        utm_campaign: utmParams?.utm_campaign || '',
        utm_source: utmParams?.utm_source || '',
        utm_medium: utmParams?.utm_medium || '',
        utm_content: utmParams?.utm_content || '',
        utm_term: utmParams?.utm_term || '',
        src: utmParams?.src || '',
        sck: utmParams?.sck || '',
        xcod: utmParams?.xcod || '',
        fbp,
        fbc,
        user_agent: userAgent.substring(0, 500), // Stripe tem limite de 500 chars
        client_ip: clientIp
      }
    } as any);

    return res.status(200).json({ clientSecret: session.client_secret });

  } catch (error) {
    console.error('❌ Erro:', error);
    return res.status(500).json({
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
