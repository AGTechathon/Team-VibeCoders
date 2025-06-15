"use client";
import React from 'react';
export const dynamic = 'force-dynamic';
import LiveIDE from '@/LiveIDE/page';
// import AiIDE from '@/AiIDE/page';
export default function Home() {
  return (
    <div>

      <LiveIDE/>
      {/* <AiIDE/> */}
    </div>
    
  );
}
