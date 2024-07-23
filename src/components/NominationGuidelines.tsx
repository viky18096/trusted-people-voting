import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NominationGuidelines: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nomination Guidelines</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-2">
          <li>Ensure the nominee has made significant contributions to their community or field.</li>
          <li>Provide specific examples of the nominee's impact in your reason for nomination.</li>
          <li>Verify that the nominee's achievements are recent (within the last 5 years).</li>
          <li>Check if the nominee has already been nominated to avoid duplicates.</li>
          <li>Respect the nominee's privacy and only share publicly available information.</li>
          <li>Be objective and factual in your description and reasoning.</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default NominationGuidelines;