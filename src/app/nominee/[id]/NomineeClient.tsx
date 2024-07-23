'use client';

import React from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { NomineeData } from '@/lib/getNominee';

export default function NomineeClient({ nominee }: { nominee: NomineeData }) {
  const { logAnalyticsEvent } = useAnalytics();

  React.useEffect(() => {
    logAnalyticsEvent('nominee_page_viewed', { nomineeId: nominee.id });
  }, [nominee.id, logAnalyticsEvent]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={nominee.photoURL} alt={nominee.name} />
            <AvatarFallback>{nominee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{nominee.name}</h1>
            <p className="text-gray-500">{nominee.collegeName}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{nominee.description}</p>
        <p className="mb-4">Location: {nominee.location}</p>
        <p className="mb-4">Votes: {nominee.votes}</p>
        <Button onClick={() => {/* Implement voting logic */}}>Vote</Button>
      </CardContent>
    </Card>
  );
}