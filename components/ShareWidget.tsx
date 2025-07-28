import React, { useState } from 'react';

interface ShareWidgetProps {
  location: 'post-scan' | 'profile' | 'payment-success';
  size?: 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  userType?: 'authenticated' | 'anonymous';
}

const ShareWidget: React.FC<ShareWidgetProps> = ({ 
  location, 
  size = 'medium', 
  orientation = 'horizontal',
  className = '',
  userType = 'unknown'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const appUrl = 'https://whatthemenu.com';
  const shareMessage = 'Know someone who will find this app useful? Check out WhatTheMenu - it explains any dish on any menu instantly!';

  // GA4 Tracking
  const trackShare = (method: string) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share_initiated', {
        'share_method': method,
        'share_location': location,
        'user_type': userType
      });
    }
  };

  // Share handlers
  const handleWhatsApp = () => {
    trackShare('whatsapp');
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${appUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleMessages = () => {
    trackShare('messages');
    const url = `sms:?body=${encodeURIComponent(`${shareMessage} ${appUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleEmail = () => {
    trackShare('email');
    const subject = 'Check out this amazing menu app!';
    const body = `${shareMessage}\n\n${appUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    trackShare('twitter');
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareMessage} ${appUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleFacebook = () => {
    trackShare('facebook');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
    window.open(url, '_blank');
  };

  const handleInstagram = () => {
    trackShare('instagram');
    handleCopyLink();
    alert('Link copied! You can paste it in your Instagram story or bio.');
  };

  const handleTikTok = () => {
    trackShare('tiktok');
    handleCopyLink();
    alert('Link copied! You can paste it in your TikTok bio or comments.');
  };

  const handleCopyLink = () => {
    trackShare('copy_link');
    navigator.clipboard.writeText(appUrl).then(() => {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    });
  };

  const handleNativeShare = () => {
    trackShare('native_share');
    if (navigator.share) {
      navigator.share({
        title: 'WhatTheMenu - Menu Scanner',
        text: shareMessage,
        url: appUrl,
      });
    } else {
      setIsExpanded(true);
    }
  };

  // Size configurations
  const sizeConfig = {
    medium: {
      button: 'px-4 py-3 text-base',
      icon: 'text-xl',
      text: 'text-base',
      grid: 'grid-cols-4',
      spacing: 'gap-3'
    },
    large: {
      button: 'px-6 py-4 text-lg',
      icon: 'text-2xl',
      text: 'text-lg',
      grid: 'grid-cols-2 sm:grid-cols-4',
      spacing: 'gap-4'
    }
  };

  const config = sizeConfig[size];

  // Location-specific styling
  const getLocationStyling = () => {
    switch (location) {
      case 'post-scan':
        return 'bg-teal/20 border-4';
      case 'profile':
        return 'bg-coral/20 border-4';
      case 'payment-success':
        return 'bg-green-100 border-4';
      default:
        return 'bg-white border-4';
    }
  };

  // Share options
  const shareOptions = [
    { name: 'WhatsApp', icon: '💬', handler: handleWhatsApp },
    { name: 'Messages', icon: '📱', handler: handleMessages },
    { name: 'Email', icon: '📧', handler: handleEmail },
    { name: 'Copy Link', icon: '🔗', handler: handleCopyLink },
    { name: 'Twitter/X', icon: '🐦', handler: handleTwitter },
    { name: 'Facebook', icon: '👥', handler: handleFacebook },
    { name: 'Instagram', icon: '📸', handler: handleInstagram },
    { name: 'TikTok', icon: '🎵', handler: handleTikTok }
  ];

  return (
    <div className={`${getLocationStyling()} border-charcoal rounded-2xl p-6 shadow-[6px_6px_0px_#292524] ${className}`}>
      {!isExpanded ? (
        <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} items-center ${orientation === 'vertical' ? 'space-y-4' : 'space-x-4'}`}>
          <div className="flex-1 text-center">
            <p className={`font-bold text-charcoal ${config.text}`}>
              Know someone who will find this useful?
            </p>
          </div>
          
          <div className="flex-shrink-0">
            {navigator.share ? (
              <button
                onClick={handleNativeShare}
                className={`${config.button} bg-coral text-white font-bold rounded-full border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all`}
              >
                <span className={config.icon}>📤</span>
                <span className="ml-2">Share Now</span>
              </button>
            ) : (
              <button
                onClick={() => setIsExpanded(true)}
                className={`${config.button} bg-coral text-white font-bold rounded-full border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all`}
              >
                <span className={config.icon}>📤</span>
                <span className="ml-2">Share Now</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-black text-charcoal ${config.text}`}>Share WhatTheMenu</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-charcoal hover:text-coral font-bold text-xl"
            >
              ✕
            </button>
          </div>

          <div className={`grid ${config.grid} ${config.spacing}`}>
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.handler}
                className="flex flex-col items-center justify-center p-3 bg-white border-2 border-charcoal rounded-xl hover:shadow-[2px_2px_0px_#292524] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all group"
              >
                <span className={`${config.icon} mb-1 group-hover:scale-110 transition-transform`}>
                  {option.icon}
                </span>
                <span className="text-xs font-bold text-charcoal text-center">
                  {option.name}
                </span>
              </button>
            ))}
          </div>

          {showCopySuccess && (
            <div className="mt-3 p-2 bg-green-100 border-2 border-green-300 rounded-lg text-center">
              <span className="text-green-800 font-bold text-sm">✅ Link copied to clipboard!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShareWidget;