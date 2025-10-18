
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // The main app layout now handles redirection for authenticated users.
    // This page's primary role is to redirect any root access to the landing page.
    router.replace('/landing');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      {/* This page will redirect to the landing page or dashboard */}
    </div>
  );
}
