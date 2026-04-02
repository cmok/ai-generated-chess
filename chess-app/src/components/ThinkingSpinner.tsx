import React from 'react';
import { ThinkingIndicator, MiniSpinner } from '../styles/GlobalStyles';

interface ThinkingSpinnerProps {
  visible: boolean;
}

export const ThinkingSpinner: React.FC<ThinkingSpinnerProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <ThinkingIndicator>
      <MiniSpinner />
      AI is thinking...
    </ThinkingIndicator>
  );
};
