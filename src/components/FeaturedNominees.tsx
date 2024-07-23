import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAnalytics } from '../hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SocialShare from './SocialShare';

interface Nominee {
  id: string;
  name: string;
  collegeName: string;
  votes: number;
  photoURL: string;
  featured: boolean;
}

const FeaturedNominees: React.FC = () => {
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logAnalyticsEvent } = useAnalytics();

  useEffect(() => {
    const fetchFeaturedNominees = async () => {
      try {
        const featuredQuery = query(
          collection(db, 'nominees'),
          where('featured', '==', true),
          orderBy('votes', 'desc'),
          limit(3)
        );
        const querySnapshot = await getDocs(featuredQuery);
        const featuredNominees: Nominee[] = [];
        querySnapshot.forEach((doc) => {
          featuredNominees.push({ id: doc.id, ...doc.data() } as Nominee);
        });
        setNominees(featuredNominees);
        setLoading(false);
        logAnalyticsEvent('featured_nominees_viewed');
      } catch (error) {
        console.error('Error fetching featured nominees:', error);
        setError('Error fetching featured nominees. Please try again later.');
        setLoading(false);
      }
    };

    fetchFeaturedNominees();
  }, [logAnalyticsEvent]);

  if (loading) {
    return <div>Loading featured nominees...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Featured Nominees</h2>
        <Link href="/nominees">
          <Button variant="outline">See All Nominees</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nominees.map((nominee) => {
          const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/nominee/${nominee.id}` : '';
          const shareTitle = `Check out ${nominee.name}, a featured nominee on Trusted People Voting System!`;

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
                <p>College: {nominee.collegeName}</p>
                <p>Votes: {nominee.votes}</p>
                <div className="flex justify-between items-center mt-4">
                  <Link href={`/nominee/${nominee.id}`}>
                    <Button variant="outline">View Profile</Button>
                  </Link>
                  <SocialShare url={shareUrl} title={shareTitle} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedNominees;