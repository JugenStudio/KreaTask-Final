
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // The main layout now redirects to dashboard if a user is found,
    // so this page primarily acts as a fallback or can redirect to the landing page.
    router.replace('/landing');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      {/* This page will redirect to the landing page or dashboard */}
    </div>
  );
}
