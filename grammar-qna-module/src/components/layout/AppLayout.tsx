"use client";

import React from 'react';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from './Header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Header />
        <div className="flex flex-1">
          <AppSidebar />
          <main className="flex-1 p-4 md:p-6 md:pl-[calc(var(--sidebar-width)+1.5rem)]">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
