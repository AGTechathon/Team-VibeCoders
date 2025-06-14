import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Download, Loader2, Play, Square, Volume2, Brain } from 'lucide-react';
import { useGeminiAI } from '../hooks/useGeminiAI';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { usePDFExport } from '../hooks/usePDFExport';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { generateStudyContent, isLoading, error } = useGeminiAI();
  const { speak, stopSpeaking, isSpeaking, speechRate, setSpeechRate } = useTextToSpeech();
  const { exportToPDF, isExporting } = usePDFExport();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

 
    const studyContent = await generateStudyContent(inputValue.trim());
    
    setIsTyping(false);

    if (studyContent) {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Here's a comprehensive study guide for "${studyContent.topic}":`,
        timestamp: new Date(),
        studyContent
      };

      setMessages(prev => [...prev, assistantMessage]);
    } else if (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error while generating content. Please make sure your Gemini API key is configured correctly in your .env file.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSpeak = (text: string, studyContent?: any) => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    let fullText = text;
    if (studyContent) {
      fullText = `
        ${text}
        
        Summary: ${studyContent.summary}
        
        Key Points: ${studyContent.keyPoints.join('. ')}
        
        Detailed Explanation: ${studyContent.detailedExplanation}
      `;
    }
    
    speak(fullText);
  };

  const handleExportPDF = () => {
    exportToPDF(messages, 'MentoraX-Study-Session');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full bg-white/5 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl ${className}`}>
      <div className="flex items-center justify-between p-6 border-b border-white/20 bg-white/5 rounded-t-3xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl shadow-lg">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Study Assistant</h3>
            <p className="text-white/70 text-sm">Focus Mode • Deep Learning Experience</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
            <Volume2 size={16} className="text-white/70" />
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-20 h-2 bg-white/20 rounded-lg appearance-none slider"
              style={{
                background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${((speechRate - 0.5) / 1.5) * 100}%, rgba(255,255,255,0.2) ${((speechRate - 0.5) / 1.5) * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
            <span className="text-xs text-white/70 font-medium">{speechRate}x</span>
          </div>
        
          <button
            onClick={handleExportPDF}
            disabled={messages.length === 0 || isExporting}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-lg"
          >
            {isExporting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Download size={16} />
            )}
            <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-96 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="p-6 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-3xl border border-white/20 backdrop-blur-sm mb-6 max-w-md mx-auto">
              <Brain className="mx-auto mb-4 text-white/60" size={56} />
              <h4 className="text-white font-semibold text-lg mb-2">Welcome to Focus Mode</h4>
              <p className="text-white/70 text-sm leading-relaxed">
                Enter any topic you'd like to study and I'll generate comprehensive study materials with summaries, key concepts, and detailed explanations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {[
                "Explain photosynthesis",
                "Machine learning basics",
                "World War II timeline",
                "Quantum physics principles"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(suggestion)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/20 text-white/80 hover:text-white text-sm transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-4 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500'
              }`}>
                {message.type === 'user' ? (
                  <User size={18} className="text-white" />
                ) : (
                  <Bot size={18} className="text-white" />
                )}
              </div>

              <div className={`rounded-3xl px-6 py-4 shadow-lg backdrop-blur-sm ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : 'bg-white/10 text-white border border-white/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs opacity-70 font-medium">
                    {formatTime(message.timestamp)}
                  </span>
                  {message.type === 'assistant' && (
                    <button
                      onClick={() => handleSpeak(message.content, message.studyContent)}
                      className="ml-3 p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200"
                      aria-label="Read message aloud"
                    >
                      {isSpeaking ? <Square size={14} /> : <Play size={14} />}
                    </button>
                  )}
                </div>
                
                <p className="text-sm leading-relaxed">{message.content}</p>


                {message.studyContent && (
                  <div className="mt-6 space-y-4">

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <h4 className="font-semibold mb-3 text-teal-300 flex items-center">
                        <div className="w-2 h-2 bg-teal-400 rounded-full mr-2"></div>
                        Summary
                      </h4>
                      <p className="text-sm leading-relaxed text-white/90">{message.studyContent.summary}</p>
                    </div>

  
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <h4 className="font-semibold mb-3 text-indigo-300 flex items-center">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                        Key Concepts
                      </h4>
                      <ul className="space-y-2">
                        {message.studyContent.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start space-x-3 text-sm">
                            <span className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs rounded-full flex items-center justify-center font-medium mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-white/90 leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <h4 className="font-semibold mb-3 text-purple-300 flex items-center">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                        Detailed Explanation
                      </h4>
                      <div className="text-sm leading-relaxed whitespace-pre-line text-white/90">
                        {message.studyContent.detailedExplanation}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Bot size={18} className="text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl px-6 py-4 border border-white/20 shadow-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>


      <div className="p-6 border-t border-white/20 bg-white/5 rounded-b-3xl">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl backdrop-blur-sm">
            <p className="text-red-200 text-sm font-medium">{error}</p>
            <p className="text-red-200/80 text-xs mt-1">
              Please add your Gemini API key to the .env file: VITE_GEMINI_API_KEY=your_key_here
            </p>
          </div>
        )}
        
        <div className="flex space-x-4">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about any topic you'd like to study..."
            className="flex-1 px-6 py-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none backdrop-blur-sm shadow-lg"
            rows={1}
            style={{ minHeight: '56px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-2xl text-white transition-all duration-200 flex items-center justify-center shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;