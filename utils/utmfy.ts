// Utilitários para integração com Utmfy

// Taxa de conversão fixa de GBP para BRL
const GBP_TO_BRL_RATE = 7.0;

export interface UtmfyConversionData {
  orderId: string;
  platform: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  approvedDate: string;
  customer: {
    name: string;
    email: string;
    phone: string | null;
    document: string | null;
  };
  trackingParameters: {
    utm_campaign: string | null;
    utm_content: string | null;
    utm_medium: string | null;
    utm_source: string | null;
    utm_term: string | null;
    src?: string | null;
    sck?: string | null;
    xcod?: string | null;
  };
  commission: {
    totalPriceInCents: number;
    gatewayFeeInCents: number;
    userCommissionInCents: number;
  };
  products: Array<{
    id: string;
    planId: string;
    planName: string;
    name: string;
    quantity: number;
    priceInCents: number;
  }>;
}

export async function sendConversionToUtmfy(data: UtmfyConversionData): Promise<boolean> {
  try {
    const utmfyWebhookUrl = process.env.UTMIFY_WEBHOOK_URL;
    const utmfyApiKey = process.env.UTMIFY_API_KEY;

    if (!utmfyWebhookUrl) {
      console.warn('UTMIFY_WEBHOOK_URL não configurada. Configure a URL gerada no painel da Utmfy.');
      return false;
    }

    if (!utmfyApiKey) {
      console.warn('UTMIFY_API_KEY não configurada. Configure a chave da API da Utmfy.');
      return false;
    }

    const response = await fetch(utmfyWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PerfumUK-Stripe/1.0',
        'x-api-token': utmfyApiKey,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log('✅ Conversão enviada para Utmfy com sucesso:', data.orderId);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Erro ao enviar conversão para Utmfy:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar dados para Utmfy:', error);
    return false;
  }
}

// Função para formatar dados de conversão do Stripe para Utmfy
export function formatStripeToUtmfy(
  session: any,
  eventType: string = 'purchase'
): UtmfyConversionData {
  const now = new Date().toISOString();

  // Converter valores de GBP para BRL
  const amountTotalGBP = session.amount_total || 0;
  const amountTotalBRL = Math.round(amountTotalGBP * GBP_TO_BRL_RATE);

  return {
    orderId: session.id,
    platform: 'stripe',
    paymentMethod: 'credit_card',
    status: session.payment_status === 'paid' ? 'paid' : 'waiting_payment',
    createdAt: now,
    approvedDate: session.payment_status === 'paid' ? now : now,
    customer: {
      name: session.customer_details?.name || 'Cliente',
      email: session.customer_details?.email || '',
      phone: null,
      document: null,
    },
    trackingParameters: {
      utm_campaign: session.metadata?.utm_campaign || null,
      utm_content: session.metadata?.utm_content || null,
      utm_medium: session.metadata?.utm_medium || null,
      utm_source: session.metadata?.utm_source || null,
      utm_term: session.metadata?.utm_term || null,
      src: session.metadata?.src || null,
      sck: session.metadata?.sck || null,
      xcod: session.metadata?.xcod || null,
    },
    commission: {
      totalPriceInCents: amountTotalBRL,
      gatewayFeeInCents: Math.round(amountTotalBRL * 0.029), // Estimativa de 2.9%
      userCommissionInCents: amountTotalBRL ? amountTotalBRL - Math.round(amountTotalBRL * 0.029) : 0, // Valor atribuído ao produtor/afiliado
    },
    products: [
      {
        id: 'perfume_001',
        planId: 'plan_perfume_001',
        planName: 'Perfume Premium',
        name: 'Perfume',
        quantity: 1,
        priceInCents: amountTotalBRL,
      }
    ],
  };
}