import React, { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ArrowLeft, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as monaco from 'monaco-editor';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import SubscriptionManager from '@/components/SubscriptionManager';

interface LanguageCode {
  javascript: string;
  python: string;
  java: string;
  c: string;
  cpp: string;
}

interface LanguageId {
  javascript: number;
  python: number;
  java: number;
  c: number;
  cpp: number;
}

const RealInterview: React.FC = () => {
  const LANGUAGE_ID: LanguageId = {
    javascript: 63,
    python: 71,
    java: 62,
    c: 48,
    cpp: 52,
  };

  const DEFAULT_CODE: LanguageCode = {
    javascript: '// Your code here\n// Print the output to Submit the code properly\n',
    python: '# Your code here # Print the output to Submit the code properly\n',
    java: 'public class Main {\n  public static void main(String args[]) {\n    // Your code here\n// Print the output to Submit the code properly  }\n}',
    c: '// C is not supported in this demo',
    cpp: '// C++ is not supported in this demo',
  };

  const [language, setLanguage] = useState<keyof LanguageCode>('javascript');
  const [code, setCode] = useState(DEFAULT_CODE[language]);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  function handleEditorChange(value: string | undefined) {
    if (value !== undefined) {
      setCode(value);
    }
  }

  useEffect(() => {
    setCode(DEFAULT_CODE[language] || '');
  }, [language]);

  const handleSubscriptionComplete = () => {
    setIsSubscribed(true);
    // Initialize video call after successful subscription
    initializeVideoCall();
  };

  const initializeVideoCall = async () => {
    try {
      const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0');
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || '';
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        Date.now().toString(),
        'user_' + Date.now().toString()
      );

      const zc = ZegoUIKitPrebuilt.create(kitToken);
      const container = document.querySelector('#video-call-container') as HTMLElement;
      
      if (container) {
        zc.joinRoom({
          container,
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
          },
          showPreJoinView: true,
          showLeavingView: true,
          showUserList: true,
          showScreenSharingButton: true,
          showMoreButton: true,
          showAudioVideoSettingsButton: true,
          showLeaveButton: true,
        });
      }
    } catch (error) {
      console.error('Failed to initialize video call:', error);
    }
  };

  const runCode = async () => {
    if (!code) {
      setOutput('Please write some code first!');
      return;
    }
    
    setIsLoading(true);
    setOutput('Running your solution...');
    
    try {
      const fullCode = code;
      const rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;

      const response = await axios.post(
        'https://judge0-ce.p.rapidapi.com/submissions',
        {
          source_code: fullCode,
          language_id: LANGUAGE_ID[language],
          stdin: '',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        }
      );

      const token = response.data.token;
      let result;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const resultResponse = await axios.get(
          `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
          {
            headers: {
              'X-RapidAPI-Key': rapidApiKey,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            },
          }
        );
        result = resultResponse.data;
        
        if (result.status && result.status.id > 2) {
          break;
        }
        
        attempts++;
      }

      let outputText = '';
      
      if (result.status && result.status.id === 3) {
        outputText = result.stdout || 'No output';
      } 
      else if (result.status && result.status.id === 6) {
        outputText = `Compilation Error:\n${result.compile_output || 'No specific compilation output.'}`;
      }
      else if (result.stderr) {
        outputText = `Runtime Error:\n${result.stderr}`;
      }
      else if (result.status) {
        outputText = `Execution Status: ${result.status.description}\n`;
        if (result.stdout) outputText += `Stdout:\n${result.stdout}\n`;
        if (result.stderr) outputText += `Stderr:\n${result.stderr}`;
      }
      else if (result.message) {
        outputText = result.message;
      }
      else {
        outputText = 'An unknown error occurred during code execution.';
      }

      setOutput(outputText);
    } catch (error: unknown) {
      console.error('Error executing code:', error);
      setOutput(`Error executing code: ${error instanceof Error ? error.message : 'Check console for details.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-16">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>

          {!isSubscribed ? (
            <SubscriptionManager onSubscriptionComplete={handleSubscriptionComplete} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Video Call Section */}
              <div className="bg-gray-800 rounded-xl p-6 h-[600px]">
                <div id="video-call-container" className="w-full h-full rounded-lg overflow-hidden" />
              </div>

              {/* Code Editor Section */}
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as keyof LanguageCode)}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    {Object.keys(LANGUAGE_ID).map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'vs-dark' | 'light')}
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg ml-4"
                  >
                    <option value="vs-dark">Dark Theme</option>
                    <option value="light">Light Theme</option>
                  </select>
                </div>

                <div className="h-[400px] mb-4">
                  <Editor
                    height="100%"
                    defaultLanguage={LANGUAGE_ID[language]}
                    defaultValue={code}
                    theme={theme}
                    onMount={handleEditorDidMount}
                    onChange={handleEditorChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      readOnly: false,
                      automaticLayout: true,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={runCode}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? 'Running...' : 'Run Code'}
                  </button>
                </div>

                {output && (
                  <div className="mt-4 bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Output:</h3>
                    <pre className="text-sm whitespace-pre-wrap">{output}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RealInterview;