import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_TEST!, {
  apiVersion: '2025-10-29.clover', // Use a recent API version
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { payment_intent_id } = req.query;

  if (!payment_intent_id || typeof payment_intent_id !== 'string') {
    return res.status(400).json({ error: 'Payment Intent ID is required' });
  }

  try {
    // Retrieve Payment Intent
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    // Parse items from metadata if available
    const itemsSummary = paymentIntent.metadata?.items_summary || '';
    const lineItems = [];
    
    if (itemsSummary) {
      const items = itemsSummary.split(',');
      for (const itemStr of items) {
        const [id, qtyStr] = itemStr.split(':');
        const quantity = parseInt(qtyStr) || 1;
        // Since we have a fixed price strategy now
        const price = 4999; // 49.99 GBP
        
        let productName = 'Unknown Product';
        if (id === 'luxury-perfumes' || id === 'luxury-perfumes-kit' || id === '999') {
          productName = '3 Luxury Perfumes – Exclusive Online Kit';
        } else {
            productName = `Product ${id}`;
        }

        lineItems.push({
          price_id: 'custom_price',
          product_id: id,
          product_name: productName,
          quantity: quantity,
          amount_total: price * quantity,
        });
      }
    } else {
        // Fallback if no items in metadata (should not happen if created via our API)
        lineItems.push({
            price_id: 'custom_price',
            product_name: 'Total Purchase',
            quantity: 1,
            amount_total: paymentIntent.amount,
        });
    }

    // Structure data for Shopify/Frontend
    const orderData = {
      stripe_session_id: paymentIntent.id, // Use PI ID as session ID equivalent
      payment_status: paymentIntent.status === 'succeeded' ? 'paid' : paymentIntent.status,
      amount_total: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer: {
        name: paymentIntent.shipping?.name || '',
        email: paymentIntent.receipt_email || '', // PaymentIntent might not have email if not passed. We rely on Receipt Email or metadata?
        // Note: PaymentElement with AddressElement usually updates shipping details.
        // If email is collected via Link or explicit field, it might be in payment_intent.receipt_email
        // or we need to look at metadata if we saved it there (we didn't).
        // However, AddressElement collects address and name. Email is collected by PaymentElement if configured?
        // Actually, PaymentElement with "link" collects email.
        // If we don't have email, this might be an issue for Shopify order.
        // Let's check if we can get email.
        phone: paymentIntent.shipping?.phone || null,
        address: paymentIntent.shipping?.address || null,
      },
      line_items: lineItems,
      metadata: paymentIntent.metadata || {},
      utm_params: {
        utm_source: paymentIntent.metadata?.utm_source || null,
        utm_medium: paymentIntent.metadata?.utm_medium || null,
        utm_campaign: paymentIntent.metadata?.utm_campaign || null,
        utm_content: paymentIntent.metadata?.utm_content || null,
        utm_term: paymentIntent.metadata?.utm_term || null,
      },
      created: paymentIntent.created,
      payment_intent_id: paymentIntent.id,
    };
    
    // If email is missing in PI, try to find it in latest_charge -> billing_details
    if (!orderData.customer.email && paymentIntent.latest_charge) {
        try {
            const chargeId = typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : paymentIntent.latest_charge.id;
            const charge = await stripe.charges.retrieve(chargeId);
            if (charge.billing_details?.email) {
                orderData.customer.email = charge.billing_details.email;
            } else if (charge.receipt_email) {
                orderData.customer.email = charge.receipt_email;
            }
        } catch (e) {
            console.warn('Could not retrieve charge details for email', e);
        }
    }

    console.log('📊 Payment Intent details retrieved:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      email: orderData.customer.email
    });

    return res.status(200).json({
      success: true,
      data: orderData
    });

  } catch (error: any) {
    console.error('❌ Error retrieving Payment Intent:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve payment intent details',
      message: error.message 
    });
  }
}
