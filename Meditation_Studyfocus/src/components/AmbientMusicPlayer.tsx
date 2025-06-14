import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AmbientMusicPlayerProps {
  className?: string;
}

const AmbientMusicPlayer: React.FC<AmbientMusicPlayerProps> = ({ className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tracks = [
    'https://www.soundjay.com/misc/sounds/clock-ticking-3.mp3', 
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.loop = true;
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
      
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
    
        const playAmbientSound = () => {
          const frequencies = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C (major chord)
          const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
          
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          
          osc.connect(gain);
          gain.connect(audioContext.destination);
          
          osc.frequency.setValueAtTime(randomFreq, audioContext.currentTime);
          osc.type = 'sine';
          
          gain.gain.setValueAtTime(0, audioContext.currentTime);
          gain.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.5);
          gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 3);
          
          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + 3);
          
          if (isPlaying) {
            setTimeout(playAmbientSound, Math.random() * 4000 + 2000);
          }
        };
        
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            playAmbientSound();
          });
        } else {
          playAmbientSound();
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className={`flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 ${className}`}>
      <audio ref={audioRef} />
      
      <button
        onClick={togglePlayPause}
        className="p-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition-colors duration-200"
        aria-label={isPlaying ? 'Pause ambient music' : 'Play ambient music'}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleMute}
          className="p-1 text-white/80 hover:text-white transition-colors duration-200"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="w-20 h-2 bg-white/20 rounded-lg appearance-none slider"
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
          }}
        />
      </div>
      
      <span className="text-xs text-white/60">Ambient Piano</span>
    </div>
  );
};

export default AmbientMusicPlayer;