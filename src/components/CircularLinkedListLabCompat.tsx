import React from 'react';
import { CircularLinkedListLab } from './CircularLinkedListLab';

export interface CircularLinkedListLabProps {
  onExit?: () => void;
  onOpenTheory?: () => void;
}

export type LinearSearchLabProps = CircularLinkedListLabProps;

/**
 * Circular Linked List Lab compatibility wrapper
 */
export const CircularLinkedListLabCompat: React.FC<CircularLinkedListLabProps> = (props) => {
  return <CircularLinkedListLab {...props} />;
};

export const LinearSearchLab = CircularLinkedListLabCompat;

export default CircularLinkedListLabCompat;
