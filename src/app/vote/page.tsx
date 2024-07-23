"use client";

import React from 'react';
import NomineeList from '@/components/NomineeList';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedLeaderboard from '@/components/EnhancedLeaderboard';

export default function VoteLeaderboardPage() {
  const { logAnalyticsEvent } = useAnalytics();

  React.useEffect(() => {
    logAnalyticsEvent('vote_leaderboard_page_viewed');
  }, [logAnalyticsEvent]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Vote and Leaderboard</h1>
      <Tabs defaultValue="vote" className="w-full">
        <TabsList>
          <TabsTrigger value="vote">Vote</TabsTrigger>
          <TabsTrigger value="lead">Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="vote">
          <NomineeList />
        </TabsContent>
        <TabsContent value="lead">
          <EnhancedLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}