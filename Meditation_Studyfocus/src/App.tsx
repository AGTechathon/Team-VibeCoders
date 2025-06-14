import React from 'react';
import { GraduationCap } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import FocusTimer from './components/FocusTimer';
import CustomMusicPlayer from './components/CustomMusicPlayer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10">
      
        <header className="p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl">
              <GraduationCap className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              MentoraX
            </h1>
          </div>
          <p className="text-white/70 text-lg">AI-Powered Learning & Interview Preparation Platform</p>
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm">Meditation & Study Focus Mode</span>
          </div>        </header>

        <div className="container mx-auto px-6 pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
  
            <div className="lg:col-span-2">
              <ChatInterface className="h-[600px]" />
            </div>
            
        
            <div className="space-y-6">
              <FocusTimer />
              <CustomMusicPlayer />
              
        
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-4">Study Tips</h3>
                <div className="space-y-3 text-white/80 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use the focus timer to maintain concentration during study sessions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Ask follow-up questions to deepen your understanding</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Export your chat as PDF for offline review</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Upload your favorite music to create a personalized study environment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;