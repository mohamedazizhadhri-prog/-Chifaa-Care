import { useCallback, useRef } from 'react';

type SoundType = 'cardDraw' | 'cardDiscard' | 'cardShuffle' | 'turnChange' | 'meldForm' | 'roundEnd' | 'gameOver';

const SOUNDS: Record<SoundType, string> = {
  cardDraw: '/sounds/card-draw.mp3',
  cardDiscard: '/sounds/card-discard.mp3',
  cardShuffle: '/sounds/card-shuffle.mp3',
  turnChange: '/sounds/turn-change.mp3',
  meldForm: '/sounds/meld-form.mp3',
  roundEnd: '/sounds/round-end.mp3',
  gameOver: '/sounds/game-over.mp3',
};

export function useSound() {
  const audioCache = useRef<Map<SoundType, HTMLAudioElement>>(new Map());

  const preloadSounds = useCallback(() => {
    Object.entries(SOUNDS).forEach(([type, url]) => {
      if (!audioCache.current.has(type as SoundType)) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audioCache.current.set(type as SoundType, audio);
      }
    });
  }, []);

  const playSound = useCallback((type: SoundType, volume: number = 0.5) => {
    try {
      let audio = audioCache.current.get(type);
      
      if (!audio) {
        audio = new Audio(SOUNDS[type]);
        audioCache.current.set(type, audio);
      }

      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(err => {
        console.warn(`Failed to play sound ${type}:`, err);
      });
    } catch (err) {
      console.warn(`Error playing sound ${type}:`, err);
    }
  }, []);

  return {
    playSound,
    preloadSounds,
  };
}
