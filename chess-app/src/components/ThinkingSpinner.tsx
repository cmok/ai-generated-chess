import React from 'react';
import { SpinnerOverlay, SpinnerCard, Spinner, SpinnerText } from '../styles/GlobalStyles';

interface ThinkingSpinnerProps {
  visible: boolean;
}

export const ThinkingSpinner: React.FC<ThinkingSpinnerProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <SpinnerOverlay>
      <SpinnerCard>
        <Spinner />
        <SpinnerText>AI is thinking...</SpinnerText>
      </SpinnerCard>
    </SpinnerOverlay>
  );
};
