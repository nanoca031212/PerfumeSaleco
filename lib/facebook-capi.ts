
const FB_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID_1;

export interface CapiEventData {
  eventName: string;
  eventId: string; // Critical for deduplication
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  clientIp?: string;
  userAgent?: string;
  externalId?: string;
  fbp?: string;
  fbc?: string;
  value?: number;
  currency?: string;
  sourceUrl?: string;
  contentIds?: string[];
  contentType?: string;
}

/**
 * Sends an event to Facebook Conversions API
 */
export async function sendCapiEvent(data: CapiEventData) {
  if (!FB_ACCESS_TOKEN || !FB_PIXEL_ID) {
    console.warn('⚠️ Facebook CAPI: Credentials missing (FACEBOOK_ACCESS_TOKEN or NEXT_PUBLIC_FACEBOOK_PIXEL_ID_1)');
    return;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  // Hash user data (SHA-256) is required by FB if sending raw data, 
  // but if we trust the environment/transport we can send plain text 
  // and let FB handle it or hash it ourselves. 
  // For simplicity and security best practices, we should hash PII.
  // However, implementing SHA256 in a simple helper without crypto lib might be verbose.
  // Since we are running in Node.js (Next.js API routes), we can use 'crypto'.
  
  const userData: any = {
    client_ip_address: data.clientIp,
    client_user_agent: data.userAgent,
    external_id: data.externalId ? hash(data.externalId) : undefined,
    fbp: data.fbp,
    fbc: data.fbc,
  };

  if (data.email) userData.em = hash(data.email);
  if (data.phone) userData.ph = hash(data.phone);
  if (data.firstName) userData.fn = hash(data.firstName);
  if (data.lastName) userData.ln = hash(data.lastName);

  const payload = {
    data: [
      {
        event_name: data.eventName,
        event_time: currentTimestamp,
        event_id: data.eventId,
        event_source_url: data.sourceUrl,
        action_source: 'website',
        user_data: userData,
        custom_data: {
          currency: data.currency,
          value: data.value,
          content_ids: data.contentIds,
          content_type: data.contentType,
        },
      },
    ],
    test_event_code: process.env.FACEBOOK_TEST_EVENT_CODE, // Optional: for testing in Events Manager
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Facebook CAPI Error:', JSON.stringify(error, null, 2));
    } else {
      console.log(`✅ Facebook CAPI Event '${data.eventName}' sent successfully (Event ID: ${data.eventId})`);
    }
  } catch (error) {
    console.error('❌ Facebook CAPI Network Error:', error);
  }
}

import crypto from 'crypto';

function hash(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}
