import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { stripe } from '../../../lib/stripe';

// Desabilita o parser de corpo padrão do Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const isTestMode = process.env.NODE_ENV === 'development' || !webhookSecret;

  if (!webhookSecret && !isTestMode) {
    return res.status(500).json({ error: 'Webhook secret não configurado' });
  }

  let event: Stripe.Event;

  try {
    // Tenta construir o evento do Stripe (padrão)
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } else {
      // Fallback para desenvolvimento local sem CLI
      console.log('⚠️ Processando sem assinatura (Webhook Secret ausente)');
      event = JSON.parse(buf.toString());
    }
  } catch (err: any) {
    if (isTestMode) {
      console.log('🧪 Falha na assinatura repassada, forçando JSON manual pelo Test Mode local');
      event = JSON.parse(buf.toString());
    } else {
      console.error(`Erro na assinatura do webhook: ${err.message}`);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
  }

  // Processa os eventos
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;

        // Aqui você pode atualizar seu banco de dados, enviar emails, etc.
        console.log('Payment Succeeded:', session);

        // Enviar conversão para UTMify via server-side
        try {
          const { formatStripeToUtmfy, sendConversionToUtmfy } = await import('@/utils/utmfy');
          const utmfyData = formatStripeToUtmfy(session);
          const utmfySuccess = await sendConversionToUtmfy(utmfyData);

          if (utmfySuccess) {
            console.log('✅ Conversão enviada para UTMify com sucesso (server-side):', session.id);
          } else {
            console.warn('⚠️ Falha ao enviar conversão para UTMify (server-side):', session.id);
          }
        } catch (error) {
          console.error('❌ Erro ao processar UTMify (server-side):', error);
        }

        // Enviar conversão para Facebook CAPI (Redundância + Deduplicação)
        try {
          const { sendCapiEvent } = await import('@/lib/facebook-capi');

          // Extrair dados do cliente
          const customerEmail = session.customer_details?.email || session.customer_email || undefined;
          const customerName = session.customer_details?.name || undefined;
          const customerPhone = session.customer_details?.phone || undefined;

          let firstName = undefined;
          let lastName = undefined;

          if (customerName) {
            const parts = customerName.split(' ');
            firstName = parts[0];
            lastName = parts.length > 1 ? parts.slice(1).join(' ') : undefined;
          }

          // Extrair IDs dos produtos (se disponíveis na sessão ou metadata)
          // Nota: Session objects nem sempre têm line_items expandidos no webhook, 
          // a menos que expandidos explicitamente. Mas podemos tentar usar metadata.
          // Para simplificar, usamos um ID genérico se não tivermos os itens, ou buscamos via API se crítico.
          // Aqui usamos o ID da sessão como EventID para deduplicação com o Client-Side.

          // Extrair metadados de rastreamento (FBP, FBC, IP, UA)
          const fbp = session.metadata?.fbp;
          const fbc = session.metadata?.fbc;
          const userAgent = session.metadata?.user_agent;
          const clientIp = session.metadata?.client_ip;

          await sendCapiEvent({
            eventName: 'Purchase',
            eventId: session.id, // Chave de deduplicação
            email: customerEmail,
            phone: customerPhone,
            firstName: firstName,
            lastName: lastName,
            fbp,
            fbc,
            userAgent,
            clientIp,
            externalId: session.id,
            value: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase() || 'GBP',
            sourceUrl: session.success_url || 'https://theperfumeuk.shop',
          });
        } catch (error) {
          console.error('❌ Erro ao processar Facebook CAPI:', error);
        }

        console.log('✅ Checkout session completed - client-side tracking ativo');

        // Exemplo: Atualizar status do pedido no banco de dados
        // await updateOrderStatus(session.metadata.orderId, 'paid');

        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent bem-sucedido:', paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('PaymentIntent failed:', failedPaymentIntent);
        break;

      // Adicione outros eventos conforme necessário

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}