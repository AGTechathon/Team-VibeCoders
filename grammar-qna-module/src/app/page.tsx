"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to grammar-check page by default
    router.push('/grammar-check');
  }, [router]);

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-16 w-16 text-primary animate-pulse"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <h1 className="text-2xl font-bold text-primary">Loading...</h1>
          <p className="text-muted-foreground">Redirecting to Grammar Check</p>
        </div>
      </div>
    </AppLayout>
  );
}
