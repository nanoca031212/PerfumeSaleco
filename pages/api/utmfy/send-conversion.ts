import { NextApiRequest, NextApiResponse } from 'next';
import { formatStripeToUtmfy, sendConversionToUtmfy } from '@/utils/utmfy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, sessionData } = req.body;
    
    if (!sessionId || !sessionData) {
      return res.status(400).json({ error: 'Missing sessionId or sessionData' });
    }

    console.log('📤 Processando conversão UTMfy para sessão:', sessionId);
    
    // Criar objeto de sessão no formato esperado pela função formatStripeToUtmfy
    const stripeSession = {
      id: sessionData.stripe_session_id || sessionId,
      payment_status: sessionData.payment_status,
      amount_total: sessionData.amount_total,
      currency: sessionData.currency,
      customer_details: {
        name: sessionData.customer?.name || 'Cliente',
        email: sessionData.customer?.email || '',
        phone: sessionData.customer?.phone || null
      },
      metadata: {
        utm_campaign: sessionData.utm_params?.utm_campaign || null,
        utm_content: sessionData.utm_params?.utm_content || null,
        utm_medium: sessionData.utm_params?.utm_medium || null,
        utm_source: sessionData.utm_params?.utm_source || null,
        utm_term: sessionData.utm_params?.utm_term || null,
      }
    };
    
    // Formatar dados do Stripe para o formato UTMfy
    const utmfyData = formatStripeToUtmfy(stripeSession);
    
    console.log('📊 Dados formatados para UTMfy:', {
      orderId: utmfyData.orderId,
      platform: utmfyData.platform,
      status: utmfyData.status,
      totalPriceInCents: utmfyData.commission.totalPriceInCents,
      customer: utmfyData.customer,
      trackingParameters: utmfyData.trackingParameters,
      products: utmfyData.products
    });
    
    // Enviar para UTMfy
    const success = await sendConversionToUtmfy(utmfyData);
    
    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Conversão enviada para UTMfy com sucesso',
        orderId: utmfyData.orderId,
        utmParams: utmfyData.trackingParameters
      });
    } else {
      return res.status(500).json({ 
        error: 'Falha ao enviar conversão para UTMfy',
        orderId: utmfyData.orderId
      });
    }
  } catch (error: any) {
    console.error('❌ Erro ao processar conversão UTMfy:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}