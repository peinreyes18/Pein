'use client';

import { useEffect, useState } from 'react';
import { getSettings } from '@/lib/storage';

export default function TextSizeWrapper({ children }: { children: React.ReactNode }) {
  const [textClass, setTextClass] = useState('text-lg');

  useEffect(() => {
    const settings = getSettings();
    switch (settings.textSize) {
      case 'normal':
        setTextClass('text-base');
        break;
      case 'malaki':
        setTextClass('text-lg');
        break;
      case 'mas-malaki':
        setTextClass('text-xl');
        break;
    }

    // Listen for settings changes
    const handleStorage = () => {
      const s = getSettings();
      switch (s.textSize) {
        case 'normal':
          setTextClass('text-base');
          break;
        case 'malaki':
          setTextClass('text-lg');
          break;
        case 'mas-malaki':
          setTextClass('text-xl');
          break;
      }
    };

    window.addEventListener('storage', handleStorage);
    // Custom event for same-tab updates
    window.addEventListener('settingsChanged', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('settingsChanged', handleStorage);
    };
  }, []);

  return <div className={textClass}>{children}</div>;
}
