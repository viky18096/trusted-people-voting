import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface Reputation {
  score: number;
  level: string;
}

export const useReputation = () => {
  const [user] = useAuthState(auth);
  const [reputation, setReputation] = useState<Reputation | null>(null);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        if (userData.reputation) {
          setReputation(userData.reputation);
        } else {
          // Initialize reputation if it doesn't exist
          const initialReputation: Reputation = { score: 0, level: 'Newcomer' };
          setDoc(userRef, { reputation: initialReputation }, { merge: true });
          setReputation(initialReputation);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const updateReputation = async (points: number) => {
    if (!user || !reputation) return;

    const newScore = reputation.score + points;
    let newLevel = reputation.level;

    if (newScore >= 100) newLevel = 'Expert';
    else if (newScore >= 50) newLevel = 'Contributor';
    else if (newScore >= 10) newLevel = 'Regular';
    else newLevel = 'Newcomer';

    const newReputation: Reputation = { score: newScore, level: newLevel };

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { reputation: newReputation }, { merge: true });
  };

  return { reputation, updateReputation };
};