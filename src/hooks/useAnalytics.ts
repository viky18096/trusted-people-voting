// src/hooks/useAnalytics.ts
"use client"

import { useEffect, useState } from 'react';
import { analytics } from '../lib/firebase';
import { Analytics, logEvent } from 'firebase/analytics';

export const useAnalytics = () => {
  const [analyticsInstance, setAnalyticsInstance] = useState<Analytics | null>(null);

  useEffect(() => {
    analytics.then(setAnalyticsInstance);
  }, []);

  const logAnalyticsEvent = (eventName: string, eventParams?: { [key: string]: any }) => {
    if (analyticsInstance) {
      logEvent(analyticsInstance, eventName, eventParams);
    }
  };

  return { logAnalyticsEvent };
};