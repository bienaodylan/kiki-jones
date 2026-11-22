import React from 'react';

interface SafeAreaContainerProps {
  children: React.ReactNode;
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function SafeAreaContainer({
  children,
  top = false,
  bottom = false,
  className = '',
}: SafeAreaContainerProps) {
  return (
    <div
      className={`${top ? 'pt-safe' : ''} ${bottom ? 'pb-safe' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
