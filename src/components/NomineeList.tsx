"use client"

import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, runTransaction, getDoc, setDoc } from 'firebase/firestore';
import { useAnalytics } from '../hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SocialShare from './SocialShare';

interface Nominee {
  id: string;
  name: string;
  description: string;
  collegeName: string;
  votes: number;
  photoURL: string;
}

const NomineeList: React.FC = () => {
  const [user] = useAuthState(auth);
  const { logAnalyticsEvent } = useAnalytics();
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'nominees'), orderBy('votes', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const nomineeData: Nominee[] = [];
        querySnapshot.forEach((doc) => {
          nomineeData.push({ id: doc.id, ...doc.data() } as Nominee);
        });
        setNominees(nomineeData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching nominees:', error);
        setError('Error fetching nominees. Please try again later.');
        setLoading(false);
      }
    );

    // Fetch user's vote
    if (user) {
      const userVoteRef = doc(db, 'userVotes', user.uid);
      const unsubscribeUserVote = onSnapshot(userVoteRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          setUserVote(docSnapshot.data().votedFor);
        } else {
          setUserVote(null);
        }
      });

      return () => {
        unsubscribe();
        unsubscribeUserVote();
      };
    }

    return () => unsubscribe();
  }, [user]);

  const handleVote = async (nomineeId: string) => {
    if (!user) return;

    try {
      await runTransaction(db, async (transaction) => {
        const nomineeRef = doc(db, 'nominees', nomineeId);
        const userVoteRef = doc(db, 'userVotes', user.uid);

        const nomineeDoc = await transaction.get(nomineeRef);
        const userVoteDoc = await transaction.get(userVoteRef);

        if (!nomineeDoc.exists()) {
          throw "Nominee doesn't exist";
        }

        const currentVotes = nomineeDoc.data().votes;

        if (userVoteDoc.exists() && userVoteDoc.data().votedFor === nomineeId) {
          // User is removing their vote
          transaction.update(nomineeRef, { votes: currentVotes - 1 });
          transaction.delete(userVoteRef);
          setUserVote(null);
        } else {
          // User is voting for this nominee
          if (userVoteDoc.exists()) {
            // Remove vote from previously voted nominee
            const previousNomineeRef = doc(db, 'nominees', userVoteDoc.data().votedFor);
            const previousNomineeDoc = await transaction.get(previousNomineeRef);
            if (previousNomineeDoc.exists()) {
              transaction.update(previousNomineeRef, { votes: previousNomineeDoc.data().votes - 1 });
            }
          }
          transaction.update(nomineeRef, { votes: currentVotes + 1 });
          transaction.set(userVoteRef, { votedFor: nomineeId });
          setUserVote(nomineeId);
        }
      });

      logAnalyticsEvent('vote_cast', { nomineeId });
    } catch (error) {
      console.error('Error casting vote:', error);
      alert(error);
    }
  };

  if (loading) return <div>Loading nominees...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nominees.map((nominee) => {
        const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/nominee/${nominee.id}` : '';
        const shareTitle = `Check out ${nominee.name} on Trusted People Voting System!`;
        const isVotedFor = userVote === nominee.id;

        return (
          <Card key={nominee.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src={nominee.photoURL} alt={nominee.name} />
                  <AvatarFallback>{nominee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{nominee.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{nominee.description}</p>
              <p className="mb-2">College: {nominee.collegeName}</p>
              <p className="mb-4">Votes: {nominee.votes}</p>
              <div className="flex justify-between items-center">
                <Button 
                  onClick={() => handleVote(nominee.id)}
                  variant={isVotedFor ? "destructive" : "default"}
                >
                  {isVotedFor ? 'Remove Vote' : 'Vote'}
                </Button>
                <SocialShare url={shareUrl} title={shareTitle} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default NomineeList;