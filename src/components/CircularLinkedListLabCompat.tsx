import React from 'react';
import { CircularLinkedListLab } from './CircularLinkedListLab';

export interface LinearSearchLabProps {
  onExit?: () => void;
  onOpenTheory?: () => void;
}

/**
 * Replaced Linear Search Lab with Circular Linked List Lab
 */
export const LinearSearchLab: React.FC<LinearSearchLabProps> = (props) => {
  return <CircularLinkedListLab {...props} />;
};

export default LinearSearchLab;
