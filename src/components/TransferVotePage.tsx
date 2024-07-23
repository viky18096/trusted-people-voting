import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, runTransaction, doc } from 'firebase/firestore';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TransferVotePage: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const { logAnalyticsEvent } = useAnalytics();
  const [nominees, setNominees] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedNominee, setSelectedNominee] = useState('');
  const [transferAmount, setTransferAmount] = useState(1);
  const [userVotes, setUserVotes] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirect, setRedirect] = useState<string | null>(null);

  useEffect(() => {
    const checkNomineeStatus = async () => {
      if (loading) return;
      
      if (!user) {
        setRedirect('/login');
        return;
      }

      const nomineeQuery = query(collection(db, 'nominees'), where('email', '==', user.email));
      const nomineeSnapshot = await getDocs(nomineeQuery);

      if (nomineeSnapshot.empty) {
        setRedirect('/');
        return;
      }

      const userNomineeDoc = nomineeSnapshot.docs[0];
      setUserVotes(userNomineeDoc.data().votes);

      const otherNomineesQuery = query(collection(db, 'nominees'), where('email', '!=', user.email));
      const otherNomineesSnapshot = await getDocs(otherNomineesQuery);
      const nomineeList = otherNomineesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setNominees(nomineeList);

      setPageLoading(false);
    };

    checkNomineeStatus();
  }, [user, loading]);

  useEffect(() => {
    if (redirect) {
      window.location.href = redirect;
    }
  }, [redirect]);

  const handleTransfer = async () => {
    if (!user || !selectedNominee) return;

    try {
      setError(null);
      await runTransaction(db, async (transaction) => {
        const userNomineeRef = doc(db, 'nominees', user.uid);
        const targetNomineeRef = doc(db, 'nominees', selectedNominee);

        const userNomineeDoc = await transaction.get(userNomineeRef);
        const targetNomineeDoc = await transaction.get(targetNomineeRef);

        if (!userNomineeDoc.exists() || !targetNomineeDoc.exists()) {
          throw new Error("Nominee doesn't exist");
        }

        const userVotes = userNomineeDoc.data().votes;
        const targetVotes = targetNomineeDoc.data().votes;

        if (userVotes < transferAmount) {
          throw new Error("Not enough votes to transfer");
        }

        transaction.update(userNomineeRef, { votes: userVotes - transferAmount });
        transaction.update(targetNomineeRef, { votes: targetVotes + transferAmount });
      });

      logAnalyticsEvent('vote_transfer', { from: user.uid, to: selectedNominee, amount: transferAmount });
      alert('Votes transferred successfully!');
      setSelectedNominee('');
      setTransferAmount(1);
      setUserVotes(prevVotes => prevVotes - transferAmount);
    } catch (error) {
      console.error('Error transferring votes:', error);
      setError((error as Error).message);
    }
  };

  if (loading || pageLoading) return <div>Loading...</div>;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Transfer Votes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Your current votes: {userVotes}</p>
        <Select onValueChange={setSelectedNominee} value={selectedNominee}>
          <SelectTrigger className="w-full mb-4">
            <SelectValue placeholder="Select a nominee" />
          </SelectTrigger>
          <SelectContent>
            {nominees.map((nominee) => (
              <SelectItem key={nominee.id} value={nominee.id}>{nominee.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input 
          type="number" 
          min="1" 
          max={userVotes} 
          value={transferAmount} 
          onChange={(e) => setTransferAmount(Number(e.target.value))}
          className="mb-4"
        />
        <Button onClick={handleTransfer} disabled={!selectedNominee || transferAmount <= 0 || transferAmount > userVotes}>
          Transfer Votes
        </Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
};

export default TransferVotePage;