'use client'

import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, runTransaction, collection, query, where, getDocs } from 'firebase/firestore';
import { useAnalytics } from '../hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface VoteTransferProps {
  nomineeId: string;
  currentVotes: number;
}

const VoteTransfer: React.FC<VoteTransferProps> = ({ nomineeId, currentVotes }) => {
  const [user] = useAuthState(auth);
  const { logAnalyticsEvent } = useAnalytics();
  const [targetEmail, setTargetEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const validateTargetNominee = async (email: string) => {
    const nomineesRef = collection(db, 'nominees');
    const q = query(nomineesRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleTransfer = async () => {
    if (!user || !targetEmail) return;

    try {
      setError(null);

      const isValidNominee = await validateTargetNominee(targetEmail);
      if (!isValidNominee) {
        setError('This email does not belong to a nominated leader.');
        return;
      }

      // Find the target nominee by email
      const nomineesRef = collection(db, 'nominees');
      const q = query(nomineesRef, where('email', '==', targetEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('No nominee found with this email address.');
        return;
      }

      const targetNomineeDoc = querySnapshot.docs[0];
      const targetNomineeId = targetNomineeDoc.id;

      await runTransaction(db, async (transaction) => {
        const sourceNomineeRef = doc(db, 'nominees', nomineeId);
        const targetNomineeRef = doc(db, 'nominees', targetNomineeId);

        const sourceNomineeDoc = await transaction.get(sourceNomineeRef);
        const targetNomineeDoc = await transaction.get(targetNomineeRef);

        if (!sourceNomineeDoc.exists() || !targetNomineeDoc.exists()) {
          throw "Nominee doesn't exist";
        }

        const sourceVotes = sourceNomineeDoc.data().votes;
        const targetVotes = targetNomineeDoc.data().votes;

        if (sourceVotes < transferAmount) {
          throw "Not enough votes to transfer";
        }

        transaction.update(sourceNomineeRef, { votes: sourceVotes - transferAmount });
        transaction.update(targetNomineeRef, { votes: targetVotes + transferAmount });
      });

      logAnalyticsEvent('vote_transfer', { from: nomineeId, to: targetNomineeId, amount: transferAmount });
      alert('Votes transferred successfully!');
      setTargetEmail('');
      setTransferAmount(1);
    } catch (error) {
      console.error('Error transferring votes:', error);
      setError('Error transferring votes. Please try again.');
    }
  };

  return (
    <div className="mt-4">
      <Input 
        type="email"
        value={targetEmail}
        onChange={(e) => setTargetEmail(e.target.value)}
        placeholder="Enter email of nominee to transfer votes"
        className="mb-2"
      />
      <Input 
        type="number" 
        min="1" 
        max={currentVotes} 
        value={transferAmount} 
        onChange={(e) => setTransferAmount(Number(e.target.value))}
        className="mb-2"
      />
      <Button onClick={handleTransfer}>Transfer Votes</Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default VoteTransfer;