interface Window {
  fbq: (
    eventType: 'init' | 'track' | 'trackCustom',
    eventName: string,
    params?: {
      content_type?: string;
      content_ids?: string[];
      content_name?: string;
      content_category?: string;
      contents?: Array<{
        id: string;
        quantity: number;
      }>;
      num_items?: number;
      value?: number;
      currency?: string;
    },
    options?: {
      eventID?: string;
    }
  ) => void;
  _fbq: any;
}

declare const fbq: Window['fbq'];
