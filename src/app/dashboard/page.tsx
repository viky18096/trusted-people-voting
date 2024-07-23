"use client";

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useAnalytics } from '@/hooks/useAnalytics';
import UserProfile from '@/components/UserProfile';
import UserActivity from '@/components/UserActivity';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UserDashboardPage() {
  const [user] = useAuthState(auth);
  const { logAnalyticsEvent } = useAnalytics();

  React.useEffect(() => {
    logAnalyticsEvent('user_dashboard_page_viewed');
  }, [logAnalyticsEvent]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">User Dashboard</h1>
        <p className="mb-4">Please sign in to view your dashboard.</p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <UserProfile />
        </div>
        <div className="md:col-span-2">
          <UserActivity />
        </div>
      </div>
    </div>
  );
}