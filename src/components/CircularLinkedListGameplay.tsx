import React from 'react';
import { LevelConfig } from '../types/game';
import { Level1Gameplay } from './Level1Gameplay';
import { Level2Gameplay } from './Level2Gameplay';
import { Level3Gameplay } from './Level3Gameplay';
import { Level4Gameplay } from './Level4Gameplay';
import { Level5Gameplay } from './Level5Gameplay';

interface CircularLinkedListGameplayProps {
  level: LevelConfig;
  onLevelComplete: (levelId: number, score: number) => void;
  onScoreUpdate: (delta: number) => void;
  onStreakUpdate: (streak: number) => void;
}

/**
 * CircularLinkedListGameplay Component
 * 
 * Houses and coordinates the 5-level interactive Circular Linked List educational game:
 * Level 1: Build the Circle
 * Level 2: Traverse the Circle
 * Level 3: Insert Into the Circle
 * Level 4: Delete From the Circle
 * Level 5: Master the Circle
 */
export const CircularLinkedListGameplay: React.FC<CircularLinkedListGameplayProps> = ({
  level,
  onLevelComplete,
  onScoreUpdate,
  onStreakUpdate,
}) => {
  switch (level.id) {
    case 1:
      return (
        <Level1Gameplay
          key="cll-lvl-1"
          onLevelComplete={onLevelComplete}
          onScoreUpdate={onScoreUpdate}
          onStreakUpdate={onStreakUpdate}
        />
      );
    case 2:
      return (
        <Level2Gameplay
          key="cll-lvl-2"
          onLevelComplete={onLevelComplete}
          onScoreUpdate={onScoreUpdate}
          onStreakUpdate={onStreakUpdate}
        />
      );
    case 3:
      return (
        <Level3Gameplay
          key="cll-lvl-3"
          onLevelComplete={onLevelComplete}
          onScoreUpdate={onScoreUpdate}
          onStreakUpdate={onStreakUpdate}
        />
      );
    case 4:
      return (
        <Level4Gameplay
          key="cll-lvl-4"
          onLevelComplete={onLevelComplete}
          onScoreUpdate={onScoreUpdate}
          onStreakUpdate={onStreakUpdate}
        />
      );
    case 5:
      return (
        <Level5Gameplay
          key="cll-lvl-5"
          onLevelComplete={onLevelComplete}
          onScoreUpdate={onScoreUpdate}
          onStreakUpdate={onStreakUpdate}
        />
      );
    default:
      return (
        <Level1Gameplay
          key={`cll-lvl-${level.id}`}
          onLevelComplete={onLevelComplete}
          onScoreUpdate={onScoreUpdate}
          onStreakUpdate={onStreakUpdate}
        />
      );
  }
};

// Backwards-compatible export alias for any legacy references
export const LinearSearchGameplay = CircularLinkedListGameplay;
