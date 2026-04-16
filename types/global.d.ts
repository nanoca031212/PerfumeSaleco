interface Window {
  fbq: (
    type: string,
    eventName: string,
    params?: Record<string, any>
  ) => void;
  _fbq: any;
}

