"use client";

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAnalytics } from '../hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [user, loading] = useAuthState(auth);
  const { logAnalyticsEvent } = useAnalytics();

  useEffect(() => {
    console.log("Auth state changed:", user ? "logged in" : "logged out");
  }, [user]);

  const handleAuth = async (action: 'signup' | 'signin') => {
    try {
      setError(null);
      if (action === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          createdAt: new Date(),
        });
        
        logAnalyticsEvent('sign_up');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        logAnalyticsEvent('login');
      }
      console.log("Authentication successful:", action);
    } catch (error) {
      setError((error as Error).message);
      logAnalyticsEvent('auth_error', { error: (error as Error).message });
      console.error("Authentication error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      logAnalyticsEvent('logout');
      console.log("Sign out successful");
    } catch (error) {
      setError((error as Error).message);
      logAnalyticsEvent('auth_error', { error: (error as Error).message });
      console.error("Sign out error:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleAuth('signin');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.email}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignOut} variant="destructive">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <div className="flex space-x-4">
            <Button type="submit" variant="default">
              Sign In
            </Button>
            <Button type="button" onClick={() => handleAuth('signup')} variant="outline">
              Sign Up
            </Button>
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
};

export default Auth;