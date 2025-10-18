
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard. With mock data, we assume user is always "logged in".
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      {/* This page will redirect to the dashboard */}
    </div>
  );
}
