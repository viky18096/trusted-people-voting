import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VerificationBadgeProps {
  isVerified: boolean;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ isVerified }) => {
  if (!isVerified) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <CheckCircle className="text-blue-500 h-5 w-5 ml-1" />
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Account</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerificationBadge;