import React from 'react';

interface AlertProps {
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'default', children }) => {
  const alertStyles =
    variant === 'destructive'
      ? 'bg-red-100 border border-red-400 text-red-700'
      : 'bg-blue-100 border border-blue-400 text-blue-700';

  return (
    <div className={`${alertStyles} px-4 py-3 rounded relative`} role="alert">
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm">{children}</p>
);
