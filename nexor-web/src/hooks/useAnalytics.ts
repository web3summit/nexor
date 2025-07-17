import { useCallback } from 'react';

type AnalyticsProperty = string | number | boolean | null | undefined;
type AnalyticsProperties = Record<string, AnalyticsProperty | AnalyticsProperty[] | Record<string, AnalyticsProperty>>;

declare global {
  interface Window {
    analytics?: {
      track: (eventName: string, properties: AnalyticsProperties) => void;
      page: (properties: AnalyticsProperties) => void;
    };
  }
}

const analyticsClient = {
  track: (eventName: string, properties: AnalyticsProperties) => {
    // TODO: Implement analytics tracking
    console.log(`[Analytics] Track event: ${eventName}`, properties);
  },
  page: (properties: AnalyticsProperties) => {
    // TODO: Implement page view tracking
    console.log(`[Analytics] Page view: ${window.location.pathname}`, properties);
  }
};

window.analytics = analyticsClient;

export type EventType = 
  | 'widget_opened'
  | 'widget_closed'
  | 'wallet_connected'
  | 'wallet_disconnected'
  | 'token_selected'
  | 'payment_created'
  | 'payment_confirmed'
  | 'payment_completed'
  | 'payment_failed'
  | 'invoice_created'
  | 'invoice_paid'
  | 'token_swap_initiated'
  | 'token_swap_completed';

export interface AnalyticsEvent {
  eventType: EventType;
  timestamp: number;
  merchantId?: string;
  paymentId?: string;
  invoiceId?: string;
  tokenSymbol?: string;
  amount?: string;
  amountUsd?: string;
  walletType?: string;
  chain?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface UseAnalyticsResult {
  trackEvent: (event: Omit<AnalyticsEvent, 'timestamp'>) => void;
  trackPageView: (page: string, metadata?: Record<string, any>) => void;
}

export function useAnalytics(merchantId?: string): UseAnalyticsResult {
  // Track an event
  const trackEvent = useCallback((eventData: Omit<AnalyticsEvent, 'timestamp'>) => {
    const event: AnalyticsEvent = {
      ...eventData,
      merchantId: eventData.merchantId || merchantId,
      timestamp: Date.now(),
    };

    // In a real implementation, we would send this to an analytics service
    // For now, we'll just log it to the console
    console.log('[Analytics]', event.eventType, event);

    try {
      // Send event to backend (mock implementation)
      setTimeout(() => {
        // This would be an API call in a real implementation
      }, 0);
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  }, [merchantId]);

  // Track a page view
  const trackPageView = useCallback((page: string, metadata?: Record<string, any>) => {
    trackEvent({
      eventType: 'widget_opened',
      metadata: {
        page,
        ...metadata,
      },
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
  };
}
