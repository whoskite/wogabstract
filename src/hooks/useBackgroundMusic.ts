import { useEffect, useState } from 'react';

interface UseBackgroundMusicResult {
  isPlaying: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  play: () => void;
  stop: () => void;
}

export default function useBackgroundMusic(
  soundUrl: string,
  initialVolume: number = 0.05
): UseBackgroundMusicResult {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(initialVolume);

  useEffect(() => {
    // Create audio element
    const audioElement = new Audio(soundUrl);
    audioElement.preload = 'auto';
    audioElement.loop = true;
    audioElement.volume = volume;
    setAudio(audioElement);

    // Cleanup
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [soundUrl]);

  // Update volume when it changes
  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [audio, volume]);

  const play = () => {
    if (audio && !isPlaying) {
      // Play the audio
      audio.play().catch(error => {
        console.error('Error playing background music:', error);
      });
      setIsPlaying(true);
    }
  };

  const stop = () => {
    if (audio && isPlaying) {
      audio.pause();
      // Optionally reset to beginning
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return { isPlaying, volume, setVolume, play, stop };
} 