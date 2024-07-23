"use client"

import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAnalytics } from '../hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Vote {
  id: string;
  nomineeName: string;
  timestamp: Date;
}

interface Nomination {
  id: string;
  name: string;
  votes: number;
}

const UserActivity: React.FC = () => {
  const [user] = useAuthState(auth);
  const { logAnalyticsEvent } = useAnalytics();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!user) return;

      try {
        const votesQuery = query(collection(db, 'votes'), where('userId', '==', user.uid));
        const votesSnapshot = await getDocs(votesQuery);
        const votesData = votesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        })) as Vote[];
        setVotes(votesData);

        const nominationsQuery = query(collection(db, 'nominees'), where('nominatedBy', '==', user.uid));
        const nominationsSnapshot = await getDocs(nominationsQuery);
        const nominationsData = nominationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Nomination[];
        setNominations(nominationsData);

        setLoading(false);
        logAnalyticsEvent('user_activity_viewed');
      } catch (error) {
        console.error('Error fetching user activity:', error);
        logAnalyticsEvent('user_activity_error', { error: (error as Error).message });
      }
    };

    fetchUserActivity();
  }, [user, logAnalyticsEvent]);

  if (loading) return <div>Loading activity...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Votes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nominee</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {votes.map((vote) => (
                <TableRow key={vote.id}>
                  <TableCell>{vote.nomineeName}</TableCell>
                  <TableCell>{vote.timestamp.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Nominations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nominee</TableHead>
                <TableHead>Votes Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nominations.map((nomination) => (
                <TableRow key={nomination.id}>
                  <TableCell>{nomination.name}</TableCell>
                  <TableCell>{nomination.votes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserActivity;