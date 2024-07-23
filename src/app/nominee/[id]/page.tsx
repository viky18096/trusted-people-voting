import { Suspense } from 'react';
import { getNominee, NomineeData } from '@/lib/getNominee';
import NomineeClient from './NomineeClient';

export default async function NomineePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const nomineeData = await getNominee(id);

  if (!nomineeData) {
    return <div>Nominee not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <NomineeClient nominee={nomineeData} />
      </Suspense>
    </div>
  );
}