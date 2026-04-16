import axios from 'axios';
import crypto from 'crypto';

export interface TikTokCapiEvent {
  eventName: string;
  eventId: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  clientIp?: string;
  userAgent?: string;
  value?: number;
  currency?: string;
  sourceUrl?: string;
  testEventCode?: string;
}

/**
 * Hash data using SHA256 (required by TikTok)
 */
function sha256(data: string): string {
  if (!data) return '';
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Envvia um evento para a TikTok Business API (CAPI)
 */
export async function sendTikTokCapiEvent(event: TikTokCapiEvent) {
  const pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID_1;
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!pixelId || !accessToken || accessToken === 'seu_token_aqui') {
    // Silently fail or log if not configured
    console.warn('[TikTok CAPI] Pixel ID or Access Token not configured.');
    return;
  }

  // Mapeamento de eventos Meta -> TikTok
  const eventMapping: Record<string, string> = {
    'PageView': 'PageView',
    'ViewContent': 'ViewContent',
    'AddToCart': 'AddToCart',
    'InitiateCheckout': 'InitiateCheckout',
    'Purchase': 'CompletePayment',
    'Search': 'Search',
    'Contact': 'Contact',
  };

  const tiktokEventName = eventMapping[event.eventName] || event.eventName;

  try {
    const payload = {
      pixel_code: pixelId,
      event: tiktokEventName,
      event_id: event.eventId,
      timestamp: new Date().toISOString(),
      context: {
        ad: {
          callback: event.sourceUrl?.includes('ttclid=') 
            ? event.sourceUrl.split('ttclid=')[1]?.split('&')[0] 
            : undefined,
        },
        page: {
          url: event.sourceUrl || '',
          referrer: '',
        },
        user: {
          external_id: event.email ? sha256(event.email) : undefined,
          email: event.email ? sha256(event.email) : undefined,
          phone_number: event.phone ? sha256(event.phone) : undefined,
          ttp: undefined, // TikTok Cookie (_ttp) se disponível
        },
        user_agent: event.userAgent || '',
        ip: event.clientIp || '',
      },
      properties: {
        value: event.value,
        currency: event.currency || 'GBP',
      },
      test_event_code: event.testEventCode || undefined,
    };

    const response = await axios.post(
      `https://business-api.tiktok.com/open_api/v1.3/pixel/track/`,
      payload,
      {
        headers: {
          'Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`[TikTok CAPI] Event '${tiktokEventName}' sent. Status: ${response.data.message}`);
    return response.data;
  } catch (error: any) {
    console.error('[TikTok CAPI] Error sending event:', error.response?.data || error.message);
    throw error;
  }
}
