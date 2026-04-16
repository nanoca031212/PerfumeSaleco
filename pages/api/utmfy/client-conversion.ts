import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const conversionData = req.body;
    
    const utmfyWebhookUrl = process.env.UTMIFY_WEBHOOK_URL;
    const utmfyApiKey = process.env.UTMIFY_API_KEY;
    
    if (!utmfyWebhookUrl) {
      console.warn('UTMFY_WEBHOOK_URL não configurada');
      return res.status(500).json({ error: 'UTMify webhook URL not configured' });
    }

    if (!utmfyApiKey) {
      console.warn('UTMFY_API_KEY não configurada');
      return res.status(500).json({ error: 'UTMify API key not configured' });
    }

    console.log('📤 Enviando conversão para UTMify via client-side API:', {
      orderId: conversionData.orderId,
      platform: conversionData.platform,
      totalValue: conversionData.commission?.totalPriceInCents,
      utms: conversionData.trackingParameters
    });

    const response = await fetch(utmfyWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PerfumUK-Stripe-Client/1.0',
        'x-api-token': utmfyApiKey,
      },
      body: JSON.stringify(conversionData),
    });

    if (response.ok) {
      const result = await response.text();
      console.log('✅ Conversão enviada para UTMify com sucesso (client-side):', conversionData.orderId);
      return res.status(200).json({ 
        success: true, 
        orderId: conversionData.orderId,
        response: result 
      });
    } else {
      const errorText = await response.text();
      console.error('❌ Erro ao enviar conversão para UTMify (client-side):', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'UTMify API error', 
        status: response.status, 
        message: errorText 
      });
    }
  } catch (error: any) {
    console.error('❌ Erro ao processar conversão UTMify (client-side):', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}