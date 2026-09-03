import React from 'react';
import { LevelConfig } from '../types/game';
import { Level1Gameplay } from './Level1Gameplay';
import { Level2Gameplay } from './Level2Gameplay';
import { Level3Gameplay } from './Level3Gameplay';
import { Level4Gameplay } from './Level4Gameplay';
import { Level5Gameplay } from './Level5Gameplay';

interface LinearSearchGameplayProps {
  level: LevelConfig;
  onLevelComplete: (levelId: number, score: number) => void;
  onScoreUpdate: (delta: number) => void;
  onStreakUpdate: (streak: number) => void;
}

export const LinearSearchGameplay: React.FC<LinearSearchGameplayProps> = ({
  level,
  onLevelComplete,
  onScoreUpdate,
  onStreakUpdate,
}) => {
  switch (level.id) {
    case 1:
      return (
        <Level1Gameplay
          key="ls-lvl-1"
          onLevelComplete={onLevelComplete}
          onScoreUpdate={onScoreUpdate}
          onStreakUpdate={onStreakUpdate}
        />
      );
    case 2:
      return (
        <Level2Gameplay
          key="ls-lvl-2"
          onLevelComplete={onLevelComplete}
          onScoreUpdate={onScoreUpdate}
          onStreakUpdate={onStreakUpdate}
        />
      );
    case 3:
      return (
        <Level3Gameplay
          key="ls-lvl-3"
          onLevelComplete={onLevelComplete}
          onScoreUpdate={onScoreUpdate}
          onStreakUpdate={onStreakUpdate}
        />
      );
    case 4:
      return (
        <Level4Gameplay
          key="ls-lvl-4"
          onLevelComplete={onLevelComplete}
          onScoreUpdate={onScoreUpdate}
          onStreakUpdate={onStreakUpdate}
        />
      );
    case 5:
      return (
        <Level5Gameplay
          key="ls-lvl-5"
          onLevelComplete={onLevelComplete}
          onScoreUpdate={onScoreUpdate}
          onStreakUpdate={onStreakUpdate}
        />
      );
    default:
      return (
        <Level1Gameplay
          key={`ls-lvl-${level.id}`}
          onLevelComplete={onLevelComplete}
          onScoreUpdate={onScoreUpdate}
          onStreakUpdate={onStreakUpdate}
        />
      );
  }
};
