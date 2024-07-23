'use client'


import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAnalytics } from '../hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface NominationFormData {
  name: string;
  email: string;
  collegeName: string;
  description: string;
  reason: string;
  location: string;
  photo: FileList;
  linkedinProfile: string;
}

const NominationForm: React.FC = () => {
  const [user] = useAuthState(auth);
  const { logAnalyticsEvent } = useAnalytics();
  const { control, register, handleSubmit, formState: { errors }, reset, setError } = useForm<NominationFormData>();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = async (email: string) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const onSubmit = async (data: NominationFormData) => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const isValidEmail = await validateEmail(data.email);
      if (!isValidEmail) {
        setError('email', { type: 'manual', message: 'This email is not associated with a registered user.' });
        setIsSubmitting(false);
        return;
      }

      let photoURL = '';
      if (data.photo[0]) {
        const storageRef = ref(storage, `nominee-photos/${Date.now()}_${data.photo[0].name}`);
        await uploadBytes(storageRef, data.photo[0]);
        photoURL = await getDownloadURL(storageRef);
      }

      const docRef = await addDoc(collection(db, 'nominees'), {
        name: data.name,
        email: data.email,
        collegeName: data.collegeName,
        description: data.description,
        reason: data.reason,
        location: data.location,
        photoURL,
        linkedinProfile: data.linkedinProfile,
        votes: 0,
        createdAt: serverTimestamp(),
        nominatedBy: user.uid,
      });

      logAnalyticsEvent('nomination_submitted', { nomineeId: docRef.id });
      reset();
      setStep(1);
      alert('Nomination submitted successfully!');
    } catch (error) {
      console.error('Error submitting nomination:', error);
      alert('Error submitting nomination. Please try again.');
      logAnalyticsEvent('nomination_error', { error: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Nominate a Trusted Individual</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && (
            <>
              <Input 
                {...register('name', { required: 'Name is required' })}
                placeholder="Nominee Name"
                className="mb-4"
              />
              {errors.name && <p className="text-red-500">{errors.name.message}</p>}
              <Input 
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                placeholder="Nominee Email"
                className="mb-4"
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
              <Input 
                {...register('collegeName', { required: 'College Name is required' })}
                placeholder="College Name"
                className="mb-4"
              />
              {errors.collegeName && <p className="text-red-500">{errors.collegeName.message}</p>}
              <Input 
                {...register('linkedinProfile')}
                placeholder="LinkedIn Profile URL (optional)"
                className="mt-4"
              />
            </>
          )}
          {step === 2 && (
            <>
              <Textarea 
                {...register('description', { required: 'Description is required' })}
                placeholder="Brief description of the nominee"
                className="mb-4"
              />
              {errors.description && <p className="text-red-500">{errors.description.message}</p>}
              <Input 
                {...register('location', { required: 'Location is required' })}
                placeholder="Nominee Location"
                className="mb-4"
              />
              {errors.location && <p className="text-red-500">{errors.location.message}</p>}
            </>
          )}
          {step === 3 && (
            <>
              <Textarea 
                {...register('reason', { required: 'Reason is required' })}
                placeholder="Reason for nomination"
                className="mb-4"
              />
              {errors.reason && <p className="text-red-500">{errors.reason.message}</p>}
              <Input 
                type="file"
                {...register('photo')}
                className="mb-4"
              />
            </>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 && <Button onClick={prevStep}>Previous</Button>}
        {step < 3 ? (
          <Button onClick={nextStep}>Next</Button>
        ) : (
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Nomination'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default NominationForm;