"use client";

import React from 'react';
import NominationForm from '@/components/NominationForm';
import NominationGuidelines from '@/components/NominationGuidelines';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function NominatePage() {
  const { logAnalyticsEvent } = useAnalytics();

  React.useEffect(() => {
    logAnalyticsEvent('nominate_page_viewed');
  }, [logAnalyticsEvent]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Nominate a Trusted Individual</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <NominationForm />
        <NominationGuidelines />
      </div>
    </div>
  );
}