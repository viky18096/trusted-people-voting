"use client"

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useAnalytics } from '@/hooks/useAnalytics';
import EnhancedLeaderboard from '@/components/EnhancedLeaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const LeaderboardPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const { logAnalyticsEvent } = useAnalytics();

  React.useEffect(() => {
    logAnalyticsEvent('page_view', { page_name: 'leaderboard' });
  }, [logAnalyticsEvent]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Trusted People Leaderboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedLeaderboard />
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default LeaderboardPage;