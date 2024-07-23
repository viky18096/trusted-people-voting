"use client"

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { useAnalytics } from '../hooks/useAnalytics';
import UserProfile from '../components/UserProfile';
import NomineeList from '../components/NomineeList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const Home = () => {
  const [user] = useAuthState(auth);
  const { logAnalyticsEvent } = useAnalytics();
  const [topNominees, setTopNominees] = React.useState([]);

  React.useEffect(() => {
    logAnalyticsEvent('page_view', { page_name: 'home' });
  
  }, [logAnalyticsEvent]);



  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4 text-center">Advocates for Happy Life</h1>
      <p className="text-center text-xl mb-2 font-semibold">Your Voice, Our Future: Empowering Campus Change-Makers</p>

      
      {user ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <UserProfile />
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Take Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/nominate">
                  <Button className="w-full">Nominate a College Advocate</Button>
                </Link>
                <Link href="/vote">
                  <Button className="w-full">Cast Your Vote</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We aim to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Advocate for better transportation systems</li>
                  <li>Ensure citizen concerns are heard</li>
                  <li>Promote fair income tax policies</li>
                  <li>Work towards effective solutions for a happier life</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Empowering College Voices for Better Future</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Sign in to nominate and vote for trusted individuals from your college who will advocate for:</p>
              <ul className="list-disc list-inside mb-4">
                <li>Improved transportation systems</li>
                <li>Citizen-focused policies</li>
                <li>Fair income tax structures</li>
                <li>Overall community well-being</li>
              </ul>
              <Link href="/login">
                <Button className="w-full">Sign In / Sign Up</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Home;