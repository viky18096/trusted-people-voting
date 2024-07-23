import React from 'react';
import { Twitter, Facebook, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '../hooks/useAnalytics';

interface SocialShareProps {
  url: string;
  title: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ url, title }) => {
  const { logAnalyticsEvent } = useAnalytics();

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    window.open(shareUrls[platform], '_blank');
    logAnalyticsEvent('social_share', { platform, url });
  };

  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="icon" onClick={() => handleShare('twitter')}>
        <Twitter className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => handleShare('facebook')}>
        <Facebook className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => handleShare('linkedin')}>
        <Linkedin className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SocialShare;