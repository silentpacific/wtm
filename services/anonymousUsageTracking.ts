// src/services/anonymousUsageTracking.ts
// Updated for per-menu dish limits

interface AnonymousUsage {
  scansUsed: number;
  currentMenuDishExplanations: number; // Changed: track current menu only
  lastResetMonth: string; // Format: "2025-07"
  fingerprint: string;
}

// Generate basic browser fingerprint for abuse prevention
const generateFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillText('fp', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  } catch (error) {
    // Fallback if fingerprinting fails
    return 'fp_' + Date.now().toString(36);
  }
};

// Get current month string (YYYY-MM format)
const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Get anonymous usage with monthly reset
export const getAnonymousUsage = (): AnonymousUsage => {
  const currentMonth = getCurrentMonth();
  const fingerprint = generateFingerprint();
  
  // Try to get existing usage from localStorage
  const stored = localStorage.getItem('anonymousUsage');
  let usage: AnonymousUsage;
  
  if (stored) {
    try {
      usage = JSON.parse(stored);
      
      // Check if we need to reset for new month
      if (usage.lastResetMonth !== currentMonth) {
        console.log('🗓️ New month detected, resetting anonymous usage');
        usage = {
          scansUsed: 0,
          currentMenuDishExplanations: 0,
          lastResetMonth: currentMonth,
          fingerprint
        };
      }
      
      // Check if fingerprint changed significantly (different device/browser)
      if (usage.fingerprint !== fingerprint) {
        console.log('🖱️ Different device detected, keeping current usage but updating fingerprint');
        usage.fingerprint = fingerprint; // Update fingerprint but keep usage
      }
      
      // Migrate old format if needed
      if ('explanationsUsed' in usage) {
        console.log('🔄 Migrating old anonymous usage format');
        const oldUsage = usage as any;
        usage = {
          scansUsed: oldUsage.scansUsed || 0,
          currentMenuDishExplanations: 0, // Reset to 0 for new per-menu system
          lastResetMonth: currentMonth,
          fingerprint
        };
      }
      
    } catch (error) {
      console.error('Error parsing stored anonymous usage:', error);
      usage = {
        scansUsed: 0,
        currentMenuDishExplanations: 0,
        lastResetMonth: currentMonth,
        fingerprint
      };
    }
  } else {
    // First time user
    usage = {
      scansUsed: 0,
      currentMenuDishExplanations: 0,
      lastResetMonth: currentMonth,
      fingerprint
    };
  }
  
  // Save updated usage back to localStorage
  localStorage.setItem('anonymousUsage', JSON.stringify(usage));
  return usage;
};

// Increment anonymous scan count
export const incrementAnonymousScan = (): AnonymousUsage => {
  const usage = getAnonymousUsage();
  usage.scansUsed += 1;
  usage.currentMenuDishExplanations = 0; // Reset dish counter for new menu
  localStorage.setItem('anonymousUsage', JSON.stringify(usage));
  console.log(`📸 Anonymous scans: ${usage.scansUsed}/5, dishes reset to 0/5`);
  return usage;
};

// Increment anonymous explanation count for current menu
export const incrementAnonymousExplanation = (): AnonymousUsage => {
  const usage = getAnonymousUsage();
  usage.currentMenuDishExplanations += 1;
  localStorage.setItem('anonymousUsage', JSON.stringify(usage));
  console.log(`💡 Anonymous dish explanations: ${usage.currentMenuDishExplanations}/5 (current menu)`);
  return usage;
};

// Check if anonymous user can scan more menus
export const canAnonymousUserScan = (): boolean => {
  const usage = getAnonymousUsage();
  return usage.scansUsed < 5;
};

// Check if anonymous user can explain more dishes in current menu
export const canAnonymousUserExplainDish = (): boolean => {
  const usage = getAnonymousUsage();
  return usage.currentMenuDishExplanations < 5;
};

// Reset dish explanations for new menu (called when scan starts)
export const resetAnonymousDishCounter = (): AnonymousUsage => {
  const usage = getAnonymousUsage();
  usage.currentMenuDishExplanations = 0;
  localStorage.setItem('anonymousUsage', JSON.stringify(usage));
  console.log('🔄 Anonymous dish counter reset to 0/5 for new menu');
  return usage;
};

// Get anonymous user limits
export const getAnonymousLimits = () => {
  const usage = getAnonymousUsage();
  return {
    scansUsed: usage.scansUsed,
    scansLimit: 5,
    explanationsUsed: usage.currentMenuDishExplanations, // Current menu only
    explanationsLimit: 5, // 5 dishes per menu
    hasUnlimited: false,
    canScan: usage.scansUsed < 5,
    canExplainDish: usage.currentMenuDishExplanations < 5,
    timeRemaining: null
  };
};

// Reset anonymous usage (called when user signs up)
export const resetAnonymousUsage = (): void => {
  localStorage.removeItem('anonymousUsage');
  console.log('🔄 Anonymous usage reset for new account signup');
};