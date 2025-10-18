
'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/providers/language-provider';

/**
 * Hook to implement "press back again to exit" functionality on mobile.
 * When the user presses the back button on a target page, it shows a toast.
 * If they press back again within 2 seconds, it effectively closes the app
 * by navigating to a blank page and clearing history if possible.
 */
export function useBackPressExit() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const backPressCount = useRef(0);
  const backPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      backPressCount.current += 1;

      if (backPressCount.current === 1) {
        toast({
          description: t('common.exit_prompt'),
          duration: 2000,
        });

        // "Cancel" the back navigation by pushing the current state back onto the history stack.
        history.pushState(null, '', location.href);

        // Reset the count after 2 seconds
        if (backPressTimer.current) clearTimeout(backPressTimer.current);
        backPressTimer.current = setTimeout(() => {
          backPressCount.current = 0;
        }, 2000);

      } else if (backPressCount.current === 2) {
        // On second press, try to "close" the tab/app.
        // This is the most reliable way to simulate closing a PWA or web app.
        window.close();
        
        // As a fallback for browsers that don't support window.close(),
        // navigate to a blank page.
        if (!window.closed) {
           location.href = 'about:blank';
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current);
      }
    };
  }, [toast, t]);
}
