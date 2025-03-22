import { useState, useEffect, useRef } from 'react';

interface UseSoundEffectResult {
  play: () => void;
  stop: () => void;
  isPlaying: boolean;
  volume: number;
  setVolume: (volume: number) => void;
}

export const useSoundEffect = (
  soundPath: string, 
  options?: { 
    loop?: boolean; 
    autoplay?: boolean;
    volume?: number;
  }
): UseSoundEffectResult => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(options?.volume || 1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on first render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio(soundPath);
      audio.loop = options?.loop || false;
      audio.volume = volume;
      audioRef.current = audio;

      // Add event listeners
      audio.addEventListener('ended', () => {
        if (!options?.loop) {
          setIsPlaying(false);
        }
      });

      // Auto-play if specified
      if (options?.autoplay) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              console.warn('Auto-play was prevented by browser:', error);
            });
        }
      }

      // Cleanup on unmount
      return () => {
        audio.pause();
        audio.src = '';
        audio.remove();
        audioRef.current = null;
      };
    }
  }, [soundPath]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = () => {
    if (audioRef.current) {
      // For sound effects without loop, reset to beginning
      if (!options?.loop) {
        audioRef.current.currentTime = 0;
      }
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(error => {
            console.warn('Play was prevented by browser:', error);
          });
      }
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (!options?.loop) {
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    }
  };

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  };

  return { play, stop, isPlaying, volume, setVolume };
};

export const useBackgroundMusic = (
  soundPath: string,
  initialVolume = 0.5
): UseSoundEffectResult => {
  return useSoundEffect(soundPath, {
    loop: true,
    autoplay: true,
    volume: initialVolume
  });
}; 