"use client"

import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAnalytics } from '../hooks/useAnalytics';
import { useReputation } from '../hooks/useReputation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import VerificationBadge from './VerificationBadge';

interface UserData {
  name: string;
  location: string;
  bio: string;
  isVerified: boolean;
}

const UserProfile: React.FC = () => {
  const [user] = useAuthState(auth);
  const { logAnalyticsEvent } = useAnalytics();
  const { reputation } = useReputation();
  const [userData, setUserData] = useState<UserData>({ name: '', location: '', bio: '', isVerified: false });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      setIsEditing(false);
      logAnalyticsEvent('profile_updated');
    } catch (error) {
      console.error('Error updating profile:', error);
      logAnalyticsEvent('profile_update_error', { error: (error as Error).message });
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.photoURL || undefined} alt={userData.name} />
            <AvatarFallback>{userData.name ? userData.name.charAt(0): ''}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              {userData.name}
              <VerificationBadge isVerified={userData.isVerified} />
            </h2>
            <p className="text-gray-500">{userData.location}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              value={userData.name}
              onChange={handleInputChange}
              placeholder="Your Name"
            />
            <Input
              name="location"
              value={userData.location}
              onChange={handleInputChange}
              placeholder="Your Location"
            />
            <Input
              name="bio"
              value={userData.bio}
              onChange={handleInputChange}
              placeholder="Short bio"
            />
            <div className="flex space-x-2">
              <Button type="submit">Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            <p className="mb-4">{userData.bio}</p>
            <p className="mb-4">Reputation: {reputation?.score} ({reputation?.level})</p>
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfile;