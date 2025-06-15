"use client";

import { Button } from '@/components/ui1/button';
import { PanelLeft } from 'lucide-react';
import { useSidebar } from '@/components/ui1/sidebar';

export function Header() {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 shadow-sm md:pl-[calc(var(--sidebar-width)+1rem)]">
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <PanelLeft className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      )}
      
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <h1 className="text-xl font-semibold">LearnAI</h1>
      </div>
    </header>
  );
}
