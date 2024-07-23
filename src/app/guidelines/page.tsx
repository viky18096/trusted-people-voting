"use client";

import React from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CommunityGuidelinesPage() {
  const { logAnalyticsEvent } = useAnalytics();

  React.useEffect(() => {
    logAnalyticsEvent('community_guidelines_viewed');
  }, [logAnalyticsEvent]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Community Guidelines</h1>
      {/* Rest of the component code */}
    </div>
  );
}