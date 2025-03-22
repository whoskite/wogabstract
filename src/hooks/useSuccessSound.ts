import { useEffect, useState } from 'react';

interface UseSuccessSoundResult {
  play: () => void;
}

export default function useSuccessSound(soundUrl: string = '/sounds/notification.mp3'): UseSuccessSoundResult {
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
        console.error('Error playing success sound:', error);
      });
    }
  };

  return { play };
} 