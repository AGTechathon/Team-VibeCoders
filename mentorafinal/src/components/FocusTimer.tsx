import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Clock, Settings } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';

interface FocusTimerProps {
  className?: string;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ className = '' }) => {
  const { timer, startTimer, pauseTimer, resetTimer, setTimerDuration } = useTimer(25);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((timer.totalMinutes * 60 - (timer.minutes * 60 + timer.seconds)) / (timer.totalMinutes * 60)) * 100;

  const presetTimes = [15, 25, 30, 45, 60, 90];

  const handleCustomTime = () => {
    const minutes = parseInt(customMinutes);
    if (minutes > 0 && minutes <= 180) {
      setTimerDuration(minutes);
      setShowCustomInput(false);
      setCustomMinutes('');
    }
  };

  const getTimerColor = () => {
    if (timer.minutes <= 5) return '#ef4444'; 
    if (timer.minutes <= 10) return '#f59e0b'; 
    return '#14b8a6'; 
  };

  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mr-3">
            <Clock className="text-white" size={20} />
          </div>
          <h3 className="text-xl font-bold text-white">Focus Timer</h3>
        </div>
        
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
          aria-label="Custom timer settings"
        >
          <Settings size={18} />
        </button>
      </div>
      
      {}
      {showCustomInput && (
        <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="Minutes"
              min="1"
              max="180"
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            />
            <button
              onClick={handleCustomTime}
              disabled={!customMinutes || parseInt(customMinutes) <= 0}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors duration-200"
            >
              Set
            </button>
          </div>
          <p className="text-xs text-white/60 mt-2">Enter 1-180 minutes for custom focus sessions</p>
        </div>
      )}
      
      {}
      <div className="relative w-52 h-52 mx-auto mb-8">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke={getTimerColor()}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercentage / 100)}`}
            className="transition-all duration-1000 ease-in-out"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(20, 184, 166, 0.5))'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-mono font-bold text-white mb-1">
            {formatTime(timer.minutes, timer.seconds)}
          </span>
          <span className="text-xs text-white/60 font-medium">
            {timer.isActive ? 'FOCUS MODE' : 'READY'}
          </span>
        </div>
      </div>

      {}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={timer.isActive ? pauseTimer : startTimer}
          className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-2xl text-white transition-all duration-200 shadow-lg"
          aria-label={timer.isActive ? 'Pause timer' : 'Start timer'}
        >
          {timer.isActive ? <Pause size={28} /> : <Play size={28} />}
        </button>
        
        <button
          onClick={resetTimer}
          className="flex items-center justify-center w-16 h-16 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all duration-200 border border-white/20"
          aria-label="Reset timer"
        >
          <RotateCcw size={28} />
        </button>
      </div>

      {}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/80 font-medium">Quick Focus Sessions:</p>
          <span className="text-xs text-white/60">{timer.totalMinutes} min selected</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {presetTimes.map((minutes) => (
            <button
              key={minutes}
              onClick={() => setTimerDuration(minutes)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                timer.totalMinutes === minutes
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
              }`}
            >
              {minutes}m
            </button>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-white/50 leading-relaxed">
            Choose your focus duration or use custom settings. 
            The timer will help you maintain deep concentration during study sessions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;