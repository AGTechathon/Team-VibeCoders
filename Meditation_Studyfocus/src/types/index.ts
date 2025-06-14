export interface StudyContent {
  topic: string;
  summary: string;
  keyPoints: string[];
  detailedExplanation: string;
  isGenerating: boolean;
}

export interface TimerState {
  minutes: number;
  seconds: number;
  isActive: boolean;
  totalMinutes: number;
}

export interface AudioState {
  isPlaying: boolean;
  volume: number;
  currentTrack: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  studyContent?: StudyContent;
}

export interface CustomAudioFile {
  name: string;
  url: string;
  file: File;
}