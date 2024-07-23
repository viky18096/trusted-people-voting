import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface NomineeData {
  id: string;
  name: string;
  collegeName: string;
  description: string;
  location: string;
  votes: number;
  photoURL: string;
  email: string;
  linkedinProfile?: string;
  reason?: string;
}

export async function getNominee(id: string): Promise<NomineeData | null> {
  const nomineeRef = doc(db, 'nominees', id);
  const nomineeSnap = await getDoc(nomineeRef);

  if (nomineeSnap.exists()) {
    const data = nomineeSnap.data();
    return {
      id: nomineeSnap.id,
      name: data.name || '',
      collegeName: data.collegeName || '',
      description: data.description || '',
      location: data.location || '',
      votes: data.votes || 0,
      photoURL: data.photoURL || '',
      email: data.email || '',
      linkedinProfile: data.linkedinProfile || '',
      reason: data.reason || '',
    };
  } else {
    return null;
  }
}