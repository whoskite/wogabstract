import { useEffect, useState } from 'react';

interface UseSoundEffectResult {
  play: () => void;
}

export default function useSoundEffect(soundUrl: string): UseSoundEffectResult {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audioElement = new Audio(soundUrl);
    audioElement.preload = 'auto';
    audioElement.volume = 0.5; // 50% volume
    setAudio(audioElement);

    // Cleanup
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [soundUrl]);

  const play = () => {
    if (audio) {
      // Reset audio to start
      audio.currentTime = 0;
      
      // Play the sound
      audio.play().catch(error => {
        console.error('Error playing sound effect:', error);
      });
    }
  };

  return { play };
} 